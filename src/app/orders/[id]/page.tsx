"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, Order } from '@/lib/api';
import { ArrowLeft, Package, User, MapPin, CreditCard, Clock, Save, Printer, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function OrderDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (id) fetchOrder();
    }, [id]);

    async function fetchOrder() {
        try {
            // Reusing list logic but filtering for ID or we can add a specific API for fetching single order with items
            const allOrders = await api.orders.list();
            const found = allOrders.find(o => o.id === id);
            setOrder(found || null);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const handleStatusChange = async (newStatus: string) => {
        if (!order) return;
        setUpdating(true);
        try {
            await api.orders.updateStatus(order.id, newStatus);
            setOrder({ ...order, status: newStatus });
        } catch (e) {
            alert('Update failed');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
    if (!order) return <div style={{ padding: '2rem', textAlign: 'center' }}>Order not found.</div>;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div className="flex-center" style={{ gap: '1rem' }}>
                    <Link href="/orders" className="btn btn-ghost">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1>Order #{order.id.substring(0, 8).toUpperCase()}</h1>
                        <p className="text-muted" suppressHydrationWarning>Placed on {new Date(order.created_at).toLocaleString()}</p>
                    </div>
                </div>
                <div className="flex-center" style={{ gap: '1rem' }}>
                    <button
                        className="btn btn-ghost"
                        style={{ color: 'var(--error)' }}
                        onClick={async () => {
                            if (confirm('Delete this order?')) {
                                try {
                                    await api.orders.delete(order.id);
                                    router.push('/orders');
                                } catch (e) {
                                    alert('Delete failed');
                                }
                            }
                        }}
                    >
                        <Trash2 size={18} />
                        Delete Order
                    </button>
                    <button className="btn btn-ghost" onClick={() => window.print()}>
                        <Printer size={18} />
                        Print Invoice
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Order Items */}
                    <div className="card">
                        <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <Package size={20} />
                            <h2 style={{ fontSize: '1.25rem' }}>Order Items</h2>
                        </div>
                        <div style={{ borderTop: '1px solid var(--border)' }}>
                            {order.items?.map((item) => (
                                <div key={item.id} style={{ display: 'flex', gap: '1rem', padding: '1.5rem 0', borderBottom: '1px solid var(--border)' }}>
                                    <img
                                        src={item.product?.image_url || '/placeholder.png'}
                                        alt={item.product?.name}
                                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '0.5rem' }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{item.product?.name}</h3>
                                        <p className="text-muted" style={{ fontSize: '0.875rem' }}>SKU: {item.product?.sku || 'N/A'}</p>
                                        <div className="flex-between" style={{ marginTop: '0.5rem' }}>
                                            <span>${item.price_at_purchase.toFixed(2)} x {item.quantity}</span>
                                            <span style={{ fontWeight: 600 }}>${(item.price_at_purchase * item.quantity).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div className="flex-between">
                                <span className="text-muted">Subtotal</span>
                                <span>${order.total_amount.toFixed(2)}</span>
                            </div>
                            <div className="flex-between">
                                <span className="text-muted">Shipping</span>
                                <span style={{ color: 'var(--success)' }}>Free</span>
                            </div>
                            <div className="flex-between" style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                                <span>Total</span>
                                <span>${order.total_amount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping & Payment */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div className="card">
                            <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                <MapPin size={20} />
                                <h2 style={{ fontSize: '1.1rem' }}>Shipping Address</h2>
                            </div>
                            <p style={{ lineHeight: 1.6 }}>{order.shipping_address}</p>
                        </div>
                        <div className="card">
                            <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                <CreditCard size={20} />
                                <h2 style={{ fontSize: '1.1rem' }}>Payment Method</h2>
                            </div>
                            <p style={{ textTransform: 'uppercase', fontWeight: 600 }}>{order.payment_method}</p>
                            <div style={{ marginTop: '0.5rem' }}>
                                <span className={`badge ${order.status === 'PENDING' ? 'badge-warning' : 'badge-success'}`}>
                                    {order.status === 'PENDING' ? 'Unverified' : 'Verified'}
                                </span>
                            </div>

                            {order.receipt_url && (
                                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                    <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                                        <p className="text-muted" style={{ fontSize: '0.875rem' }}>Payment Receipt</p>
                                        <a
                                            href={order.receipt_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ fontSize: '0.8rem', color: 'var(--primary)' }}
                                        >
                                            Full Size
                                        </a>
                                    </div>
                                    <a href={order.receipt_url} target="_blank" rel="noopener noreferrer">
                                        <img
                                            src={order.receipt_url}
                                            alt="Payment Receipt"
                                            style={{
                                                width: '100%',
                                                height: '150px',
                                                objectFit: 'cover',
                                                borderRadius: '0.5rem',
                                                border: '1px solid var(--border)'
                                            }}
                                        />
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Status Update */}
                    <div className="card">
                        <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.75rem', marginBottom: '1.25rem' }}>
                            <Clock size={20} />
                            <h2 style={{ fontSize: '1.1rem' }}>Order Status</h2>
                        </div>
                        <select
                            className="input"
                            value={order.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            disabled={updating}
                            style={{ width: '100%', marginBottom: '1rem' }}
                        >
                            <option value="PENDING">Pending</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                        <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                            Changing the status will update the customer's real-time tracking timeline.
                        </p>
                    </div>

                    {/* Customer Info */}
                    <div className="card">
                        <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.75rem', marginBottom: '1.25rem' }}>
                            <User size={20} />
                            <h2 style={{ fontSize: '1.1rem' }}>Customer Profile</h2>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                {order.user_id.substring(0, 1).toUpperCase()}
                            </div>
                            <div>
                                <p style={{ fontWeight: 600 }}>User ID: {order.user_id.substring(0, 12)}...</p>
                                <Link href="#" className="link" style={{ fontSize: '0.875rem' }}>View History</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
