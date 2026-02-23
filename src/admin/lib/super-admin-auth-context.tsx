import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SuperAdmin {
    _id: string;
    username: string;
    email: string;
    display_name: string;
    avatar_url?: string;
    token: string;
}

interface SuperAdminAuthContextType {
    superAdmin: SuperAdmin | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string, display_name: string) => Promise<void>;
    logout: () => void;
}

const SuperAdminAuthContext = createContext<SuperAdminAuthContextType | undefined>(undefined);

export function SuperAdminAuthProvider({ children }: { children: ReactNode }) {
    const [superAdmin, setSuperAdmin] = useState<SuperAdmin | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedSuperAdmin = localStorage.getItem('superAdmin');
        if (storedSuperAdmin) {
            try {
                setSuperAdmin(JSON.parse(storedSuperAdmin));
            } catch (e) {
                localStorage.removeItem('superAdmin');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const res = await fetch('http://localhost:5000/api/superadmin/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Login failed');
        }

        const superAdminData = data.data;
        setSuperAdmin(superAdminData);
        localStorage.setItem('superAdmin', JSON.stringify(superAdminData));
    };

    const register = async (username: string, email: string, password: string, display_name: string) => {
        const res = await fetch('http://localhost:5000/api/superadmin/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, display_name })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        const superAdminData = data.data;
        setSuperAdmin(superAdminData);
        localStorage.setItem('superAdmin', JSON.stringify(superAdminData));
    };

    const logout = () => {
        setSuperAdmin(null);
        localStorage.removeItem('superAdmin');
    };

    return (
        <SuperAdminAuthContext.Provider value={{ superAdmin, loading, login, register, logout }}>
            {children}
        </SuperAdminAuthContext.Provider>
    );
}

export function useSuperAdminAuth() {
    const context = useContext(SuperAdminAuthContext);
    if (context === undefined) {
        throw new Error('useSuperAdminAuth must be used within a SuperAdminAuthProvider');
    }
    return context;
}
