"use client";
import { DefaultEventsMap } from "@socket.io/component-emitter";
import { io, Socket } from "socket.io-client";

let socket: Socket<DefaultEventsMap, DefaultEventsMap> | null = null;

export const initializeSocket = (userId: string) => {
    if (!socket) {
        const socketURL = process.env.NEXT_PUBLIC_SOCKET_URL;
        console.log("socket ----------------", socketURL);
        
        if (!socketURL) {
            console.error('Socket URL not configured');
            return null;
        }

        socket = io(socketURL, {
            auth: {
                userId
            },
            transports: ['polling'], // Try websocket only first
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
            reconnectionDelayMax: 5000,
            autoConnect: false, // Prevent automatic connection
            secure: true,
            withCredentials: true,
            path: '/socket.io/',
            timeout: 20000,
            forceNew: true,
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
            console.error('Connection error:', error);
        });
    
        socket.connect();
    }
    return socket;
};

export const getSocket = () => socket;