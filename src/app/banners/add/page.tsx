"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import Link from 'next/link';

function AddBannerForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        subtitle: 'LIMITED OFFER',
        discount_text: '',
        image_url: '',
        product_id: '',
        active: true
    });

    useEffect(() => {
        const title = searchParams.get('title');
        const image = searchParams.get('image');

        if (title || image) {
            setFormData(prev => ({
                ...prev,
                title: title || '',
                image_url: image || ''
            }));
        }

        // Fetch products for the dropdown
        async function fetchProducts() {
            try {
                const data = await api.products.list();
                setProducts(data || []);
            } catch (error) {
                console.error('Failed to fetch products', error);
            }
        }
        fetchProducts();
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.banners.create(formData as any);
            router.push('/banners');
        } catch (error) {
            console.error(error);
            alert('Failed to create banner');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setLoading(true);
            const url = await api.products.uploadImage(file); // Reusing product image upload bucket
            setFormData(prev => ({ ...prev, image_url: url }));
        } catch (error) {
            console.error('Upload failed', error);
            alert('Failed to upload image');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div className="flex-center" style={{ gap: '1rem' }}>
                    <Link href="/banners" className="btn btn-ghost">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1>Add New Banner</h1>
                        <p className="text-muted">Create a promotional banner</p>
                    </div>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={loading || !formData.title}
                >
                    <Save size={18} />
                    {loading ? 'Saving...' : 'Save Banner'}
                </button>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                <div style={{ display: 'grid', gap: '1.5rem' }}>

                    {/* Image Upload */}
                    <div>
                        <label className="label">Banner Image</label>
                        <div
                            className="flex-center"
                            style={{
                                height: '200px',
                                border: '2px dashed var(--border)',
                                borderRadius: '0.5rem',
                                background: formData.image_url ? `url(${formData.image_url}) center/cover` : 'var(--bg-main)',
                                cursor: 'pointer',
                                position: 'relative'
                            }}
                            onClick={() => document.getElementById('banner-upload')?.click()}
                        >
                            {!formData.image_url && (
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <Upload size={32} style={{ marginBottom: '0.5rem' }} />
                                    <div>Click to upload image</div>
                                </div>
                            )}
                            <input
                                id="banner-upload"
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="label">Title</label>
                            <input
                                className="input"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Power Banks Sale"
                            />
                        </div>
                        <div>
                            <label className="label">Subtitle</label>
                            <input
                                className="input"
                                value={formData.subtitle}
                                onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                                placeholder="e.g. LIMITED OFFER"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="label">Discount Text</label>
                        <input
                            className="input"
                            value={formData.discount_text}
                            onChange={e => setFormData({ ...formData, discount_text: e.target.value })}
                            placeholder="e.g. Up to 40% Off"
                        />
                    </div>

                    <div>
                        <label className="label">Link to Product</label>
                        <select
                            className="input"
                            value={formData.product_id}
                            onChange={e => setFormData({ ...formData, product_id: e.target.value })}
                        >
                            <option value="">No Product Linked</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.brand})</option>
                            ))}
                        </select>
                        <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                            When clicked, the banner will navigate the user to this product.
                        </p>
                    </div>

                    <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                        <input
                            type="checkbox"
                            checked={formData.active}
                            onChange={e => setFormData({ ...formData, active: e.target.checked })}
                            id="active-check"
                        />
                        <label htmlFor="active-check">Set as Active Immediately</label>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AddBannerPage() {
    return (
        <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
            <AddBannerForm />
        </Suspense>
    );
}
