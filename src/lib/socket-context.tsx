import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/lib/auth-context";

interface SocketContextType {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (user?.token && !socketRef.current) {
            const newSocket = io("http://localhost:5000", {
                auth: { token: user.token },
                transports: ["websocket", "polling"],
                reconnection: true,
                reconnectionAttempts: 10,
                reconnectionDelay: 1000,
            });

            newSocket.on("connect", () => {
                console.log("[Socket] Connected:", newSocket.id);
            });

            newSocket.on("connect_error", (err) => {
                console.error("[Socket] Connection error:", err.message);
            });

            socketRef.current = newSocket;
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [user?.token]);

    return (
        <SocketContext.Provider value={{ socket: socketRef.current }}>
            {children}
        </SocketContext.Provider>
    );
}
