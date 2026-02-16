"use client";

import { useState, useEffect } from 'react';
import { User, Bell, Shield, Palette, Save, Lock } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import styles from './page.module.css';

export default function SettingsPage() {
    const { user, isAdmin } = useAuth();

    // Settings State
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return document.documentElement.getAttribute('data-theme') || 'dark';
        }
        return 'dark';
    });
    const [stockThreshold, setStockThreshold] = useState(10);
    const [loading, setLoading] = useState(false);

    // Profile State
    const [profileName, setProfileName] = useState('');
    const [profileEmail, setProfileEmail] = useState('');

    useEffect(() => {
        if (user) {
            setProfileName(user.user_metadata?.full_name || '');
            setProfileEmail(user.email || '');

            const loadSettings = async () => {
                try {
                    const value = await api.settings.get('low_stock_threshold');
                    if (value) setStockThreshold(parseInt(value));
                } catch (e) {
                    console.error("Failed to load settings", e);
                }
            };
            loadSettings();
        }
    }, [user]);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const handleSaveSettings = async () => {
        setLoading(true);
        try {
            await api.settings.set('low_stock_threshold', stockThreshold.toString());

            if (profileName !== user?.user_metadata?.full_name) {
                await api.auth.updateProfile({ full_name: profileName });
            }

            alert('Settings saved successfully!');
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('Failed to save settings.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1>Settings</h1>
                    <p className="text-muted">Manage your account and preferences</p>
                </div>
                <button className="btn btn-primary" onClick={handleSaveSettings} disabled={loading}>
                    <Save size={18} />
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className={styles.container}>
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <User size={20} />
                        Profile Settings
                        {isAdmin && <span className="badge" style={{ marginLeft: 'auto', background: 'var(--primary)', color: 'white' }}>Admin</span>}
                    </h2>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Full Name</label>
                        <input
                            className="input"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            placeholder="Enter your name"
                        />
                    </div>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Email Address</label>
                        <input
                            className="input"
                            value={profileEmail}
                            disabled
                            style={{ opacity: 0.6, cursor: 'not-allowed' }}
                        />
                        <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Email cannot be changed.</p>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <Shield size={20} />
                        Post & Content Preferences
                    </h2>
                    <div className="flex-between" style={{ padding: '0.5rem 0' }}>
                        <span>Allow Public Posts</span>
                        <input type="checkbox" defaultChecked />
                    </div>
                    <div className="flex-between" style={{ padding: '0.5rem 0' }}>
                        <span>Auto-publish your posts</span>
                        <input type="checkbox" />
                    </div>
                    <div className="flex-between" style={{ padding: '0.5rem 0' }}>
                        <span>Notify on post interactions</span>
                        <input type="checkbox" defaultChecked />
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <Palette size={20} />
                        Appearance
                    </h2>
                    <div className="flex-between" style={{ padding: '0.5rem 0' }}>
                        <span>Current Theme: <strong style={{ textTransform: 'uppercase' }}>{theme}</strong></span>
                        <button className="btn btn-ghost" onClick={toggleTheme} style={{ padding: '0.5rem 1rem' }}>
                            Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
                        </button>
                    </div>
                </div>

                {isAdmin && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <Bell size={20} />
                            Admin Alerts (Inventory)
                        </h2>
                        <div className="flex-between" style={{ padding: '1rem 0' }}>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: 600 }}>Low Stock threshold</p>
                                <p className="text-muted" style={{ fontSize: '0.8rem' }}>Trigger alerts when units drop below this number.</p>
                            </div>
                            <input
                                type="number"
                                className="input"
                                style={{ width: '80px', textAlign: 'center' }}
                                value={stockThreshold}
                                onChange={(e) => setStockThreshold(parseInt(e.target.value))}
                            />
                        </div>
                        <div className="flex-between" style={{ padding: '0.5rem 0' }}>
                            <span>Email Admin on Low Stock</span>
                            <input type="checkbox" defaultChecked />
                        </div>
                    </div>
                )}

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <Shield size={20} />
                        Session Management
                    </h2>
                    <div className="flex-between" style={{ padding: '0.5rem 0' }}>
                        <div>
                            <p style={{ fontWeight: 600 }}>Active Account</p>
                            <p className="text-muted" style={{ fontSize: '0.8rem' }}>Signed in as {user?.email}</p>
                        </div>
                        <button
                            className="btn btn-ghost"
                            style={{ color: 'var(--error)' }}
                            onClick={async () => {
                                await api.auth.signOut();
                                window.location.reload();
                            }}
                        >
                            Sign Out
                        </button>
                    </div>
                </div>

                <div className={styles.section} style={{ border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <h2 className={styles.sectionTitle} style={{ color: 'var(--error)' }}>
                        <Lock size={20} />
                        Danger Zone
                    </h2>
                    <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                        Once you delete your account, there is no going back.
                    </p>
                    <button className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', width: '100%' }}>
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
}
