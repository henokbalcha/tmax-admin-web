"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, PlusCircle, Settings, LogOut, ShoppingCart, Image, Users } from 'lucide-react';
import styles from './Sidebar.module.css';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

const menuItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Orders', href: '/orders', icon: ShoppingCart },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Banners', href: '/banners', icon: Image },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Add Product', href: '/products/add', icon: PlusCircle },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, isAdmin } = useAuth();

    const handleSignOut = async () => {
        try {
            await api.auth.signOut();
            window.location.reload();
        } catch (error) {
            console.error('Failed to sign out:', error);
        }
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                TMAX ELECTRONICS
            </div>

            <nav className={styles.nav}>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.link} ${isActive ? styles.active : ''}`}
                        >
                            <item.icon className={styles.icon} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className={styles.footer}>
                <div className={styles.avatar}>
                    {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className={styles.userInfo}>
                    <h4>{user?.user_metadata?.full_name || (isAdmin ? 'Admin User' : 'Customer')}</h4>
                    <p>{user?.email || 'Not signed in'}</p>
                </div>
                {user && (
                    <button
                        className={styles.link}
                        style={{ marginLeft: 'auto', padding: '0.5rem' }}
                        onClick={handleSignOut}
                        title="Sign Out"
                    >
                        <LogOut size={18} />
                    </button>
                )}
            </div>
        </aside>
    );
}
