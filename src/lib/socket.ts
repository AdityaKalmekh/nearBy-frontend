"use client";
import { DefaultEventsMap } from "@socket.io/component-emitter";
import { io, Socket } from "socket.io-client";

let socket: Socket<DefaultEventsMap, DefaultEventsMap> | null = null;

export const initializeSocket = (userId: string) => {
    if (!socket) {
        const socketURL = process.env.NEXT_PUBLIC_SOCKET_URL;
        
        if (!socketURL) {
            console.error('Socket URL not configured');
            return null;
        }

        socket = io(socketURL, {
            auth: {
                userId
            },       
            transports: ['polling', 'websocket'], // Try websocket only first
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
            autoConnect: false, // Prevent automatic connection
            path: '/socket.io/',
            timeout: 20000
        });

        socket.on('connect', () => {
            // console.log('Connected with transport:', socket?.io?.engine?.transport?.name);
            console.log('Connected:', {
                id: socket?.id,
                transport: socket?.io?.engine?.transport?.name
            });
        });

        socket.on('connect_error', (error) => {
            console.log("In socket error");
            console.error('Connection error details:', {
                message: error.message,
                state: socket?.connected
            });
        });
    
        socket.connect();
    }
    return socket;
};

export const getSocket = () => socket;