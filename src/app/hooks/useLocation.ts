import { useState } from 'react';

interface LocationData {
    // latitude: number;
    // longitude: number;
    coordinates: [number,number];
    accuracy?: number;
    source: 'BROWSER' | 'IP';
}

type LocationStatus = 'idle' | 'loading' | 'success' | 'error' | 'denied';

interface UseLocationResult {
    location: LocationData | null;
    locationStatus: LocationStatus;
    locationError: string;
    getLocation: () => Promise<LocationData>;
    // resetLocation: () => void;
}

class LocationError extends Error {
    constructor(
        message: string,
        public isDenied: boolean = false,
        public code?: string
    ) {
        super(message);
        this.name = 'LocationError';
    }
}

export const useLocation = (): UseLocationResult => {
    const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
    const [locationError, setLocationError] = useState<string>('');
    const [location, setLocation] = useState<LocationData | null>(null);

    // const resetLocation = () => {
    //     setLocationStatus('idle');
    //     setLocationError('');
    //     setLocation(null);
    // };

    // Browser Geolocation
    const getBrowserLocation = (): Promise<{ data: LocationData; isDenied: boolean }> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        data: {
                            // latitude: position.coords.latitude,
                            // longitude: position.coords.longitude,
                            coordinates: [position.coords.longitude,position.coords.latitude],
                            accuracy: position.coords.accuracy,
                            source: 'BROWSER'
                        },
                        isDenied: false
                    });
                },
                (error: GeolocationPositionError) => {
                    if (error.code === error.PERMISSION_DENIED) {
                        // setLocationStatus('denied');
                        // message = 'Location access was denied. Please enable location services in your browser settings to continue.';
                        reject({
                            error: new Error('Location access was denied. Please enable location services in your browser settings to continue.'),
                            isDenied: true
                        });
                    } else {
                        let message = 'Failed to get browser location';
                        if (error.code === error.POSITION_UNAVAILABLE) {
                            message = 'Location information is currently unavailable.';
                        } else if (error.code === error.TIMEOUT) {
                            message = 'Location request timed out.';
                        }
                        reject({ error: new Error(message), isDenied: false });
                    }
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    };

    // IP-based Location
    async function getIpBasedLocation(): Promise<LocationData> {
        setLocationStatus('loading');
        setLocationError('');

        try {
            const response = await fetch('https://ipapi.co/json/');
            if (!response.ok) {
                throw new Error('Failed to get IP-based location');
            }

            const data = await response.json();

            if (!data.latitude || !data.longitude) {
                throw new Error('Invalid location data received');
            }

            const locationData: LocationData = {
                // latitude: parseFloat(data.latitude),
                // longitude: parseFloat(data.longitude),
                coordinates: [parseFloat(data.longitude),parseFloat(data.latitude)],
                accuracy: 10000, // IP geolocation is typically accurate to ~10km
                source: 'IP'
            };

            return locationData;

        } catch (error) {
            console.error('IP location error:', error);
            setLocationStatus('error');
            setLocationError('Failed to get IP-based location. Please try again.');
            throw new Error('Failed to get IP-based location. Please try again.');
        }
    };

    // Utility function to validate coordinates
    const isValidCoordinates = (longitude: number, latitude: number): boolean => {
        return !isNaN(latitude) &&
            !isNaN(longitude) &&
            latitude >= -90 &&
            latitude <= 90 &&
            longitude >= -180 &&
            longitude <= 180;
    };

    const getLocation = async () : Promise<LocationData> => {
        setLocationStatus('loading');
        setLocationError('');
        setLocation(null);

        try {
            // Try browser geolocation first
            try {
                console.log('Attempting browser geolocation...');
                const { data: browserLocation, isDenied } = await getBrowserLocation();

                console.log(isDenied);
                
                if (isDenied) {
                    setLocationStatus('denied');
                    throw new Error('Location access was denied. Please enable location services in your browser settings to continue.');
                }

                if (isValidCoordinates(browserLocation.coordinates[0], browserLocation.coordinates[1])) {
                    setLocation(browserLocation);
                    setLocationStatus('success');
                    console.log('Browser location obtained:', browserLocation);
                    return browserLocation;
                }
            } catch (error) {
                // Only proceed to IP-based location if it's not a permission denial
                const locationError = error as LocationError;
                if (locationError.isDenied) {
                    console.log("final log");
                    setLocationStatus('denied');
                    throw error;
                }
                console.warn('Browser geolocation failed:', error);


                // Try IP-based location as fallback

                try {
                    const ipLocation: LocationData = await getIpBasedLocation();

                    if (isValidCoordinates(ipLocation.coordinates[0], ipLocation.coordinates[1])) {
                        setLocation(ipLocation);
                        setLocationStatus('success');
                        console.log('IP-based location obtained:', ipLocation);
                        return ipLocation;
                    }
                } catch (ipError) {
                    console.error('IP location failed:', ipError);
                    throw ipError;
                }
            }
            throw new Error('Unable to get valid location data');
        } catch (error) {
            console.error('Final location error:', error);
            // Don't overwrite 'denied' status if it was already set
            if (error instanceof Error && error.message.includes('denied')) {
                setLocationStatus('denied');
            } else {
                setLocationStatus('error');
            }
            setLocationError(error instanceof Error ? error.message : 'Failed to get location');
            throw new Error('Unabled to get location');
        }
    };

    return {
        location,
        locationStatus,
        locationError,
        getLocation,
        // resetLocation
    };
};