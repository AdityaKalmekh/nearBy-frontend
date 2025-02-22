'use client'

import React from 'react';
import Image from 'next/image';
import logo from '@/assets/images/Group 3.jpg'
import { Search } from 'lucide-react';

const HomeServicesSection = () => {
    const [location, setLocation] = React.useState<string>('');
    const [service, setService] = React.useState<string>('');

    return (
        <div className="min-h-[calc(100vh-64px)] bg-white">
            <div className="container mx-auto px-6 md:px-8 pt-16 md:pt-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Left Section */}
                    <div className="order-2 md:order-1 max-w-md mx-auto md:mx-0 md:ml-12 w-full text-center md:text-left">
                        <h1 className="text-5xl font-bold text-gray-900 mb-12">
                            Get services<br />anywhere .
                        </h1>

                        <div className="space-y-4">
                            {/* Location Input */}
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                    <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                                </div>
                                <input
                                    type="text"
                                    placeholder="location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full pl-8 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 9l7 7 7-7" />
                                    </svg>
                                </div>
                            </div>

                            {/* Services Input */}
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                    <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                                </div>
                                <input
                                    type="text"
                                    placeholder="services"
                                    value={service}
                                    onChange={(e) => setService(e.target.value)}
                                    className="w-full pl-8 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            {/* Find Now Button */}
                            <button className="w-full bg-blue-600 text-white px-6 py-2.5 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors mt-2">
                                <span className="text-sm font-medium">Find now</span>
                                <Search size={18} />
                            </button>
                        </div>
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
        </div>
    );
};

export default HomeServicesSection;