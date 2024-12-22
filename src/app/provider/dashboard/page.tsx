"use client";

import { useCallback, useEffect, useState } from "react";
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOtpStore } from "@/app/store/otpStore";
import { useLocation, LocationData, LocationStatus } from "@/app/hooks/useLocation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useInterval } from "@/app/hooks/useInterval";

interface TrackingApiResponse {
    success: boolean;
    message?: string;
}

const LOCATION_UPDATE_INTERVAL = 60000;

const Page = () => {

    const [isTracking, setIsTracking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [updateInterval, setUpdateInterval] = useState<NodeJS.Timeout | null>(null);
    const otpData = useOtpStore(state => state.otpData);

    const {
        location,
        locationStatus,
        locationError,
        getLocation,
    } = useLocation();

    const startTracking = async (locationData: LocationData): Promise<boolean> => {
        const providerId = otpData?.providerId;

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
            const providerId = otpData?.providerId;
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
    }, [otpData?.providerId, updateInterval, isTracking]);

    const updateLocation = useCallback(async () => {
        if (!isTracking) return;

        try {
            const currentLocation = await getLocation();
            const providerId = otpData?.providerId;
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
    }, [otpData?.providerId, getLocation, stopTracking, isTracking]);


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

    const getStatusBadgeVariant = (status: LocationStatus) => {
        switch (status) {
            case LocationStatus.SUCCESS:
                return 'secondary';
            case LocationStatus.ERROR:
            case LocationStatus.DENIED:
                return 'destructive';
            case LocationStatus.LOADING:
                return 'secondary';
            default:
                return 'outline';
        }
    };

    return (

        <Card className="w-full max-w-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-2xl font-bold">Location Tracking</CardTitle>
                <div className="flex items-center space-x-2">
                    <span className={`text-sm ${isTracking ? 'text-green-600' : 'text-gray-500'}`}>
                        {isTracking ? 'Tracking Active' : 'Tracking Inactive'}
                    </span>
                    <Switch
                        checked={isTracking}
                        onCheckedChange={handleStatusChange}
                        disabled={locationStatus === LocationStatus.LOADING}
                        className="data-[state=checked]:bg-green-500"
                    />
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {(error || locationError) && (
                    <Alert variant="destructive">
                        <AlertDescription>{error || locationError}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-2">
                    <Badge variant={getStatusBadgeVariant(locationStatus)}>
                        {locationStatus === LocationStatus.LOADING && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Status: {locationStatus}
                    </Badge>

                    {location && (
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4" />
                                <span className="text-sm">
                                    Long: {location.coordinates[0].toFixed(6)},
                                    Lat: {location.coordinates[1].toFixed(6)}
                                </span>
                            </div>
                            <div className="flex space-x-2">
                                <Badge variant="outline">
                                    Source: {location.source}
                                </Badge>
                                {location.accuracy && (
                                    <Badge variant="outline">
                                        Accuracy: ±{Math.round(location.accuracy)}m
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
export default Page