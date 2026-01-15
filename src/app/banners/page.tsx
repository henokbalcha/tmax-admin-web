"use client";

import { useEffect, useState } from 'react';
import { api, Banner } from '@/lib/api';
import { Plus, Trash, Check } from 'lucide-react';
import Link from 'next/link';
import styles from '../inventory/page.module.css';

export default function BannersPage() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBanners();
    }, []);

    async function fetchBanners() {
        try {
            const data = await api.banners.list();
            setBanners(data || []);
        } catch (error) {
            console.error('Error fetching banners:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this banner?')) return;
        try {
            await api.banners.delete(id);
            fetchBanners();
        } catch (e) {
            alert('Failed to delete');
        }
    };

    const handleSetActive = async (id: string) => {
        try {
            await api.banners.setActive(id);
            fetchBanners();
        } catch (e) {
            alert('Failed to set active');
        }
    }

    return (
        <div>
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1>Banners</h1>
                    <p className="text-muted">Manage app home screen banners</p>
                </div>
                <Link href="/banners/add" className="btn btn-primary">
                    <Plus size={18} />
                    Add Banner
                </Link>
            </div>

            <div className={styles.tableContainer}>
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
                ) : banners.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>No banners found.</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', padding: '1rem' }}>
                        {banners.map(banner => (
                            <div key={banner.id} style={{
                                border: '1px solid var(--border)',
                                borderRadius: '1rem',
                                overflow: 'hidden',
                                position: 'relative'
                            }}>
                                <div style={{ height: '150px', background: '#333', position: 'relative' }}>
                                    {banner.image_url && (
                                        <img src={banner.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    )}
                                    {banner.active && (
                                        <div style={{
                                            position: 'absolute', top: 10, right: 10,
                                            background: '#4CAF50', color: 'white',
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'
                                        }}>
                                            ACTIVE
                                        </div>
                                    )}
                                </div>
                                <div style={{ padding: '1rem' }}>
                                    <h3 style={{ margin: 0 }}>{banner.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{banner.subtitle}</p>
                                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                        {!banner.active && (
                                            <button
                                                className="btn btn-ghost"
                                                onClick={() => handleSetActive(banner.id!)}
                                                style={{ color: '#4CAF50', borderColor: '#4CAF50' }}
                                            >
                                                <Check size={16} /> Set Active
                                            </button>
                                        )}
                                        <button
                                            className="btn btn-ghost"
                                            onClick={() => handleDelete(banner.id!)}
                                            style={{ color: '#ff4444' }}
                                        >
                                            <Trash size={16} /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
