"use client"

import { Disclosure } from "@headlessui/react";
import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react";
import { useState } from "react";
import { Wrench, Zap, Paintbrush, Car, Home, Plus, Hammer } from 'lucide-react';
import { Button } from "@/components/ui/button";
import VisitingChargeModal from "@/app/components/modal/VisitingChargeModal";
import { useLocation } from "@/app/hooks/useLocation";
import { LocationStatus } from "@/app/components/Location/LocationStatus";
import useHttp from "@/app/hooks/use-http";
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";


// Interface for service items
interface ServiceItem {
    icon: LucideIcon,
    serviceType: string,
    visitingCharge?: number;
}

interface SelectedServiceItem {
    serviceType: string,
    visitingCharge: number
}

// Props interface for ServiceCard component
interface ServiceCardProps {
    icon: LucideIcon;
    serviceType: string;
    selected: boolean;
    onServiceClick: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
    icon: Icon,
    serviceType,
    selected,
    onServiceClick
}) => (
    <Card
        className={`cursor-pointer transition-all hover:scale-105 ${selected ? 'ring-2 ring-primary bg-primary/5' : ''
            }`
        }
    >
        <CardContent className="p-4 flex flex-col items-center gap-4 relative" onClick={(e) => {
            e.stopPropagation();
            onServiceClick();
        }}
        >
            <div
                className="w-24 h-16 relative flex-shrink-0 flex items-center justify-center"
            >
                <Icon className="w-12 h-12 text-primary" />
            </div>
            <div className="flex flex-col">
                <span className="font-medium text-lg">{serviceType}</span>
            </div>
        </CardContent>
    </Card>
);

const Page: React.FC = () => {
    const [selectedServices, setSelectedServices] = useState<SelectedServiceItem[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentService, setCurrentService] = useState<string>('');
    const {error, sendRequest, isLoading} = useHttp();    
    const router = useRouter();

    const {
        getLocation,
        location,
        locationError,
        locationStatus
    } = useLocation();

    const services: ServiceItem[] = [
        { icon: Wrench, serviceType: 'Plumbing' },
        { icon: Zap, serviceType: 'Electrician' },
        { icon: Paintbrush, serviceType: 'Painting' },
        { icon: Car, serviceType: 'Mechanic' },
        { icon: Hammer, serviceType: 'Carpenter' },
        { icon: Home, serviceType: 'Cleaning' },
    ];

    const handleServiceClick = (service: string) => {
        setCurrentService(service);
        setModalOpen(true);
    };

    const handleSaveVisitingCharge = (charge: number) => {
        setSelectedServices(prevSelected => {
            const existingService = prevSelected.find(service => service.serviceType === currentService);
            return existingService
                ? prevSelected.map(service =>
                    service.serviceType === currentService
                        ? { ...service, visitingCharge: charge }
                        : service
                )
                : [...prevSelected, {
                    serviceType: currentService,
                    visitingCharge: charge
                }];
        });
        setModalOpen(false);
    };

    console.log(selectedServices);
    const handleContinue = async () => {
        const locationDetails = await getLocation();
        const requestData = {locationDetails,selectedServices};
        sendRequest({
            url: 'provider',
            method: 'POST',
            data: requestData
        },(provider) => {
            if(provider){
                router.push("/provider/dashboard");
            }
        }); 
        // console.log(data);
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {isLoading && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <Loader2 className="h-8 w-8 animate-spin text-black" />
                </div>
            )}

            {/* Error Message */}
            {error && (
                <Alert variant="destructive" className="fixed top-16 right-4 w-auto max-w-md z-50">
                    <AlertDescription>
                        {error.message}
                    </AlertDescription>
                </Alert>
            )}

            {/* Header */}
            <Disclosure as="nav" className="bg-black">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="relative flex h-14 items-center justify-between">
                        <div className="flex items-center">
                            <div className="mr-4 flex-shrink-0">
                                <a className="text-white text-2xl">NearBy</a>
                            </div>
                        </div>
                    </div>
                </div>
            </Disclosure>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                            What services do you provide?
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Select the type of service you offer to get started
                        </p>
                    </div>

                    <LocationStatus
                        error={locationError}
                        onRetry={getLocation}
                        source={location?.source}
                        status={locationStatus}
                    />

                    {/* Service Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {services.map((service) => (
                            <ServiceCard
                                key={service.serviceType}
                                icon={service.icon}
                                serviceType={service.serviceType}
                                selected={selectedServices.some(s => s.serviceType === service.serviceType)}
                                onServiceClick={() => handleServiceClick(service.serviceType)}
                            />
                        ))}

                        {/* Add Custom Service Card */}
                        <Card className="cursor-pointer hover:scale-105 transition-all border-dashed">
                            <CardContent className="p-6 flex flex-col items-center gap-4">
                                <Plus className="w-12 h-12 text-gray-400" />
                                <span className="font-medium text-lg text-gray-600">Add Custom Service</span>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Continue Button */}
                    <div className="flex justify-end">
                        <Button
                            size="lg"
                            disabled={selectedServices.length === 0 || locationStatus === 'loading'}
                            className="px-8"
                            onClick={handleContinue}
                        >
                            {locationStatus === 'loading' ? 'Getting Location...' :
                                `Continue (${selectedServices.length})`}
                        </Button>
                    </div>
                </div>
            </main>

            <VisitingChargeModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                selectedService={currentService}
                onSave={handleSaveVisitingCharge}
            />
        </div>
    )
}

export default Page