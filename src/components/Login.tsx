"use client";

import React, { useState } from 'react';
import { LogIn, UserPlus, Mail, Lock, UserCircle } from 'lucide-react';
import { api } from '@/lib/api';
import styles from '@/app/settings/page.module.css';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [authError, setAuthError] = useState('');
    const [loading, setLoading] = useState(false);

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

    return (
        <div className="flex-center" style={{ minHeight: '100vh', width: '100%', background: 'var(--bg-app)', position: 'fixed', top: 0, left: 0, zIndex: 9999 }}>
            <div className={styles.section} style={{ maxWidth: '450px', width: '100%', padding: '2.5rem', boxShadow: 'var(--shadow-lg)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div className="flex-center" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', margin: '0 auto 1rem' }}>
                        {isLogin ? <LogIn size={30} /> : <UserPlus size={30} />}
                    </div>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{isLogin ? 'T-MAX Admin' : 'Join T-MAX'}</h2>
                    <p className="text-muted">{isLogin ? 'Sign in to access control center' : 'Create an account to get started'}</p>
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

                    {authError && <p style={{ color: '#ff4d4d', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>{authError}</p>}

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
