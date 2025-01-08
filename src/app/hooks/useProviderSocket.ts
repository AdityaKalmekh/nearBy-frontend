"use client";
import { useEffect, useRef, useState } from 'react';
import { initializeSocket } from '@/lib/socket';

interface RequestDisplay {
    userId: string,
    distance: string,
    requestId: string,
    firstName: string,
    lastName: string,
    phoneNo: string
}

export const useProviderSocket = (providerId: string | undefined) => {
    const [activeRequest, setActiveRequest] = useState<RequestDisplay | null>(null);
    const [timer, setTimer] = useState<number>(20);
    const timerRef = useRef<NodeJS.Timeout>();
    const [accepted, setAccepted] = useState<boolean>(false);

    useEffect(() => {
        if (!providerId) return;

        const socket = initializeSocket(providerId);

        if (socket){

            socket.on('connect', () => {
                console.log('Socket connected:', socket.id);
                socket.emit('auth:provider', providerId);
            });
    
            socket.on('new:request', (data: RequestDisplay) => {
                setActiveRequest(data);
                setTimer(20);
                startTimer();
            });
    
            socket.on('request:accepted', (data: RequestDisplay) =>{
                setActiveRequest((prevData) => ({...prevData, ...data}));
                setAccepted(true);
            })
    
            return () => {
                socket.off('connect');
                socket.off('new:request');
                socket.off('request:accepted');
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }
            };
        }
    }, [providerId]);
    
    const startTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        timerRef.current = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleRequest = async (accepted: boolean) => {
        if (!activeRequest) return;

        try {
            await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/request/response`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestId: activeRequest.requestId,
                    providerId,
                    accepted,
                    userId: activeRequest.userId
                })
            });

            if (timerRef.current) {
                clearInterval(timerRef.current);
            }

            if (!accepted) {
                setActiveRequest(null);
            }
        } catch (error) {
            console.error(`Error ${accepted ? 'accepting' : 'rejecting'} request:`, error);
        }
    };

    return {
        accepted,
        activeRequest,
        timer,
        handleAccept: () => handleRequest(true),
        handleReject: () => handleRequest(false)
    };
};