"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { useRequesterSocket } from '@/app/hooks/useRequesterSocket';
import { useAuthContext } from '@/contexts/auth-context';
import useHttp from '@/app/hooks/use-http';
import RequesterNavbar from '@/app/components/navbar/RequesterNav';
import { RequestDetails } from '@/app/components/RequestDetails';
import { getDecryptedItem, removeItem } from '@/lib/requestStorage';

const GOOGLE_MAPS_API_KEY = `${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API}`;
interface Location {
    lat: number,
    lng: number
}

interface AvailabilityResponse {
    Availability: boolean
}

const Page = () => {
    const { loading, userId } = useAuthContext();
    // const [availableServices, setAvailableServices] = useState<Service[]>(INITIAL_SERVICES);
    // const [selectedServices, setSelectedServices] = useState<Service[]>([]);
    const [selectedService, setSelectedService] = useState<string>();
    const [location, setLocation] = useState<Location | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const { sendRequest } = useHttp();
    const isInitializedRef = useRef(false);

    useRequesterSocket(userId, setError, setIsLoading);

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: ['places']
    });

    // Function to check provider availability
    const checkProviderAvailability = useCallback((locs: Location, serviceType: string) => {
        setIsLoading(true);

        const requestData = {
            longitude: locs?.lng,
            latitude: locs?.lat,
            userId,
            serviceType: serviceType
        };

        return new Promise((resolve, reject) => {
            sendRequest({
                url: '/providersAvailability',
                method: 'POST',
                data: requestData
            }, (response) => {
                setIsLoading(false);
                const requestResponse = response as AvailabilityResponse;
                console.log({ requestResponse });
                if (requestResponse.Availability) {
                    setModalOpen(true);
                    setSelectedService(serviceType);
                } else {
                    setError('No providers available in your region at this moment.');
                }
                resolve(true);
            }, (error) => {
                setIsLoading(false);
                setError('Failed to check provider availability. Please try again.');
                reject(error);
            });
        });
    }, [sendRequest, userId, setIsLoading, setError, setModalOpen]);

    // Load data from localStorage on component mount
    useEffect(() => {
        // Only proceed if the user is authenticated (not loading) and not already initialized
        if (!loading && userId && !isInitializedRef.current) {
            try {
                const storedLocation = getDecryptedItem('loc-info');
                const storedService = getDecryptedItem('which_s_t');
                
                if (storedLocation && storedService) {
                    setLocation(storedLocation);
                    setSelectedService(storedService);
                    checkProviderAvailability(storedLocation, storedService);
                }
                
                // Mark as initialized to prevent duplicate API calls
                isInitializedRef.current = true;
            } catch (err) {
                console.error("Error when retrieving data from session storage:", err);
            }
        }
    }, [loading, userId, checkProviderAvailability]);

    const viewPrices = React.useCallback(() => {
        if (!location) {
            setError("Please select a location");
            return Promise.reject("Location not selected");
        }

        if (!selectedService) {
            setError("Please select a service");
            return Promise.reject("Service not selected");
        }

        return checkProviderAvailability(location, selectedService);
    }, [location, selectedService, checkProviderAvailability, setError]);
    // const checkProviderAvailability = (locs: Location, serviceType: string) => {
    //     setIsLoading(true);

    //     const requestData = {
    //         longitude: locs?.lng,
    //         latitude: locs?.lat,
    //         userId,
    //         // serviceType: serviceType
    //     };

    //     return new Promise((resolve, reject) => {
    //         sendRequest({
    //             url: '/providersAvailability',
    //             method: 'POST',
    //             data: requestData
    //         }, (response) => {
    //             setIsLoading(false);
    //             const requestResponse = response as AvailabilityResponse;
    //             console.log({ requestResponse });
    //             if (requestResponse.Availability) {
    //                 setModalOpen(true);
    //                 setSelectedService(serviceType);
    //             } else {
    //                 setError('No providers available in your region at this moment.');
    //             }
    //             resolve(true);
    //         }, (error) => {
    //             setIsLoading(false);
    //             setError('Failed to check provider availability. Please try again.');
    //             reject(error);
    //         });
    //     });
    // };

    // Load data from localStorage on component mount
    // useEffect(() => {
    //     // Only proceed if the user is authenticated (not loading)
    //     const viewPrices = (locs: Location, serviceType: string) => {
    //         setIsLoading(true);

    //         const requestData = {
    //             longitude: locs?.lng,
    //             latitude: locs?.lat,
    //             userId,
    //             serviceType: serviceType
    //         };

    //         return new Promise((resolve, reject) => {
    //             sendRequest({
    //                 url: '/providersAvailability',
    //                 method: 'POST',
    //                 data: requestData
    //             }, (response) => {
    //                 setIsLoading(false);
    //                 const requestResponse = response as AvailabilityResponse;
    //                 console.log({ requestResponse });
    //                 if (requestResponse.Availability) {
    //                     setModalOpen(true);
    //                 } else {
    //                     setError('No providers available in your region at this moment.');
    //                 }
    //                 resolve(true);
    //             }, (error) => {
    //                 setIsLoading(false);
    //                 setError('Failed to check provider availability. Please try again.');
    //                 reject(error);
    //             });
    //         });
    //     }

    //     if (!loading && userId) {
    //         try {
    //             const storedLocation = getDecryptedItem('loc-info');
    //             const storedService = getDecryptedItem('which_s_t');
    //             if (storedLocation && storedService) {
    //                 setLocation(storedLocation);
    //                 viewPrices(storedLocation, storedService);
    //             }
    //         } catch (err) {
    //             console.error("Error which retrieving data from session storage:", err);
    //         }
    //     }
    // }, [loading, userId, sendRequest]);

    // Load data from localStorage on component mount
    // useEffect(() => {
    //     // Only proceed if the user is authenticated (not loading)
    //     if (!loading && userId && !isRedirected) {
    //         try {
    //             const storedLocation = getDecryptedItem('loc-info');
    //             const storedService = getDecryptedItem('which_s_t');

    //             if (storedLocation && storedService) {
    //                 setLocation(storedLocation);
    //                 setSelectedService(storedService);
    //                 setIsRedirected(true); // Mark as redirected to prevent multiple calls

    //                 // Slight delay to ensure state updates have propagated
    //                 setTimeout(() => {
    //                     checkProviderAvailability(storedLocation, storedService);
    //                 }, 100);
    //             }
    //         } catch (err) {
    //             console.error("Error when retrieving data from session storage:", err);
    //         }
    //     }
    // }, [loading, userId, isRedirected]);

    const mapCenter = useMemo(() =>
        location ? { lat: location.lat, lng: location.lng } : { lat: 20, lng: 0 },
        [location]
    );

    const mapOptions = useMemo<google.maps.MapOptions>(() => ({
        disableDefaultUI: true,
        clickableIcons: true,
        scrollwheel: true,
    }), []);

    if (loading || !isLoaded) {
        return (
            <div className="min-h-screen bg-white relative">
                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-700" />
                </div>
            </div>
        );
    }

    // const handleServiceSelect = (service: string) => {
    //     // setSelectedServices(prev => [...prev, service]);
    //     // setAvailableServices(prev => prev.filter(s => s !== service));
    //     setError(null);
    //     setSelectedService(service);
    // };

    // const handleServiceRemove = (service: Service) => {
    //     setSelectedServices(prev => prev.filter(s => s !== service));
    //     setAvailableServices(prev => [...prev, service].sort());
    // };

    // if (!isLoaded) {
    //     return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    // }

    const handleContinue = async () => {
        removeItem('which_s_t');
        removeItem('loc-info');
        removeItem('Loc-Txet');
        setIsLoading(true);
        setError(null);
        onClose();

        const requestData = {
            longitude: location?.lng,
            latitude: location?.lat,
            userId,
            // services: selectedServices,
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/request/provider`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            const data = await response.json();

            if (data) {
                setIsLoading(true);
            } else {
                setError('No providers available in your region at this moment.');
                setIsLoading(false);
            }
        } catch (err) {
            console.log(err);
            setError('Failed to submit request. Please try again.');
        }
    };
    
    const onClose = () => {
        setModalOpen(false);
    }

    return (
        <div className="min-h-screen flex flex-col">
            <RequesterNavbar />

            <div className='flex-1 flex flex-col md:flex-row'>
                {/* Left Panel - Service details */}
                <div className='order-2 md:order-1 flex-1 md:w-1/2 sm:p-6 md:pl-14'>
                    <CardHeader>
                        <CardTitle className="text-5xl font-bold tracking-wide leading-tight">Request Service with NearBy</CardTitle>
                    </CardHeader>

                    <RequestDetails
                        setLocation={setLocation}
                        location={location}
                        isLoading={isLoading}
                        viewPrices={viewPrices}
                        setModalOpen={setModalOpen}
                        modalOpen={modalOpen}
                        handleContinue={handleContinue}
                        error={error}
                        setError={setError}
                        selectedService={selectedService}
                        setSelectedService={setSelectedService}
                    />
                </div>
                {/* Right Panel - Map */}
                <div className='order-1 md:order-2 h-[50vh] md:h-auto md:w-1/2 sm:p-6 md:pr-16 pt-6 md:pt-14 px-2 rounded-lg overflow-hidden'>
                    <GoogleMap
                        zoom={14}
                        center={mapCenter}
                        mapContainerClassName="w-full h-full rounded-lg"
                        options={mapOptions}
                    >
                        {location && <Marker position={{ lat: location.lat, lng: location.lng }} />}
                    </GoogleMap>
                </div>
            </div>
        </div>
    );
};

export default Page