import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { BASE_URL } from '@/lib/constants';

const API_BASE = `${BASE_URL}/api/admin/chat`;
const SOCKET_URL = BASE_URL;

function getAdminToken(): string | null {
    try {
        const stored = localStorage.getItem('admin');
        return stored ? JSON.parse(stored).token || null : null;
    } catch { return null; }
}

export function useAdminChatUnread() {
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const socketRef = useRef<Socket | null>(null);

    const token = getAdminToken();

    // Fetch initial unread count
    useEffect(() => {
        if (!token) {
            setUnreadCount(0);
            return;
        }

        const fetchUnreadCount = async () => {
            try {
                const res = await fetch(`${API_BASE}/unread`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUnreadCount(data.unreadCount || 0);
                }
            } catch (err) {
                console.error('Failed to fetch admin unread count', err);
            }
        };

        fetchUnreadCount();
    }, [token]);

    // Socket listeners for real-time updates
    useEffect(() => {
        if (!token) return;

        const socket = io(`${SOCKET_URL}/admin`, {
            auth: { token },
            transports: ['websocket']
        });
        socketRef.current = socket;

        socket.on('newMessage', (data) => {
            // When a new message comes in, increment the unread count
            // The sender check ensures we don't increment if the admin sent it
            // Wait, we can just re-fetch the unread count or optimistically increment
            const adminId = (() => {
                try {
                    const stored = localStorage.getItem('admin');
                    return stored ? JSON.parse(stored)._id || null : null;
                } catch { return null; }
            })();
            
            if (data.message && data.message.sender._id !== adminId) {
                setUnreadCount(prev => prev + 1);
            }
        });

        socket.on('adminMarkReadAck', () => {
             // We could fetch again to ensure absolute accuracy
             fetch(`${API_BASE}/unread`, {
                 headers: { 'Authorization': `Bearer ${token}` }
             })
             .then(res => res.json())
             .then(data => setUnreadCount(data.unreadCount || 0))
             .catch(() => {});
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [token]);

    return { unreadCount, setUnreadCount };
}
