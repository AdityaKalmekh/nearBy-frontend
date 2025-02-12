import { useEffect, useRef, useState } from "react";
import RequesterNavbar from "../navbar/RequesterNav";
import { ProviderInfo } from "@/app/requester/[requestId]/page";
import React from "react";
import { Location } from "./ProviderMap";
import { Info, SendHorizontal } from "lucide-react";

interface Props {
    provider: ProviderInfo;
    providerLocation: Location | null;
}

export const RequesterTracking: React.FC<Props> = ({
    provider,
    providerLocation
}) => {
    const [message, setMessage] = useState("");
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [providerMarker, setProviderMarker] = useState<google.maps.Marker | null>(null);
    const [requesterMarker, setRequesterMarker] = useState<google.maps.Marker | null>(null);
    const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

    useEffect(() => {
        if (!mapRef.current) return;

        const mapInstance = new google.maps.Map(mapRef.current, {
            zoom: 15,
            center: {
                lat: provider.reqLocation.coordinates[1],
                lng: provider.reqLocation.coordinates[0]
            },
            disableDefaultUI: true,
            zoomControl: true
        });

        // Create requester marker
        const rMarker = new google.maps.Marker({
            position: {
                lat: provider.reqLocation.coordinates[1],
                lng: provider.reqLocation.coordinates[0]
            },
            map: mapInstance,
            icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            }
        });

        // Create provider marker (initially hidden)
        const pMarker = new google.maps.Marker({
            map: mapInstance,
            icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
            },
            visible: false
        });

        const renderer = new google.maps.DirectionsRenderer({
            map: mapInstance,
            suppressMarkers: true,
            polylineOptions: {
                strokeColor: '#2563eb',
                strokeWeight: 4
            }
        });

        setMap(mapInstance);
        setProviderMarker(pMarker);
        setRequesterMarker(rMarker);
        setDirectionsRenderer(renderer);
    }, [provider.reqLocation.coordinates]);

    useEffect(() => {
        if (!map || !providerMarker || !requesterMarker || !directionsRenderer || !providerLocation) return;

        const providerPosition = {
            lat: providerLocation.coordinates[1],
            lng: providerLocation.coordinates[0]
        };

        // Update provider marker
        providerMarker.setPosition(providerPosition);
        providerMarker.setVisible(true);

        // Update route
        const directionsService = new google.maps.DirectionsService();
        directionsService.route({
            origin: providerPosition,
            destination: requesterMarker.getPosition()!,
            travelMode: google.maps.TravelMode.DRIVING
        }, (result, status) => {
            if (status === 'OK' && result) {
                directionsRenderer.setDirections(result);
            }
        });
    }, [providerLocation, map, providerMarker, requesterMarker, directionsRenderer]);

    const handleSendMessage = () => {
        console.log({ message });
    }

    const onCancel = async () => {
        try {
            // await fetch(`/api/cancel-request/${requestId}`, { method: 'POST' });
            // router.push('/');
        } catch (err) {
            console.error('Failed to cancel request:', err);
        }
    };

    return (
        <>
            <div className="min-h-screen flex flex-col">
                <RequesterNavbar />

                <div className="flex-1 flex flex-col md:flex-row">
                    {/* Left Panel - Provider Details */}
                    <div className="order-2 md:order-1 flex-1 md:w-1/2 p-2 sm:p-5">
                        <div className="bg-white rounded-lg shadow-md p-6 h-full">
                            {/* Meeting Location */}
                            <div className="relative flex justify-between items-start mb-4">
                                <h2 className="text-xl font-semibold mb-4">Meet at Janpath Socity</h2>
                                {/* Estimated Time */}
                                <div className="flex-shrink-0">
                                    <div className="bg-black text-white px-3 py-2 text-sm">
                                        5 min
                                    </div>
                                </div>
                            </div>

                            {/* PIN Section */}
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-sm">Share PIN with Driver</span>
                                    <button>
                                        <Info className="h-4 w-4 text-gray-500" />
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    {provider.otpInfo.otp.split('').map((digit, index) => (
                                        <div
                                            key={index}
                                            className="w-11 h-11 bg-blue-500 text-white rounded-md flex items-center justify-center font-medium text-lg"
                                        >
                                            {digit}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Driver Info */}
                            <div className="mb-6">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <div className="font-medium">{provider.userInfo.firstName}</div>
                                        <div className="flex items-center mt-1">
                                            <span className="text-sm">★ 5</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Spacer */}
                            <div className="flex-1"></div>

                            {/* Message Input */}
                            <div className="mb-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Send a message..."
                                        className="w-full bg-gray-50 rounded-full py-3 px-4 pr-10 text-sm focus:outline-none"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                    >
                                        <SendHorizontal className="h-5 w-5 text-gray-400" />
                                    </button>
                                </div>
                            </div>

                            {/* Cancel Button */}
                            <button
                                onClick={onCancel}
                                className="w-full py-3 text-red-500 text-center bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>

                    {/* Right Panel - Map */}
                    <div className="order-1 md:order-2 h-[50vh] md:h-auto md:w-1/2 p-2 sm:p-4">
                        <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden" />
                    </div>
                </div>
            </div>
        </>
    )
}