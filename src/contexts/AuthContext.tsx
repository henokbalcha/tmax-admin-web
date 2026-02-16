"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { api } from '@/lib/api';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isAdmin: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const initAuth = async () => {
            const currentUser = await api.auth.getUser();
            setUser(currentUser);

            // Admin check: 
            // 1. Check for specific email domain
            // 2. Check for 'role' in user metadata
            const isTmaxEmail = currentUser?.email?.endsWith('@tmax.com');
            const hasAdminRole = currentUser?.user_metadata?.role === 'admin';

            if (isTmaxEmail || hasAdminRole) {
                setIsAdmin(true);
            }

            setLoading(false);
        };

        initAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
