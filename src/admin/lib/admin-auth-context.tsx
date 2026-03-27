import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { BASE_URL } from '@/lib/constants';

interface Admin {
    _id: string;
    username: string;
    email: string;
    display_name: string;
    avatar_url: string | null;
    role: string;
    admin_level: number;
    status: string;
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

const API_BASE = `${BASE_URL}/api/admin/auth`;
const SOCKET_URL = BASE_URL;

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
                        await fetchProfile(parsedAdmin.token);
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

    // Listen for real-time WebSocket privilege updates
    useEffect(() => {
        if (!admin?.token) return;

        // Fetch once on initial layout authentication just to be safe
        fetchProfile(admin.token);

        // Mount the secure Admin namespace socket connection using JWT token
        const socket: Socket = io(`${SOCKET_URL}/admin`, {
            auth: { token: admin.token },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 10,
        });

        socket.on('connect', () => {
            console.log('[AdminContext] Socket connected:', socket.id);
        });

        // Instantly merge pushed privilege payloads bypassing a round-trip fetch!
        socket.on('admin_privilege_update', (data: { admin_level: number, status: string, role: string }) => {
            console.log('[AdminContext] Instantly upgrading local privileges via WebSockets:', data);
            
            setAdmin(prev => {
                if (!prev) return null;
                
                const updatedAdmin = {
                    ...prev,
                    admin_level: data.admin_level ?? prev.admin_level,
                    status: data.status ?? prev.status,
                    role: data.role ?? prev.role
                };
                
                // Flush the UI updates to local storage instantly
                localStorage.setItem('admin', JSON.stringify(updatedAdmin));
                return updatedAdmin;
            });
        });

        return () => {
            socket.disconnect();
        };
    }, [admin?.token]);

    const fetchProfile = async (token: string) => {
        try {
            const res = await fetch(`${API_BASE}/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                // Merge with existing token
                const updatedAdmin = { ...data.data, token: token };

                setAdmin(prev => {
                    if (!prev) return updatedAdmin;

                    // Only update state if data actually changed
                    if (prev.admin_level !== updatedAdmin.admin_level ||
                        prev.status !== updatedAdmin.status ||
                        prev.role !== updatedAdmin.role ||
                        prev.display_name !== updatedAdmin.display_name) {
                        localStorage.setItem('admin', JSON.stringify(updatedAdmin));
                        return updatedAdmin;
                    }
                    return prev;
                });
            } else if (res.status === 401) {
                // Token invalid or expired
                localStorage.removeItem('admin');
                setAdmin(null);
            }
        } catch (err) {
            console.error('Failed to refresh admin profile:', err);
        }
    };

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
