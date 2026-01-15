"use client";

import { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Users, TrendingUp, Package, AlertTriangle } from 'lucide-react';
import DashboardChart from '@/components/DashboardChart';
import styles from './page.module.css';
import { api } from '@/lib/api';

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
  color: string;
}

function StatCard({ title, value, change, icon: Icon, color }: StatCardProps) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="flex-between">
        <div style={{ padding: '0.75rem', borderRadius: '0.75rem', backgroundColor: `rgba(${color}, 0.2)` }}>
          <Icon color={`rgb(${color})`} size={24} />
        </div>
        <span className={`badge ${change >= 0 ? 'badge-success' : 'badge-error'}`}>
          {change >= 0 ? '+' : ''}{change}%
        </span>
      </div>
      <div>
        <h3 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>{value}</h3>
        <p className="text-muted" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{title}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    productCount: 0,
    lowStockCount: 0,
    totalValue: 0,
    totalStock: 0
  });

  useEffect(() => {
    async function loadStats() {
      const data = await api.products.getStats();
      setStats(data);
    }
    loadStats();
  }, []);

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard Overview</h1>
        <p className={styles.subtitle}>Welcome back, Admin. Here is what's happening today.</p>
      </div>

      <div className={styles.grid}>
        <StatCard
          title="Total Revenue Estimate"
          value={`$${stats.totalValue.toLocaleString()}`}
          change={12}
          icon={DollarSign}
          color="99, 102, 241"
        />
        <StatCard
          title="Total Stock Items"
          value={stats.totalStock.toLocaleString()}
          change={8}
          icon={Package}
          color="236, 72, 153"
        />
        <StatCard
          title="Active Products"
          value={stats.productCount.toLocaleString()}
          change={5}
          icon={ShoppingBag}
          color="16, 185, 129"
        />
        <StatCard
          title="Low Stock Warning"
          value={stats.lowStockCount.toLocaleString()}
          change={-2}
          icon={AlertTriangle}
          color="245, 158, 11"
        />
      </div>

      <div className={styles.chartContainer}>
        <div className={styles.chartHeader}>
          <h2 className={styles.sectionTitle}>Sales Analytics</h2>
          <select className="input" style={{ width: 'auto' }}>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Year</option>
          </select>
        </div>
        <DashboardChart />
      </div>
    </div>
  );
}
