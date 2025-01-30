"use client"

import React, { useMemo, useState } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlacesAutocomplete } from '@/app/components/ui/places-autocomplete';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRequesterSocket } from '@/app/hooks/useRequesterSocket';
import { useAuthContext } from '@/contexts/auth-context';

type Service = string;

const INITIAL_SERVICES: Service[] = [
    'Plumbing',
    'Electrician',
    'Painting',
    'Mechanic',
    'Carpenter',
    'Cleaning'
];

const GOOGLE_MAPS_API_KEY = `${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API}`;
interface Location {
    lat: number,
    lng: number
}

const Page = () => {
    const { user, loading } = useAuthContext();
    const [availableServices, setAvailableServices] = useState<Service[]>(INITIAL_SERVICES);
    const [selectedServices, setSelectedServices] = useState<Service[]>([]);
    const [location, setLocation] = useState<Location | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    useRequesterSocket(user?.userId, setError);

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: ['places'],
    });

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

    const handleServiceSelect = (service: string) => {
        setSelectedServices(prev => [...prev, service]);
        setAvailableServices(prev => prev.filter(s => s !== service));
    };

    const handleServiceRemove = (service: Service) => {
        setSelectedServices(prev => prev.filter(s => s !== service));
        setAvailableServices(prev => [...prev, service].sort());
    };

    // if (!isLoaded) {
    //     return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    // }

    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);

        const requestData = {
            longitude: location?.lng,
            latitude: location?.lat,
            userId: user?.userId,
            services: selectedServices,
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/request/provider`, {
                method: 'POST',
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
            }
        } catch (err) {
            console.log(err);
            setError('Failed to submit request. Please try again.');
        }
        // finally {
        //     setIsLoading(false);
        // }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Request a Service</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Location Search */}
                    <div className="space-y-4">
                        <PlacesAutocomplete setLocation={setLocation} />

                        {/* Map Container */}
                        <div className="w-full h-64 rounded-lg overflow-hidden">
                            {/* Google Maps would be integrated here */}
                            <GoogleMap
                                zoom={14}
                                center={mapCenter}
                                mapContainerClassName="w-full h-full"
                                options={mapOptions}
                            >
                                {location && <Marker position={{ lat: location.lat, lng: location.lng }} />}
                            </GoogleMap>
                        </div>
                    </div>

                    {/* Services Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select Services</label>
                        <Select onValueChange={handleServiceSelect}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select services..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {availableServices.map((service) => (
                                        <SelectItem key={service} value={service}>
                                            {service}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Selected Services */}
                    <div className="flex flex-wrap gap-2">
                        {selectedServices.map((service) => (
                            <Badge
                                key={service}
                                variant="secondary"
                                className="px-3 py-1 flex items-center gap-2"
                            >
                                {service}
                                <button
                                    onClick={() => handleServiceRemove(service)}
                                    className="text-gray-500 hover:text-gray-700"
                                    aria-label={`Remove ${service}`}
                                >
                                    ×
                                </button>
                            </Badge>
                        ))}
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Submit Button */}
                    <Button
                        className="w-full"
                        disabled={selectedServices.length === 0 || isLoading || !location}
                        onClick={handleSubmit}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Finding Provider...
                            </>
                        ) : (
                            'Submit Request'
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default Page