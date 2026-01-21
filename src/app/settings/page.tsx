"use client";

import { useState } from 'react';
import { User, Bell, Shield, Palette, Save } from 'lucide-react';
import styles from './page.module.css';

export default function SettingsPage() {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return document.documentElement.getAttribute('data-theme') || 'dark';
        }
        return 'dark';
    });

    const [stockThreshold, setStockThreshold] = useState(10);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    return (
        <div>
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1>Settings</h1>
                    <p className="text-muted">Manage your account and preferences</p>
                </div>
                <button className="btn btn-primary" onClick={() => alert('Settings saved!')}>
                    <Save size={18} />
                    Save Changes
                </button>
            </div>

            <div className={styles.container}>
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <User size={20} />
                        Profile Settings
                    </h2>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Full Name</label>
                        <input className="input" placeholder="Admin Name" defaultValue="TMAX Admin" />
                    </div>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Email Address</label>
                        <input className="input" placeholder="admin@tmax.com" defaultValue="admin@tmax.com" />
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <Shield size={20} />
                        Security
                    </h2>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Change Password</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <input className="input" type="password" placeholder="Current Password" />
                            <input className="input" type="password" placeholder="New Password" />
                        </div>
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

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <Bell size={20} />
                        Automation & Alerts
                    </h2>
                    <div className="flex-between" style={{ padding: '0.5rem 0' }}>
                        <span>Real-time Order Alerts</span>
                        <input type="checkbox" defaultChecked />
                    </div>
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
            </div>
        </div>
    );
}
