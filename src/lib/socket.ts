"use client";
import { io, Socket } from "socket.io-client";

let socket: Socket;

export const initializeSocket = (userId: string) => {
    if (!socket) {
        const socketURL = `${process.env.NEXT_PUBLIC_SOCKET_URL}`;
        socket = io(socketURL, {
            auth: {
                userId
            },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            transports: ['polling', 'websocket'],
            secure: true,
            withCredentials: true,
            path: '/socket.io/'
        });
    }
    return socket;
};

export const getSocket = () => socket;