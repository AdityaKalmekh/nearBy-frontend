"use client"

import { Location } from "@/app/components/Location/ProviderMap";
import { RequesterTracking } from "@/app/components/Location/RequesterTracking";
import useHttp from "@/app/hooks/use-http";
import { useRequesterSocket } from "@/app/hooks/useRequesterSocket";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthContext } from "@/contexts/auth-context";
import { useLoadScript } from "@react-google-maps/api";
import { AlertCircle, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
export interface ProviderInfo {
    userInfo: {
        firstName: string;
        lastName: string;
        phoneNo: string;
        email: string;
    },
    otpInfo: {
        otp: string;
    },
    reqLocation: Location;
    prvLocation: Location;  
}

const GOOGLE_MAPS_API_KEY = `${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API}`;
const Page = () => {
    const { requestId } = useParams();
    const { userId } = useAuthContext();
    const { error, sendRequest, isLoading } = useHttp<ProviderInfo>();
    // const [socketError, setSocketError] = useState<string | null>(null);
    const [provider, setProvider] = useState<ProviderInfo>();
    const { providerLocation } = useRequesterSocket(userId);
    const router = useRouter();

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: ['places'],
    });

    useEffect(() => {
        const fetchProviderDetails = async () => {
            return new Promise ((resolve) => {
                sendRequest({
                    url: `request/provider-details/${requestId}`,
                    method: "GET",
                }, (response) => {
                    const providerDetails = response as ProviderInfo;
                    if(providerDetails) {
                        setProvider(providerDetails);
                        resolve(true);
                    }
                }) 
            })
        }

        if (requestId) {
            fetchProviderDetails();
        }
    }, [requestId, sendRequest]);

    if (isLoading || !isLoaded) {
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

    console.log({ error });
    // console.log({ socketError });

    return (
        < RequesterTracking
            provider={provider}
            providerLocation={providerLocation}
        />
    )
}

export default Page