"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, Filter, Download, Plus, Search, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';
import { api, Product } from '@/lib/api';

export default function InventoryPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    // Close menu when clicking outside or scrolling
    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    async function fetchProducts() {
        try {
            const data = await api.products.list();
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    }



    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Delete this product?')) {
            setOpenMenuId(null);
            return;
        }

        try {
            await api.products.delete(id);
            setOpenMenuId(null);
            fetchProducts();
        } catch (error: any) {
            console.error("Delete failed", error);
            let errorMessage = error.message || error.toString();
            if (errorMessage.includes('order_items')) {
                errorMessage = "This product cannot be deleted because it exists in past orders. Try archiving it instead.";
            }
            alert(`Failed to delete product: ${errorMessage}`);
        }
    };

    const handleExport = () => {
        const headers = ['Name', 'SKU', 'Category', 'Price', 'Stock', 'Status'];
        const csvContent = [
            headers.join(','),
            ...filteredProducts.map(p => [
                `"${p.name.replace(/"/g, '""')}"`,
                p.sku || '',
                p.category,
                p.price,
                p.stock || 0,
                p.status
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `inventory_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.sku?.toLowerCase().includes(search.toLowerCase());

        let matchesStatus = false;
        if (statusFilter === 'All') {
            // By default show everything EXCEPT Archived
            matchesStatus = p.status !== 'Archived';
        } else {
            matchesStatus = p.status === statusFilter;
        }

        return matchesSearch && matchesStatus;
    });

    return (
        <div>
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1>Inventory Management</h1>
                    <p className="text-muted">Manage your products and stocks</p>
                </div>
                <div className="flex-center" style={{ gap: '1rem' }}>
                    <button className="btn btn-ghost" onClick={handleExport}>
                        <Download size={18} />
                        Export
                    </button>
                    <Link href="/products/add" className="btn btn-primary">
                        <Plus size={18} />
                        Add Product
                    </Link>
                </div>
            </div>

            <div className={styles.controls}>
                <div className={`input ${styles.search} flex-center`} style={{ justifyContent: 'flex-start', paddingLeft: '3rem' }}>
                    <Search className={styles.searchIcon} size={18} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: 'var(--text-main)',
                            width: '100%'
                        }}
                    />
                </div>

                <div className="flex-center" style={{ gap: '1rem' }}>
                    <select
                        className="input"
                        style={{ width: 'auto', appearance: 'auto', paddingRight: '2rem' }}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Active</option>
                        <option value="Active">Active Only</option>
                        <option value="Draft">Draft</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Out of Stock">Out of Stock</option>
                        <option value="Archived">Archived</option>
                    </select>
                </div>
            </div>

            <div className={styles.tableContainer}>
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading inventory...</div>
                ) : filteredProducts.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No products found.</div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th className={styles.th} style={{ width: '40px' }}><input type="checkbox" /></th>
                                <th className={styles.th}>Product</th>
                                <th className={styles.th}>SKU</th>
                                <th className={styles.th}>Category</th>
                                <th className={styles.th}>Price</th>
                                <th className={styles.th}>Stock</th>
                                <th className={styles.th}>Status</th>
                                <th className={styles.th}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className={styles.tr}>
                                    <td className={styles.td}><input type="checkbox" /></td>
                                    <td className={styles.td}>
                                        <Link href={`/products/${product.id}`} className={styles.productCell} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            {product.image_url ? (
                                                <img src={product.image_url} alt={product.name} className={styles.productImage} />
                                            ) : (
                                                <div className={styles.productImage}></div>
                                            )}
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{product.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{product.brand}</div>
                                            </div>
                                        </Link>
                                    </td>
                                    <td className={styles.td}>{product.sku || '-'}</td>
                                    <td className={styles.td}>{product.category}</td>
                                    <td className={styles.td}>${product.price}</td>
                                    <td className={styles.td}>
                                        <span style={{
                                            color: (product.stock || 0) === 0 ? 'var(--error)' : (product.stock || 0) < 20 ? 'var(--warning)' : 'var(--success)',
                                            fontWeight: 600
                                        }}>
                                            {product.stock || 0} in stock
                                        </span>
                                    </td>
                                    <td className={styles.td}>
                                        <span className={`badge ${product.status === 'Active' ? 'badge-success' :
                                            product.status === 'Low Stock' ? 'badge-warning' :
                                                'badge-error'
                                            }`}>
                                            {product.status || 'Draft'}
                                        </span>
                                    </td>
                                    <td className={styles.tdMenu}>
                                        <button
                                            className={styles.menuButton}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenuId(openMenuId === product.id ? null : product.id!);
                                            }}
                                        >
                                            <MoreVertical size={18} />
                                        </button>

                                        {openMenuId === product.id && (
                                            <div className={styles.dropdown} onClick={(e) => e.stopPropagation()}>
                                                <Link
                                                    href={`/products/${product.id}`}
                                                    className={styles.dropdownItem}
                                                    onClick={() => setOpenMenuId(null)}
                                                >
                                                    <Edit size={16} className={styles.dropdownIcon} />
                                                    Edit Product
                                                </Link>
                                                <button
                                                    className={styles.dropdownItem}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/banners/add?productId=${product.id}&title=${encodeURIComponent(product.name)}&image=${encodeURIComponent(product.image_url)}`);
                                                        setOpenMenuId(null);
                                                    }}
                                                >
                                                    <Filter size={16} className={styles.dropdownIcon} />
                                                    Promote to Banner
                                                </button>
                                                <div className={styles.dropdownDivider}></div>
                                                <button
                                                    className={`${styles.dropdownItem} ${styles.dropdownItemDelete}`}
                                                    onClick={(e) => handleDelete(product.id!, e)}
                                                >
                                                    <Trash2 size={16} className={styles.dropdownIcon} />
                                                    Delete Item
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <div className={styles.pagination}>
                    <span>Showing {filteredProducts.length} products</span>
                    <div className="flex-center" style={{ gap: '0.5rem' }}>
                        <button className="btn btn-ghost" disabled>Previous</button>
                        <button className="btn btn-ghost">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
