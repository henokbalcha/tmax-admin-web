"use client";

import { useState } from 'react';
import { User, Bell, Shield, Palette, Save } from 'lucide-react';
import styles from './page.module.css';

export default function SettingsPage() {
    return (
        <div>
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1>Settings</h1>
                    <p className="text-muted">Manage your account and preferences</p>
                </div>
                <button className="btn btn-primary">
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
                        <input className="input" type="password" placeholder="Current Password" />
                        <input className="input" type="password" placeholder="New Password" style={{ marginTop: '0.5rem' }} />
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <Palette size={20} />
                        Appearance
                    </h2>
                    <div className="flex-between" style={{ padding: '0.5rem 0' }}>
                        <span>Dark Mode</span>
                        <input type="checkbox" defaultChecked />
                    </div>
                    <div className="flex-between" style={{ padding: '0.5rem 0' }}>
                        <span>Compact Mode</span>
                        <input type="checkbox" />
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <Bell size={20} />
                        Notifications
                    </h2>
                    <div className="flex-between" style={{ padding: '0.5rem 0' }}>
                        <span>Order Alerts</span>
                        <input type="checkbox" defaultChecked />
                    </div>
                    <div className="flex-between" style={{ padding: '0.5rem 0' }}>
                        <span>Low Stock Warnings</span>
                        <input type="checkbox" defaultChecked />
                    </div>
                </div>
            </div>
        </div>
    );
}
