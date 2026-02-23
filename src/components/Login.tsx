"use client";

import React, { useState } from 'react';
import { LogIn, UserPlus, Mail, Lock, UserCircle } from 'lucide-react';
import { api } from '@/lib/api';
import styles from '@/app/settings/page.module.css';

export default function Login({ forcedError }: { forcedError?: string }) {
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

    const handleGoogleLogin = async () => {
        setLoading(true);
        setAuthError('');
        try {
            await api.auth.signInWithGoogle();
        } catch (error: any) {
            setAuthError(error.message || 'Google Auth failed');
            setLoading(false);
        }
    };

    const displayError = forcedError || authError;

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

                    {displayError && <p style={{ color: '#ff4d4d', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>{displayError}</p>}

                    <button className="btn btn-primary" style={{ width: '100%', height: '45px', marginTop: '1rem' }} disabled={loading}>
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>

                <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-color)', opacity: 0.2 }}></div>
                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-color)', opacity: 0.2 }}></div>
                </div>

                <button
                    className="btn-ghost flex-center"
                    style={{ width: '100%', gap: '0.75rem', border: '1px solid var(--border-color)', padding: '10px' }}
                    onClick={handleGoogleLogin}
                    disabled={loading}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </button>

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
