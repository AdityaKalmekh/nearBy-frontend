"use client";
import { DefaultEventsMap } from "@socket.io/component-emitter";
import { io, Socket } from "socket.io-client";

let socket: Socket<DefaultEventsMap, DefaultEventsMap> | null = null;

export const initializeSocket = (userId: string) => {
    if (!socket) {
        const socketURL = `${process.env.NEXT_PUBLIC_SOCKET_URL}`;

        if (!socketURL) {
            console.error('Socket URL not configured');
            return null;
        }

        socket = io(socketURL, {
            auth: {
                userId
            },
            transports: ['websocket'] as ('websocket' | 'polling')[], // Try websocket only first
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            autoConnect: false, // Prevent automatic connection
            secure: true,
            withCredentials: true,
            path: '/socket.io/',
            timeout: 10000
        });


        // Connection handling
        socket.on('connect', () => {
            console.log('Socket connected successfully:', socket?.id);
            if (socket?.io?.engine?.transport) {
                console.log('Transport type:', socket.io.engine.transport.name);
            }
        });

        socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            // If websocket fails, fall back to polling
            if (socket?.io?.opts?.transports?.[0] === 'websocket') {
                console.log('Falling back to polling transport');
                if (socket.io.opts) {
                    socket.io.opts.transports = ['polling', 'websocket'];
                }
                socket.connect();
            }
        });

        socket.connect();
    }
    return socket;
};

export const getSocket = () => socket;