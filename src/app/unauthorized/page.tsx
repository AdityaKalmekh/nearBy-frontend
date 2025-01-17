"use client"

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const UnauthorizedAccess = () => {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <AlertTriangle className="mx-auto h-16 w-16 text-yellow-500" />
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">Unauthorized Access</h2>
                    <p className="mt-2 text-lg text-gray-600">
                        You don&apos;t have permission to access this page
                    </p>
                </div>

                <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertTitle className="text-yellow-800 font-semibold">
                        Access Restricted
                    </AlertTitle>
                    <AlertDescription className="text-yellow-700">
                        This area is restricted to authorized users only. Please make sure you&apos;re logged in with the correct account type.
                    </AlertDescription>
                </Alert>

                <div className="space-y-4">
                    <button
                        onClick={() => router.back()}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    >
                        Go Back
                    </button>
                    
                    <button
                        onClick={() => router.push('/')}
                        className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UnauthorizedAccess;