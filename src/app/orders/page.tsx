"use client";

import { useEffect, useState } from 'react';
import { api, Order } from '@/lib/api';
import { MoreVertical, Search, Filter } from 'lucide-react';
import styles from '../inventory/page.module.css'; // Reusing inventory styles

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    async function fetchOrders() {
        try {
            const data = await api.orders.list();
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await api.orders.updateStatus(id, newStatus);
            fetchOrders();
        } catch (e) {
            alert('Failed to update status');
        }
    };

    const filteredOrders = orders.filter(o =>
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.shipping_address.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1>Order Management</h1>
                    <p className="text-muted">View and manage customer orders</p>
                </div>
            </div>

            <div className={styles.controls}>
                <div className={`input ${styles.search} flex-center`} style={{ justifyContent: 'flex-start', paddingLeft: '3rem' }}>
                    <Search className={styles.searchIcon} size={18} />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                    />
                </div>
            </div>

            <div className={styles.tableContainer}>
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Loading orders...</div>
                ) : filteredOrders.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>No orders found.</div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>Order ID</th>
                                <th className={styles.th}>Date</th>
                                <th className={styles.th}>Customer</th>
                                <th className={styles.th}>Items</th>
                                <th className={styles.th}>Total</th>
                                <th className={styles.th}>Status</th>
                                <th className={styles.th}>Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className={styles.tr}>
                                    <td className={styles.td} style={{ fontSize: '0.8rem' }}>{order.id.substring(0, 8)}...</td>
                                    <td className={styles.td}>{new Date(order.created_at).toLocaleDateString()}</td>
                                    <td className={styles.td}>{order.user_id.substring(0, 8)}...</td>
                                    <td className={styles.td}>
                                        {order.items?.map(item => (
                                            <div key={item.id} style={{ fontSize: '0.85rem' }}>
                                                {item.quantity}x {item.product?.name || 'Unknown Product'}
                                            </div>
                                        ))}
                                    </td>
                                    <td className={styles.td}>${order.total_amount.toFixed(2)}</td>
                                    <td className={styles.td}>
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            style={{
                                                padding: '4px',
                                                borderRadius: '4px',
                                                border: '1px solid var(--border)',
                                                background: order.status === 'PENDING' ? '#fff3cd' :
                                                    order.status === 'DELIVERED' ? '#d4edda' : 'white'
                                            }}
                                        >
                                            <option value="PENDING">Pending</option>
                                            <option value="PROCESSING">Processing</option>
                                            <option value="SHIPPED">Shipped</option>
                                            <option value="DELIVERED">Delivered</option>
                                            <option value="CANCELLED">Cancelled</option>
                                        </select>
                                    </td>
                                    <td className={styles.td} style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {order.shipping_address}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
