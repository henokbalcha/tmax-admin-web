"use client";

import { useAuth } from "@/contexts/AuthContext";
import Login from "./Login";
import React from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>
                <div style={{ color: 'var(--primary)', fontWeight: 600 }}>Loading Session...</div>
            </div>
        );
    }

    if (!user) {
        return <Login />;
    }

    return <>{children}</>;
}
