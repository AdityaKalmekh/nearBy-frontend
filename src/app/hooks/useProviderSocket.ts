"use client";
import { useCallback, useEffect, useRef, useState } from 'react';
import { initializeSocket } from '@/lib/socket';
import useHttp from './use-http';
import { Socket } from 'socket.io-client';
interface Location {
    coordinates: [number, number]; // [longitude, latitude]
}
interface RequestDisplay {
    userId: string,
    distance: string,
    requestId: string,
    firstName: string,
    lastName: string,
    phoneNo?: string,
    email?: string,
    reqLocation: Location
}

interface IntialRequestData {
    distance: string;
    userId: string;
    requestId: string;
    reqLocation: Location
}

interface RequesterDetailResponse {
    userInfo: {
        firstName: string,
        lastName: string,
        phoneNo: string,
        email: string
    },
    reqLocation: Location
}

// interface ServerToClientEvents {
//     'new:request': (data: RequestDisplay) => void;
//     'request:accepted': (data: RequestDisplay) => void;
//     'room:joined': (data: { userId: string; userType: 'provider' | 'requester' }) => void;
// }

// interface ClientToServerEvents {
//     'auth:provider': (providerId: string) => void;
//     'join:service_request': (data: {
//         serviceRequestId: string;
//         userId: string;
//         userType: 'provider' | 'requester';
//     }) => void;
// }

export const useProviderSocket = (providerId: string | undefined) => {
    const [activeRequest, setActiveRequest] = useState<RequestDisplay | IntialRequestData | null>();
    const [timer, setTimer] = useState<number>(20);
    const timerRef = useRef<NodeJS.Timeout>();
    const [accepted, setAccepted] = useState<boolean>(false);
    const [notGetRequest, setNotGetRequest] = useState<boolean>(false);
    const { sendRequest } = useHttp();
    const socketRef = useRef<Socket | null>(null);

    const getRequesterDetails = useCallback(async (requestId: string) => {
        try {
            return new Promise((resolve, reject) => {
                sendRequest({
                    url: `request/requester-details/${requestId}`,
                    method: 'GET'
                },
                    (response) => {
                        resolve(response);
                    },
                    (error) => {
                        console.error('Error fetching requester details:', error);
                        reject(error);
                    });
            });
        } catch (error) {
            console.error('Error in getRequesterDetails:', error);
            throw error;
        }
    }, [sendRequest]);

    useEffect(() => {
        if (!providerId) return;

        const socket = initializeSocket(providerId);
        socketRef.current = socket;

        if (!socket) return;

        const handleRequestAccepted = async (requestId: string) => {
            try {
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }

                socket.emit('join:service_request', {
                    serviceRequestId: requestId,
                    userId: providerId,
                    userType: 'provider'
                });

                const requesterDetails = await getRequesterDetails(requestId)

                // Only update state if component is still mounted
                if (requesterDetails) {
                    const response = requesterDetails as RequesterDetailResponse;
                    setActiveRequest(prevData => {
                        if (!prevData) {
                            return prevData;
                        }
                        return {
                            ...prevData,
                            firstName: response.userInfo.firstName,
                            lastName: response.userInfo.lastName,
                            phoneNo: response.userInfo.phoneNo,
                            reqLocation: response.reqLocation
                        }
                    });
                    setAccepted(true);
                }
            } catch (error) {
                console.error('Error handling accepted request:', error);
                throw error;
            }
        };

        const handleRequestUnavailable = () => {
            console.log("Handle Request Unavailable is called");
            setActiveRequest(null);
            setNotGetRequest(true);
        }

        socket.on('connect', () => {
            console.log('Socket connected for provider:', socket.id);
            socket.emit('auth:provider', providerId);
        });

        socket.on('new:request', (data: RequestDisplay) => {
            setActiveRequest(data);
            setTimer(20);
            setAccepted(false);

            // Clear existing timer if any
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }

            // Start new timer
            timerRef.current = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        setActiveRequest(null);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        });

        socket.on('request:accepted', handleRequestAccepted);
        socket.on('request:unavailable', handleRequestUnavailable);
        return () => {
            if (socket) {
                socket.off('connect');
                socket.off('new:request');
                socket.off('request:accepted');
            }
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [providerId, getRequesterDetails]);

    const handleRequest = async (accepted: boolean) => {
        if (!activeRequest) return;

        try {
            await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/request/response`, {
                method: 'POST',
                credentials: 'include',
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

    const handleVerifyOTP = async (otp: string) => {
        return new Promise((resolve) => {
            sendRequest({
                url: `/request/${activeRequest?.requestId}/verify`,
                method: 'POST',
                data: {
                    otp,
                    providerId
                }
            }, (response) => {
                console.log(response);
                resolve(true);
            })
        })
    }

    return {
        accepted,
        activeRequest,
        timer,
        handleAccept: () => handleRequest(true),
        handleReject: () => handleRequest(false),
        handleVerifyOTP,
        socket: socketRef.current,
        notGetRequest,
        setNotGetRequest
    };
};