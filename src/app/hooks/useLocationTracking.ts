"use client";

import { useState, useCallback, useEffect } from 'react';
import { useInterval } from './useInterval';
import { LocationData, useLocation } from './useLocation';
import { LOCATION_UPDATE_INTERVAL } from '../constants';

interface TrackingApiResponse {
    success: boolean;
    message?: string;
}

export const useLocationTracking = (providerId: string | undefined) => {
    const [isTracking, setIsTracking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [updateInterval, setUpdateInterval] = useState<NodeJS.Timeout | null>(null);

     const {
        location,
        locationStatus,
        locationError,
        getLocation,
    } = useLocation();

    const startTracking = async (locationData: LocationData): Promise<boolean> => {

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/provider/location/start/${providerId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    longitude: locationData.coordinates[0],
                    latitude: locationData.coordinates[1],
                    accuracy: locationData.accuracy,
                    source: locationData.source
                }),
            });

            const data: TrackingApiResponse = await response.json();

            if (!data.success) throw new Error(data.message || 'Failed to start tracking');
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start tracking');
            return false;
        }
    };

    const stopTracking = useCallback(async (): Promise<void> => {
        if (!isTracking) return;

        try {

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/provider/location/stop/${providerId}`, {
                method: 'POST',
            });

            const data: TrackingApiResponse = await response.json();

            if (!data.success) throw new Error(data.message);

            if (updateInterval) {
                clearInterval(updateInterval);
                setUpdateInterval(null);
            }

            setIsTracking(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to stop tracking');
        }
    }, [providerId, updateInterval, isTracking]);

    const updateLocation = useCallback(async () => {
        if (!isTracking) return;

        try {
            const currentLocation = await getLocation();
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/provider/location/update/${providerId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    longitude: currentLocation.coordinates[0],
                    latitude: currentLocation.coordinates[1],
                    accuracy: currentLocation.accuracy,
                    source: currentLocation.source
                }),
            });

            const data: TrackingApiResponse = await response.json();

            if (!data.success) throw new Error(data.message);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update location');
            await stopTracking();
        }
    }, [providerId, getLocation, stopTracking, isTracking]);


    useEffect(() => {
        return () => {
            if (updateInterval) {
                clearInterval(updateInterval);
            }
        };
    }, [updateInterval]);

    useInterval(
        async () => {
            if (isTracking) {
                await updateLocation();
            }
        },
        isTracking ? LOCATION_UPDATE_INTERVAL : null
    );

    const handleStatusChange = async (checked: boolean) => {
        setError(null);

        if (checked) {
            try {
                const currentLocation = await getLocation();
                const success = await startTracking(currentLocation);

                if (success) {
                    setIsTracking(true);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to start tracking');
                setIsTracking(false);
            }
        } else {
            stopTracking();
        }
    };

    return {
        isTracking,
        error,
        locationError,
        location,
        locationStatus,
        handleStatusChange
    }
}