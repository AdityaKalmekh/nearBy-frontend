'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import logo from '@/assets/images/Group 3.jpg'
// import { Search } from 'lucide-react';
import { RequestDetails } from './RequestDetails';
import { useRouter } from 'next/navigation';

interface Location {
    lat: number,
    lng: number
}

const HomeServicesSection = () => {
    const [location, setLocation] = useState<Location | null>(null);
    // const [selectedService, setSelectedService] = useState<string>();
    const [modalOpen, setModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const viewPrices = () => {
        setModalOpen(true);
    }

    const handleContinue = () => {
        router.push('/requester');
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 pt-16 md:pt-10">
                {/* Left Section */}
                <div className="order-2 md:order-1 text-center sm:p-6 lg:pl-14 lg:text-left">
                    <h1 className="text-5xl font-bold tracking-wide leading-tight text-gray-900 mb-12 lg:ml-5">
                        Get services<br />anywhere.
                    </h1>

                    <RequestDetails
                        setLocation={setLocation}
                        location={location}
                        viewPrices={viewPrices}
                        setModalOpen={setModalOpen}
                        modalOpen={modalOpen}
                        handleContinue={handleContinue}
                        error={error}
                        setError={setError}
                    />
                </div>
                {/* Right Section - Services Illustration */}
                <div className="order-1 md:order-2 flex justify-center md:justify-end">
                    <div className="relative w-[90%] md:w-[100%] aspect-[4/3]">
                        <Image
                            src={logo}
                            alt="Service illustrations"
                            fill
                            priority
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeServicesSection;