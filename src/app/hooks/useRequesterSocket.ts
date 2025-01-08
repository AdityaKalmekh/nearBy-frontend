import { initializeSocket } from "@/lib/socket";
import { useRouter } from "next/navigation";
import { useEffect } from "react"

interface requestResponse {
    status: string,
    providerId: string
}

export const useRequesterSocket = (
    requesterId: string | undefined,
    setError: (error: string | null) => void
) => {
    const router = useRouter();

    useEffect(() => {
        if (!requesterId) return;

        const socket = initializeSocket(requesterId);

        socket.on('connect', () => {
            socket.emit('auth:user', requesterId);
        })

        socket.on('request:update', (data: requestResponse) => {
            const { status, providerId } = data;
                       
            if (status === 'ACCEPTED') {
                router.push(`${providerId}`);
            } else if (status === 'NO_PROVIDER') {
                setError('No providers available in your region');
            }
        })

        return () => {
            socket.off('connect');
            socket.off('new:request');
        };

    }, [requesterId, router, setError]);
}