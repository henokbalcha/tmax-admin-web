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
        images: [],
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

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
        if (!e.target.files || e.target.files.length === 0) return;

        try {
            setUploading(true);
            const file = e.target.files[0];
            const publicUrl = await api.products.uploadImage(file);

            setFormData(prev => {
                const currentImages = [...(prev.images || [])];
                let newImages: string[] = [];

                if (typeof index === 'number') {
                    // Place in specific slot, ensuring array is large enough
                    newImages = [...currentImages];
                    while (newImages.length <= index) newImages.push('');
                    newImages[index] = publicUrl;
                } else {
                    // Just append
                    newImages = [...currentImages, publicUrl].slice(0, 4);
                }

                return {
                    ...prev,
                    images: newImages,
                    // If no main image_url is set, set this one as main
                    image_url: prev.image_url || publicUrl
                };
            });
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const setAsMain = (url: string) => {
        setFormData(prev => ({ ...prev, image_url: url }));
    };

    const removeImage = (index: number) => {
        setFormData(prev => {
            const currentImages = prev.images || [];
            const removedUrl = currentImages[index];
            const newImages = currentImages.filter((_, i) => i !== index);

            return {
                ...prev,
                images: newImages,
                image_url: prev.image_url === removedUrl ? (newImages[0] || '') : prev.image_url
            };
        });
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

            // Filter out empty strings/holes from images array before saving
            const finalImages = (formData.images || []).filter(img => img && img.trim() !== '');

            await api.products.create({
                ...formData,
                images: finalImages
            } as Omit<Product, 'id'>);
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
                            <h2 className={styles.sectionTitle}>Media (up to 4)</h2>
                            <div className={styles.mediaGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                {[0, 1, 2, 3].map((idx) => (
                                    <div key={idx} className={styles.uploadArea} style={{ minHeight: '150px', padding: '1rem', position: 'relative' }}>
                                        <input
                                            type="file"
                                            id={`file-upload-${idx}`}
                                            hidden
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, idx)}
                                        />
                                        {formData.images && formData.images[idx] ? (
                                            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                                <img
                                                    src={formData.images[idx]}
                                                    alt={`Preview ${idx + 1}`}
                                                    style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px' }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(idx)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '-5px',
                                                        right: '-5px',
                                                        background: 'var(--error)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '50%',
                                                        width: '20px',
                                                        height: '20px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <X size={14} />
                                                </button>
                                                {formData.image_url === formData.images[idx] ? (
                                                    <span style={{
                                                        position: 'absolute',
                                                        bottom: '5px',
                                                        left: '5px',
                                                        background: 'var(--primary)',
                                                        color: 'white',
                                                        fontSize: '0.6rem',
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                    }}>
                                                        Main
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => setAsMain(formData.images![idx])}
                                                        style={{
                                                            position: 'absolute',
                                                            bottom: '5px',
                                                            left: '5px',
                                                            background: 'rgba(0,0,0,0.5)',
                                                            color: 'white',
                                                            fontSize: '0.6rem',
                                                            padding: '2px 6px',
                                                            borderRadius: '4px',
                                                            border: 'none',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        Set Main
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <label htmlFor={`file-upload-${idx}`} style={{ cursor: 'pointer', display: 'block', height: '100%' }}>
                                                <div className="flex-center" style={{ flexDirection: 'column', gap: '0.5rem', height: '100%' }}>
                                                    <div style={{ padding: '0.5rem', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%' }}>
                                                        <UploadCloud size={20} color="var(--primary)" />
                                                    </div>
                                                    <p style={{ fontSize: '0.75rem', fontWeight: 600 }}>Upload</p>
                                                </div>
                                            </label>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                                The first image will be used as the product thumbnail.
                            </p>
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
                                    <option value="Power Banks">Power Banks</option>
                                    <option value="Flash">Flash</option>
                                    <option value="Charger & Cable">Charger & Cable</option>
                                    <option value="Dividers">Dividers</option>
                                    <option value="Laptop Chargers">Laptop Chargers</option>
                                    <option value="Mobile batteries">Mobile batteries</option>
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
