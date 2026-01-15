"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, Save, X, Loader2 } from 'lucide-react';
import styles from './page.module.css';
import Link from 'next/link';
import { api, Product } from '@/lib/api';

export default function AddProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
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
            // Ensure required fields
            if (!formData.name || !formData.price) {
                alert('Please fill in name and price');
                return;
            }

            await api.products.create(formData as Omit<Product, 'id'>);
            router.push('/inventory');
        } catch (error: any) {
            console.error('Failed to create product:', error);
            alert(`Failed to create product: ${error.message || error.toString()}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit}>
                <div className={styles.header}>
                    <div>
                        <h1 style={{ marginBottom: '0.5rem' }}>Add New Product</h1>
                        <p className="text-muted">Create a new product in your inventory</p>
                    </div>
                    <div className="flex-center" style={{ gap: '1rem' }}>
                        <Link href="/inventory" className="btn btn-ghost">Cancel</Link>
                        <button type="submit" className="btn btn-primary" disabled={loading || uploading}>
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            {loading ? 'Saving...' : 'Save Product'}
                        </button>
                    </div>
                </div>

                <div className={styles.formGrid}>
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
