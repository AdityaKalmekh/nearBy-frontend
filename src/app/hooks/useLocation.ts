import { useState } from 'react';

export enum LocationSource {
    BROWSER = 'BROWSER',
    IP = 'IP',
    GOOGLE = 'GOOGLE'
}

export enum LocationStatus {
    IDLE = 'idle',
    LOADING = 'loading',
    SUCCESS = 'success',
    ERROR = 'error',
    DENIED = 'denied'
}

// Type definitions with readonly properties for immutability
export type Coordinates = readonly [number, number];
export interface LocationData {
    readonly coordinates: Coordinates;
    readonly accuracy?: number;
    readonly source: LocationSource;
}
export interface LocationError {
    readonly message: string;
    readonly isDenied: boolean;
    readonly code?: string;
    readonly name: string;
}

export interface LocationResult {
    readonly data: LocationData;
    readonly isDenied: boolean;
}

interface UseLocationResult {
    location: LocationData | null;
    locationStatus: LocationStatus;
    locationError: string;
    getLocation: () => Promise<LocationData>;
    // resetLocation: () => void;
}

const isLocationError = (error: unknown): error is LocationError => {
    return error instanceof Error && 'isDenied' in error;
};

// Utility type for location method functions
type LocationMethod<T> = () => Promise<T>;


// Pure function to create a location error
const createLocationError = (
    message: string,
    isDenied: boolean = false,
    code?: string
): Error & { isDenied: boolean; code?: string } => ({
    ...new Error(message),
    name: 'LocationError',
    isDenied,
    code
});

const isValidCoordinates = (coordinates: Coordinates): boolean => {
    const [longitude, latitude] = coordinates;
    return !isNaN(latitude) &&
        !isNaN(longitude) &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180;
};

const formatLocationData = (
    coordinates: Coordinates,
    accuracy: number | undefined,
    source: LocationData['source']
): LocationData => ({
    coordinates,
    accuracy,
    source
});


// Google Maps Geolocation API response type
interface GoogleGeolocationResponse {
    location: {
        lat: number;
        lng: number;
    };
    accuracy: number;
}

// Google Maps Geolocation API handler
const getGoogleLocation = async (apiKey: string): Promise<LocationData> => {
    
    if (!apiKey){
        throw new Error("Google maps API key is missing");
    }

    const response = await fetch(`https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            considerIp: true,
            radioType: "gsm",
            carrier: "Wifi"
        })
    });

    if (!response.ok) {
        throw createLocationError('Failed to get Google location');
    }

    const data = await response.json() as GoogleGeolocationResponse;

    return formatLocationData(
        [data.location.lng, data.location.lat],
        data.accuracy,
        LocationSource.GOOGLE
    );
};


// Browser Geolocation handler
const getBrowserLocation = (): Promise<LocationResult> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(createLocationError('Geolocation is not supported by your browser'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    data: formatLocationData(
                        [position.coords.longitude, position.coords.latitude],
                        position.coords.accuracy,
                        LocationSource.BROWSER
                    ),
                    isDenied: false
                });
            },
            (error: GeolocationPositionError) => {
                const errorMessages: Record<number, string> = {
                    [GeolocationPositionError.PERMISSION_DENIED]:
                        'Location access was denied. Please enable location services in your browser settings to continue.',
                    [GeolocationPositionError.POSITION_UNAVAILABLE]:
                        'Location information is currently unavailable.',
                    [GeolocationPositionError.TIMEOUT]:
                        'Location request timed out.'
                };

                reject({
                    error: createLocationError(
                        errorMessages[error.code] || 'Failed to get browser location',
                        error.code === error.PERMISSION_DENIED,
                        error.code.toString()
                    ),
                    isDenied: error.code === error.PERMISSION_DENIED
                });
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
};

// IP-based Location handler
const getIpBasedLocation = async (): Promise<LocationData> => {
    const response = await fetch('https://ipapi.co/json/');

    if (!response.ok) {
        throw createLocationError('Failed to get IP-based location');
    }

    const data = await response.json();

    if (!data.latitude || !data.longitude) {
        throw createLocationError('Invalid location data received');
    }

    return formatLocationData(
        [parseFloat(data.longitude), parseFloat(data.latitude)],
        10000, // IP geolocation is typically accurate to ~10km
        LocationSource.IP
    );
};


export const useLocation = (): UseLocationResult => {
    const [locationStatus, setLocationStatus] = useState<LocationStatus>(LocationStatus.IDLE);
    const [locationError, setLocationError] = useState<string>('');
    const [location, setLocation] = useState<LocationData | null>(null);

    // const resetLocation = () => {
    //     setLocationStatus('idle');
    //     setLocationError('');
    //     setLocation(null);
    // };

    const updateState = (
        newLocation: LocationData | null,
        newStatus: LocationStatus,
        newError: string = ''
    ): void => {
        setLocation(newLocation);
        setLocationStatus(newStatus);
        setLocationError(newError);
    };
    
    // Try each location method in sequence 
    const tryLocationMethod = async <T extends LocationData>(
        method: LocationMethod<T>,
        methodName: string
    ): Promise<T> => {
        try {
            const result = await method();
            if (!isValidCoordinates(result.coordinates)) {
                throw createLocationError(`Invalid coordinates from ${methodName}`);
            }
            return result;
        } catch (error) {
            console.warn(`${methodName} failed:`, error);
            throw error;
        }
    };

    const getLocation = async (): Promise<LocationData> => {
        updateState(null, LocationStatus.LOADING);

        try {
            // Try browser geolocation
            try {
                const { data: browserLocation, isDenied } = await getBrowserLocation();
                if (isDenied) {
                    updateState(null, LocationStatus.DENIED);
                    throw createLocationError('Location access denied', true);
                }
                updateState(browserLocation, LocationStatus.SUCCESS);
                return browserLocation;
            } catch (error) {
                if (isLocationError(error) && error.isDenied) throw error;

                // Try Google Maps Geolocation API
                try {
                    const googleMapsApiKey = `${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API}`;
                    const googleLocation = await tryLocationMethod(
                        () => getGoogleLocation(googleMapsApiKey),
                        'Google Maps Geolocation'
                    );
                    updateState(googleLocation, LocationStatus.SUCCESS);
                    return googleLocation;
                } catch (googleError) {
                    console.warn('Google Maps Geolocation failed:', googleError); // Use the error
                    // Try IP-based location as final fallback
                    const ipLocation = await tryLocationMethod(
                        getIpBasedLocation,
                        'IP-based location'
                    );
                    updateState(ipLocation, LocationStatus.SUCCESS);
                    return ipLocation;
                }
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to get location';
            updateState(
                null,
                LocationStatus.ERROR,
                errorMessage
            );
            throw new Error(errorMessage);
        }
    };
    
    return {
        location,
        locationStatus,
        locationError,
        getLocation,
        // resetLocation
    } as const;
};