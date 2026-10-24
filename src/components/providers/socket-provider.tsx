"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { io as ClientIO, type Socket } from "socket.io-client";

type SocketContextType = {
    socket: Socket | null;
    isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false
});

// Gives components the shared socket and whether it is currently connected.
export const useSocket = () => {
    return useContext(SocketContext)
};

/**
 * @component SocketProvider
 * @description Opens one Socket.IO client for the app and shares it, plus its connection state, through context.
 */
export const SocketProvider = ({ children }: { children: ReactNode }) => {
    // Created once and left unconnected so rendering on the server never opens a connection.
    const [socket] = useState<Socket>(() =>
        ClientIO(process.env.NEXT_PUBLIC_SITE_URL, {
            path: "/api/socket/io",
            addTrailingSlash: false,
            autoConnect: false,
        })
    );
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const handleConnect = () => setIsConnected(true);
        const handleDisconnect = () => setIsConnected(false);

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.connect();

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.disconnect();
        };
    }, [socket]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }} >
            {children}
        </SocketContext.Provider>
    )
}
