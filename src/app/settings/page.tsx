"use client";

import { useState, useEffect } from 'react';
import { User, Bell, Shield, Palette, Save, LogIn, UserPlus, Mail, Lock, UserCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import styles from './page.module.css';

export default function SettingsPage() {
    const { user, loading: authLoading, isAdmin } = useAuth();

    // Auth Form State
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [authError, setAuthError] = useState('');

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

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setAuthError('');
        try {
            if (isLogin) {
                await api.auth.signIn(email, password);
            } else {
                await api.auth.signUp(email, password, fullName);
                alert('Account created! Please check your email for verification.');
            }
            window.location.reload();
        } catch (error: any) {
            setAuthError(error.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

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

    if (authLoading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
    }

    if (!user) {
        return (
            <div className="flex-center" style={{ minHeight: '70vh', flexDirection: 'column' }}>
                <div className={styles.section} style={{ maxWidth: '450px', width: '100%', padding: '2.5rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div className="flex-center" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', margin: '0 auto 1rem' }}>
                            {isLogin ? <LogIn size={30} /> : <UserPlus size={30} />}
                        </div>
                        <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                        <p className="text-muted">{isLogin ? 'Sign in to manage your account' : 'Join us to start posting and managing'}</p>
                    </div>

                    <form onSubmit={handleAuth}>
                        {!isLogin && (
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Full Name</label>
                                <div className="input flex-center" style={{ paddingLeft: '0.75rem', gap: '0.75rem' }}>
                                    <UserCircle size={18} className="text-muted" />
                                    <input
                                        type="text"
                                        placeholder="Enter your name"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                        style={{ background: 'transparent', border: 'none', width: '100%', color: 'inherit' }}
                                    />
                                </div>
                            </div>
                        )}
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Email Address</label>
                            <div className="input flex-center" style={{ paddingLeft: '0.75rem', gap: '0.75rem' }}>
                                <Mail size={18} className="text-muted" />
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={{ background: 'transparent', border: 'none', width: '100%', color: 'inherit' }}
                                />
                            </div>
                        </div>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Password</label>
                            <div className="input flex-center" style={{ paddingLeft: '0.75rem', gap: '0.75rem' }}>
                                <Lock size={18} className="text-muted" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    style={{ background: 'transparent', border: 'none', width: '100%', color: 'inherit' }}
                                />
                            </div>
                        </div>

                        {authError && <p style={{ color: '#ff4d4d', fontSize: '0.85rem', marginBottom: '1rem' }}>{authError}</p>}

                        <button className="btn btn-primary" style={{ width: '100%', height: '45px', marginTop: '1rem' }} disabled={loading}>
                            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                        <span className="text-muted">{isLogin ? "Don't have an account?" : "Already have an account?"} </span>
                        <button
                            className="btn-ghost"
                            style={{ padding: '2px 8px', color: 'var(--primary)', fontWeight: 600 }}
                            onClick={() => setIsLogin(!isLogin)}
                        >
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

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
                            <p className="text-muted" style={{ fontSize: '0.8rem' }}>Signed in as {user.email}</p>
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
