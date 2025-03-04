'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useLoadScript, Libraries } from '@react-google-maps/api';

// Define types for the context value
interface GoogleMapsContextValue {
    isLoaded: boolean;
    loadError: Error | undefined;
}

// Define props for the provider component
interface GoogleMapsProviderProps {
    children: ReactNode;
}

// Specify the libraries type
const libraries: Libraries = ['places'];

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API as string;

// Create context with type
const GoogleMapsContext = createContext<GoogleMapsContextValue>({
    isLoaded: false,
    loadError: undefined
});      

export function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries
    });

    return (
        <GoogleMapsContext.Provider value={{ isLoaded, loadError}}>
            {children}
        </GoogleMapsContext.Provider>
    );
}

export const useGoogleMaps = () : GoogleMapsContextValue => useContext(GoogleMapsContext);