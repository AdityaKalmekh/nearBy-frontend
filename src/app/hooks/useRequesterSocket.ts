import { initializeSocket } from "@/lib/socket";
import { useRouter } from "next/navigation";
import { useEffect } from "react"

interface requestResponse {
    status: string,
    requestId: string
}

export const useRequesterSocket = (
    requesterId: string | undefined,
    setError: (error: string | null) => void
) => {
    const router = useRouter();

    useEffect(() => {
        if (!requesterId) return;

        const socket = initializeSocket(requesterId);

        if (socket){

            socket.on('connect', () => {
                console.log('Socket connected for requester:',socket.id);
                socket.emit('auth:user', requesterId);
            })
    
            socket.on('request:update', (data: requestResponse) => {
                const { status, requestId } = data;
                           
                if (status === 'ACCEPTED') {
                    // Join service request room when request is accepted
                    socket.emit('join:service_request', {
                        serviceRequestId: requestId,
                        userId: requesterId,
                        userType: 'requester'
                    });
                    router.push(`${requestId}`);
                } else if (status === 'NO_PROVIDER') {
                    setError('No providers available in your region');
                }
            });

            socket.on('location:updated', (location) => {
                console.log("Provider current location ", location);
            });
    
            socket.on('room:joined', ({ userId, userType }) => {
                console.log(`${userType} ${userId} joined the room`);
            });
            
            return () => {
                socket.off('connect');
                socket.off('new:request');
            };
        }
    }, [requesterId, router, setError]);
}