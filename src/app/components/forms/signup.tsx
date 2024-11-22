"use client"

import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import LoginNavbar from '../navbar/LoginNavbar';
import useHttp from '@/app/hooks/use-http';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useOtpStore } from '@/app/store/otpStore';
import { useRouter } from 'next/navigation';

interface FormData {
    firstName: string;
    lastName: string;
}
interface FormErrors {
    firstName?: string;
    lastName?: string;
}
interface SignUpResponse {
    success: boolean;
}

const SignUpForm = () => {
    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: ''
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isValid, setIsValid] = useState(false);
    const { error, sendRequest, isLoading } = useHttp();
    const userData = useOtpStore(state => state.otpData);
    const router = useRouter();

    // Validation rules
    const validateField = (name: string, value: string): string => {
        if (!value.trim()) {
            return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
        }
        if (value.trim().length < 2) {
            return `${name.charAt(0).toUpperCase() + name.slice(1)} must be at least 2 characters`;
        }
        if (!/^[a-zA-Z\s-']+$/.test(value)) {
            return `${name.charAt(0).toUpperCase() + name.slice(1)} can only contain letters, spaces, hyphens, and apostrophes`;
        }
        return '';
    };

    // Validate form on data change
    useEffect(() => {
        const newErrors: FormErrors = {};
        newErrors.firstName = validateField('firstName', formData.firstName);
        newErrors.lastName = validateField('lastName', formData.lastName);

        setErrors(newErrors);
        setIsValid(!newErrors.firstName && !newErrors.lastName);
    }, [formData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isValid) {
            sendRequest({
                url: "details",
                method: "PATCH",
                data: formData
            }, (response) => {
                const userDetail = response as SignUpResponse;
                if (userDetail.success) {
                    if (userData?.role === 0) {
                        router.push("/provider/services");
                    } else if (userData?.role === 1) {
                        router.push("/requester/dashboard");
                    }
                }
            })
        }
    };

    return (
        <div className="min-h-screen bg-white">
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
            <LoginNavbar />

            {/* Main Content */}
            <main className="max-w-screen-xl mx-auto px-4 py-8 md:py-12">
                <div className="max-w-md mx-auto">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight">What&apos;s your name?</h1>
                            <p className="text-gray-500">
                                Let us know how to properly address you
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="firstName" className="text-sm font-medium">
                                    First name
                                </label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    placeholder="Enter first name"
                                    className={`w-full h-12 transition-all duration-200 hover:ring-2 hover:ring-gray-200 focus:ring-2 focus:ring-black
                    ${errors.firstName && 'border-red-500 focus:ring-red-500'}`}
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    aria-invalid={!!errors.firstName}
                                    aria-describedby={errors.firstName ? "firstName-error" : undefined}
                                    autoComplete='off'
                                />
                                {errors.firstName && (
                                    <p id="firstName-error" className="text-sm text-red-500 mt-1">
                                        {errors.firstName}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="lastName" className="text-sm font-medium">
                                    Last name
                                </label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    placeholder="Enter last name"
                                    className={`w-full h-12 transition-all duration-200 hover:ring-2 hover:ring-gray-200 focus:ring-2 focus:ring-black
                    ${errors.lastName && 'border-red-500 focus:ring-red-500'}`}
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    aria-invalid={!!errors.lastName}
                                    aria-describedby={errors.lastName ? "lastName-error" : undefined}
                                    autoComplete='off'
                                />
                                {errors.lastName && (
                                    <p id="lastName-error" className="text-sm text-red-500 mt-1">
                                        {errors.lastName}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-between pt-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="lg"
                                    className="rounded-full"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="rounded-full bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                    disabled={!isValid}
                                >
                                    Next
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SignUpForm;