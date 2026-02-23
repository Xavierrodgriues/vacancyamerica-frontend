import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/lib/auth-context";

interface SocketContextType {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        if (!user?.token) return;

        const newSocket = io("https://vacancyamerica-backend.onrender.com", {
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

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
            setSocket(null);
        };
    }, [user?.token]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
}
