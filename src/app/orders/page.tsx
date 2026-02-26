"use client";

import { useEffect, useState } from 'react';
import { api, Order } from '@/lib/api';
import { MoreVertical, Search, Filter, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import styles from '../inventory/page.module.css'; // Reusing inventory styles

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        fetchOrders();
    }, []);

    async function fetchOrders() {
        try {
            const data = await api.orders.list();
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await api.orders.updateStatus(id, newStatus);
            fetchOrders();
        } catch (e) {
            alert('Failed to update status');
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
            setOpenMenuId(null);
            return;
        }

        try {
            await api.orders.delete(id);
            setOpenMenuId(null);
            fetchOrders();
        } catch (error: any) {
            console.error("Delete failed", error);
            alert(`Failed to delete order: ${error.message || error.toString()}`);
        }
    };

    const filteredOrders = orders.filter(o =>
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.shipping_address.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1>Order Management</h1>
                    <p className="text-muted">View and manage customer orders</p>
                </div>
            </div>

            <div className={styles.controls}>
                <div className={`input ${styles.search} flex-center`} style={{ justifyContent: 'flex-start', paddingLeft: '3rem' }}>
                    <Search className={styles.searchIcon} size={18} />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                    />
                </div>
            </div>

            <div className={styles.tableContainer}>
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Loading orders...</div>
                ) : filteredOrders.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>No orders found.</div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>Order ID</th>
                                <th className={styles.th}>Date</th>
                                <th className={styles.th}>Customer</th>
                                <th className={styles.th}>Items</th>
                                <th className={styles.th}>Total</th>
                                <th className={styles.th}>Status</th>
                                <th className={styles.th}>Address</th>
                                <th className={styles.th}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className={styles.tr}>
                                    <td className={styles.td} style={{ fontSize: '0.8rem' }}>
                                        <Link href={`/orders/${order.id}`} className="link">
                                            {order.id.substring(0, 8).toUpperCase()}
                                        </Link>
                                    </td>
                                    <td className={styles.td} suppressHydrationWarning>{new Date(order.created_at).toLocaleDateString()}</td>
                                    <td className={styles.td}>{order.user_id.substring(0, 8)}...</td>
                                    <td className={styles.td}>
                                        {order.items?.map(item => (
                                            <div key={item.id} style={{ fontSize: '0.85rem' }}>
                                                {item.quantity}x {item.product?.name || 'Unknown Product'}
                                            </div>
                                        ))}
                                    </td>
                                    <td className={styles.td}>${order.total_amount.toFixed(2)}</td>
                                    <td className={styles.td}>
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            style={{
                                                padding: '4px',
                                                borderRadius: '4px',
                                                border: '1px solid var(--border)',
                                                background: order.status === 'PENDING' ? '#fff3cd' :
                                                    order.status === 'DELIVERED' ? '#d4edda' : 'white'
                                            }}
                                        >
                                            <option value="PENDING">Pending</option>
                                            <option value="PROCESSING">Processing</option>
                                            <option value="SHIPPED">Shipped</option>
                                            <option value="DELIVERED">Delivered</option>
                                            <option value="CANCELLED">Cancelled</option>
                                        </select>
                                    </td>
                                    <td className={styles.td}>
                                        <div className="flex-center" style={{ gap: '1rem' }}>
                                            <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {order.shipping_address}
                                            </span>
                                            <Link href={`/orders/${order.id}`} className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                                                View
                                            </Link>
                                        </div>
                                    </td>
                                    <td className={styles.tdMenu}>
                                        <button
                                            className={styles.menuButton}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenuId(openMenuId === order.id ? null : order.id!);
                                            }}
                                        >
                                            <MoreVertical size={18} />
                                        </button>

                                        {openMenuId === order.id && (
                                            <div className={styles.dropdown} onClick={(e) => e.stopPropagation()}>
                                                <Link
                                                    href={`/orders/${order.id}`}
                                                    className={styles.dropdownItem}
                                                    onClick={() => setOpenMenuId(null)}
                                                >
                                                    <Edit size={16} className={styles.dropdownIcon} />
                                                    Edit / View Details
                                                </Link>
                                                <div className={styles.dropdownDivider}></div>
                                                <button
                                                    className={`${styles.dropdownItem} ${styles.dropdownItemDelete}`}
                                                    onClick={(e) => handleDelete(order.id!, e)}
                                                >
                                                    <Trash2 size={16} className={styles.dropdownIcon} />
                                                    Delete Order
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
