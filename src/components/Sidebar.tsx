"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, PlusCircle, Settings, LogOut } from 'lucide-react';
import styles from './Sidebar.module.css';

const menuItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Add Product', href: '/products/add', icon: PlusCircle },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();

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
                <div className={styles.avatar}>A</div>
                <div className={styles.userInfo}>
                    <h4>Admin User</h4>
                    <p>admin@tmax.com</p>
                </div>
                <button className={styles.link} style={{ marginLeft: 'auto', padding: '0.5rem' }}>
                    <LogOut size={18} />
                </button>
            </div>
        </aside>
    );
}
