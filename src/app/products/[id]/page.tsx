"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, Save, Loader2, ArrowLeft, Trash2 } from 'lucide-react';
import styles from '../add/page.module.css'; // Reusing styles from add page
import Link from 'next/link';
import { api, Product } from '@/lib/api';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    // Unwrap params using React.use()
    const { id } = use(params);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        description: '',
        price: 0,
        original_price: 0,
        stock: 0,
        sku: '',
        category: 'Electronics',
        status: 'Active',
        brand: 'TMAX',
        image_url: '',
        rating: 0,
        review_count: 0
    });

    useEffect(() => {
        async function loadProduct() {
            try {
                const product = await api.products.getById(id);
                setFormData(product);
            } catch (error) {
                console.error('Failed to load product:', error);
                alert('Failed to load product details');
                router.push('/inventory');
            } finally {
                setFetching(false);
            }
        }
        loadProduct();
    }, [id, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value
        }));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        try {
            setUploading(true);
            const file = e.target.files[0];
            const publicUrl = await api.products.uploadImage(file);
            setFormData(prev => ({ ...prev, image_url: publicUrl }));
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (!formData.name || !formData.price) {
                alert('Please fill in name and price');
                return;
            }

            await api.products.update(id, formData);
            router.push('/inventory');
        } catch (error: any) {
            console.error('Failed to update product:', error);
            alert(`Failed to update product: ${error.message || error.toString()}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

        try {
            setLoading(true);
            await api.products.delete(id);
            router.push('/inventory');
        } catch (error: any) {
            console.error('Failed to delete product:', error);
            alert(`Failed to delete product: ${error.message || error.toString()}`);
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex-center" style={{ height: '50vh' }}>
                <Loader2 className="animate-spin" size={32} color="var(--primary)" />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit}>
                <div className={styles.header}>
                    <div>
                        <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <Link href="/inventory" className="btn btn-ghost" style={{ padding: '0.25rem' }}>
                                <ArrowLeft size={20} />
                            </Link>
                            <h1 style={{ marginBottom: 0 }}>Edit Product</h1>
                        </div>
                        <p className="text-muted" style={{ marginLeft: '2.5rem' }}>Update product details and inventory</p>
                    </div>
                    <div className="flex-center" style={{ gap: '1rem' }}>
                        <button type="button" onClick={handleDelete} className="btn btn-ghost" style={{ color: 'var(--error)' }}>
                            <Trash2 size={18} />
                            Delete
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading || uploading}>
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                <div className={styles.formGrid}>
                    {/* Reusing the exact same form layout as add/page.tsx */}
                    <div>
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>General Information</h2>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Product Name</label>
                                <input
                                    className="input"
                                    name="name"
                                    placeholder="e.g. TMAX Smart TV 55"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Brand</label>
                                <input
                                    className="input"
                                    name="brand"
                                    placeholder="e.g. Samsung, LG"
                                    value={formData.brand}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Description</label>
                                <textarea
                                    className="input"
                                    name="description"
                                    rows={6}
                                    placeholder="Product description and features..."
                                    style={{ resize: 'vertical' }}
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Media</h2>
                            <div className={styles.uploadArea}>
                                <input
                                    type="file"
                                    id="file-upload"
                                    hidden
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'block' }}>
                                    <div className="flex-center" style={{ marginBottom: '1rem', flexDirection: 'column', gap: '1rem' }}>
                                        {formData.image_url ? (
                                            <img src={formData.image_url} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} />
                                        ) : (
                                            <div style={{ padding: '1rem', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%' }}>
                                                {uploading ? <Loader2 className="animate-spin" size={32} color="var(--primary)" /> : <UploadCloud size={32} color="var(--primary)" />}
                                            </div>
                                        )}
                                        <div>
                                            <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                                                {uploading ? 'Uploading...' : formData.image_url ? 'Click to change image' : 'Click to upload image'}
                                            </p>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>SVG, PNG, JPG or GIF</p>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Pricing & Stock</h2>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Base Price ($)</label>
                                <input
                                    className="input"
                                    type="number"
                                    name="price"
                                    placeholder="0.00"
                                    value={formData.price}
                                    onChange={handleChange}
                                    step="0.01"
                                    required
                                />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Original/Compare Price ($)</label>
                                <input
                                    className="input"
                                    type="number"
                                    name="original_price"
                                    placeholder="0.00"
                                    value={formData.original_price}
                                    onChange={handleChange}
                                    step="0.01"
                                />
                            </div>

                            <div className={styles.row}>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Stock</label>
                                    <input
                                        className="input"
                                        type="number"
                                        name="stock"
                                        placeholder="0"
                                        value={formData.stock}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>SKU</label>
                                    <input
                                        className="input"
                                        name="sku"
                                        placeholder="TMX-..."
                                        value={formData.sku}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Organization</h2>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Category</label>
                                <select
                                    className="input"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                >
                                    <option>Electronics</option>
                                    <option>Home Appliances</option>
                                    <option>Accessories</option>
                                    <option>Computers</option>
                                    <option>Audio</option>
                                    <option>Wearables</option>
                                </select>
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Status</label>
                                <select
                                    className="input"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option>Draft</option>
                                    <option>Active</option>
                                    <option>Archived</option>
                                    <option>Out of Stock</option>
                                    <option>Low Stock</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
