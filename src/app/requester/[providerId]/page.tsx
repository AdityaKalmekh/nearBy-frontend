"use client"

import useHttp from "@/app/hooks/use-http";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2, MapPin, Phone, User, User2, Copy } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProviderInfo {
    firstName: string;
    lastName: string;
    phoneNo: string;
    otp: string;
    email: string;
}

const Page = () => {
    const { providerId } = useParams();
    const { error, sendRequest, isLoading } = useHttp<ProviderInfo>();
    const [provider, setProvider] = useState<ProviderInfo | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchProviderDetails = async () => {
            sendRequest({
                url: `/request/provider-details/${providerId}`,
                method: "GET",
            }, (response) => {
                console.log(response);
                setProvider(response);
            })
        }

        if (providerId) {
            fetchProviderDetails();
        }
    }, [providerId, sendRequest]);

    const handleCancel = async () => {
        try {
            // await fetch(`/api/cancel-request/${requestId}`, { method: 'POST' });
            // router.push('/');
        } catch (err) {
            console.error('Failed to cancel request:', err);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="w-full max-w-md mx-4">
                    <CardContent className="py-8">
                        <div className="flex flex-col items-center space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-gray-500">Loading provider details...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!provider) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="w-full max-w-md mx-4">
                    <CardContent className="py-8">
                        <div className="flex flex-col items-center space-y-4">
                            <AlertCircle className="h-8 w-8 text-destructive" />
                            <p className="text-sm text-gray-500">Provider not found</p>
                            <Button onClick={() => router.push('/')}>
                                Back to Dashboard
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
                {error && (
                    <Alert variant="destructive" className="fixed top-4 left-4 right-4 md:top-16 md:left-auto md:right-4 md:w-auto md:max-w-md z-50">
                        <AlertDescription>
                            {error.message}
                        </AlertDescription>
                    </Alert>
                )}

                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-center">
                            Provider Details
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Provider Avatar */}
                        <div className="flex justify-center">
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-primary/10 rounded-full flex items-center justify-center">
                                <User className="w-10 h-10 md:w-12 md:h-12 text-primary" />
                            </div>
                        </div>

                        {/* Provider Info */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <User2 className="w-5 h-5 text-gray-500" />
                                    <span className="text-sm font-medium">Name</span>
                                </div>
                                <span className="text-sm">{`${provider?.firstName} ${provider?.lastName}`}</span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <Phone className="w-5 h-5 text-gray-500" />
                                    <span className="text-sm font-medium">Contact</span>
                                </div>
                                <span className="text-sm">{provider?.phoneNo}</span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <MapPin className="w-5 h-5 text-gray-500" />
                                    <span className="text-sm font-medium">Distance</span>
                                </div>
                                {/* <span className="text-sm">{provider.distance.toFixed(1)} km away</span> */}
                            </div>
                        </div>

                        {/* OTP Section */}
                        {provider?.otp && (
                            <div className="mt-6 p-4 bg-primary/5 rounded-lg">
                                <div className="text-center space-y-2">
                                    <h3 className="text-sm font-medium text-gray-600">Verification Code</h3>
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="text-3xl font-bold tracking-wider">
                                            {provider.otp}
                                        </div>
                                        <button
                                            // onClick={handleCopyOTP}
                                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                            aria-label="Copy OTP"
                                        >
                                            <Copy className="w-4 h-4 text-gray-500" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Share this code with your provider to verify
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="space-y-3 pt-4">
                            <Button
                                variant="ghost"
                                className="w-full border border-destructive text-destructive hover:bg-destructive/90 hover:text-white"
                                onClick={handleCancel}
                            >
                                Cancel Request
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

export default Page