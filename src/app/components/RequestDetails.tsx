"use client"

import { CardContent } from "@/components/ui/card"
import { PlacesAutocomplete } from "./ui/places-autocomplete"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import React from "react";
import VisitingChargeModal from "./modal/VisitingCharge";
import { useLoadScript } from "@react-google-maps/api";

interface RequestDetailsProps {
    setLocation: (location: Location) => void;
    location: Location | null;
    isLoading?: boolean;
    viewPrices: () => void;
    setModalOpen: (modalOpen: boolean) => void;
    modalOpen: boolean;
    handleContinue: () => void;
}

interface Location {
    lat: number,
    lng: number
}

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

export const RequestDetails: React.FC<RequestDetailsProps> = ({
    setLocation,
    location,
    isLoading,
    viewPrices,
    setModalOpen,
    modalOpen,
    handleContinue
}) => {
    const [selectedService, setSelectedService] = useState<string>();
    const [error, setError] = useState<string | null>(null);
    // const [modalOpen, setModalOpen] = useState(false);

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: ['places']
    });

    const handleServiceSelect = (service: string) => {
        // setSelectedServices(prev => [...prev, service]);
        // setAvailableServices(prev => prev.filter(s => s !== service));
        setError(null);
        setSelectedService(service);
    };
    console.log(error);

    const onClose = () => {
        setModalOpen(false);
    }

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-white relative">
                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-700" />
                </div>
            </div>
        );
    }
    return (
        <>
            <div>
                <CardContent className='space-y-4 mt-4'>
                    <div className='space-x-4'>
                        <PlacesAutocomplete
                            setLocation={setLocation}
                            setRequestError={setError}
                            location={location}
                        />
                    </div>
                    <div className="space-y-2">
                        {/* <label className="text-sm font-medium">Select Services</label> */}
                        <Select onValueChange={handleServiceSelect}>
                            <SelectTrigger className="w-full lg:w-4/5">
                                <SelectValue placeholder="Select services..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {/* {availableServices.map((service) => (
                                            <SelectItem key={service} value={service}>
                                                {service}
                                            </SelectItem>
                                        ))} */}
                                    {INITIAL_SERVICES.map((service) => (
                                        <SelectItem key={service} value={service} >
                                            {service}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    {error && (
                        <Alert variant="destructive" className='w-4/5'>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <Button
                        className="w-full lg:w-4/5"
                        disabled={!selectedService || isLoading || !location}
                        onClick={viewPrices}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Finding Provider...
                            </>
                        ) : (
                            'View Price'
                        )}
                    </Button>
                </CardContent>

                {selectedService && (
                    <VisitingChargeModal
                        isOpen={modalOpen}
                        onClose={onClose}
                        selectedService={selectedService}
                        handleContinue={handleContinue}
                    />
                )}
            </div>
        </>
    )
}