"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Search, User, Mail, Calendar, Shield } from 'lucide-react';
import styles from '../inventory/page.module.css';

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // In a real app we'd fetch from auth.users or a profiles table
                // For now we'll mock or fetch from orders to show active customers
                const orders = await api.orders.list();
                const uniqueUsers = Array.from(new Set(orders.map(o => o.user_id))).map(id => ({
                    id,
                    name: `Customer ${id.substring(0, 5)}`,
                    email: `user_${id.substring(0, 4)}@example.com`,
                    joined: '2023-10-01',
                    orders: orders.filter(o => o.user_id === id).length
                }));
                setUsers(uniqueUsers);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(u => u.id.includes(search) || u.email.includes(search));

    return (
        <div>
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1>User Management</h1>
                    <p className="text-muted">Manage your registered customers and their access.</p>
                </div>
            </div>

            <div className={styles.controls}>
                <div className={`input ${styles.search} flex-center`} style={{ justifyContent: 'flex-start', paddingLeft: '3rem' }}>
                    <Search className={styles.searchIcon} size={18} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                    />
                </div>
            </div>

            <div className={styles.tableContainer}>
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Loading users...</div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>Customer</th>
                                <th className={styles.th}>Email</th>
                                <th className={styles.th}>Joined</th>
                                <th className={styles.th}>Orders</th>
                                <th className={styles.th}>Role</th>
                                <th className={styles.th}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className={styles.tr}>
                                    <td className={styles.td}>
                                        <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                                                {user.id.substring(0, 1).toUpperCase()}
                                            </div>
                                            {user.name}
                                        </div>
                                    </td>
                                    <td className={styles.td}>{user.email}</td>
                                    <td className={styles.td}>{user.joined}</td>
                                    <td className={styles.td}>{user.orders} orders</td>
                                    <td className={styles.td}><span className="badge">Customer</span></td>
                                    <td className={styles.td}><span className="badge badge-success">Active</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
