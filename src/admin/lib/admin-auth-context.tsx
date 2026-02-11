import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Admin {
    _id: string;
    username: string;
    email: string;
    display_name: string;
    avatar_url: string | null;
    role: string;
    admin_level: number;
    token: string;
}

interface AdminAuthContextType {
    admin: Admin | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string, display_name: string) => Promise<void>;
    logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const API_BASE = 'http://localhost:5000/api/admin/auth';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
    const [admin, setAdmin] = useState<Admin | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const storedAdmin = localStorage.getItem('admin');
            if (storedAdmin) {
                try {
                    const parsedAdmin = JSON.parse(storedAdmin);

                    // Verify with server to get latest data (including level changes)
                    if (parsedAdmin.token) {
                        try {
                            const res = await fetch(`${API_BASE}/me`, {
                                headers: {
                                    'Authorization': `Bearer ${parsedAdmin.token}`
                                }
                            });

                            if (res.ok) {
                                const data = await res.json();
                                const updatedAdmin = { ...data.data, token: parsedAdmin.token };
                                setAdmin(updatedAdmin);
                                localStorage.setItem('admin', JSON.stringify(updatedAdmin));
                            } else {
                                // Token invalid or expired
                                localStorage.removeItem('admin');
                                setAdmin(null);
                            }
                        } catch (err) {
                            // Network error, fall back to stored data but keep logged in
                            console.error('Failed to refresh admin profile:', err);
                            setAdmin(parsedAdmin);
                        }
                    } else {
                        setAdmin(parsedAdmin);
                    }
                } catch (e) {
                    localStorage.removeItem('admin');
                    setAdmin(null);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        const res = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Login failed');
        }

        const adminData = data.data;
        setAdmin(adminData);
        localStorage.setItem('admin', JSON.stringify(adminData));
    };

    const register = async (username: string, email: string, password: string, display_name: string) => {
        const res = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, display_name })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        const adminData = data.data;
        setAdmin(adminData);
        localStorage.setItem('admin', JSON.stringify(adminData));
    };

    const logout = () => {
        setAdmin(null);
        localStorage.removeItem('admin');
    };

    return (
        <AdminAuthContext.Provider value={{ admin, loading, login, register, logout }}>
            {children}
        </AdminAuthContext.Provider>
    );
}

export function useAdminAuth() {
    const context = useContext(AdminAuthContext);
    if (context === undefined) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }
    return context;
}
