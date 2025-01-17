"use client"

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import LoginNavbar from '../navbar/LoginNavbar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuthContext } from "@/contexts/auth-context";
export interface FormData {
    firstName: string;
    lastName: string;
}

const SignUpForm = () => {

    const { signUp, isLoading, error } = useAuthContext();
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        defaultValues: {
            firstName: '',
            lastName: ''
        }
    });
    
    const onSubmit = async (formData: FormData) => {
        const { success, data} = await signUp(formData);
        if (success) {
            if (data.role === 0) {
                router.push('/provider/services');
            }else if (data.role === 1) {
                router.push('/requester/dashboard');
            }
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {isLoading && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-700" />
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

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="firstName" className="text-sm font-medium">
                                    First name
                                </label>
                                <Input
                                    id="firstName"
                                    {...register('firstName', {
                                        required: { value: true, message: 'First Name is required' },
                                        minLength: { value: 2, message: "First Name must be at least 2 characters" },
                                        pattern: { value: /^[a-zA-Z\s-']+$/, message: "First Name can only contain letters, spaces, hyphens, and apostrophes" }
                                    })}
                                    className="bg-gray-200 focus:bg-white"
                                    disabled={isSubmitting}
                                    name="firstName"
                                    placeholder="Enter first name"
                                    autoComplete='off'
                                />
                                {errors.firstName && (
                                    <p id="firstName-error" className="text-sm text-red-500 mt-1">
                                        {errors.firstName.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="lastName" className="text-sm font-medium">
                                    Last name
                                </label>
                                <Input
                                    id="lastName"
                                    {...register('lastName', {
                                        required: { value: true, message: 'Last Name is required' },
                                        minLength: { value: 2, message: "Last Name must be at least 2 characters" },
                                        pattern: { value: /^[a-zA-Z\s-']+$/, message: "Last Name can only contain letters, spaces, hyphens, and apostrophes" }
                                    })}
                                    className="bg-gray-200 focus:bg-white"
                                    disabled={isSubmitting}
                                    name="lastName"
                                    placeholder="Enter last name"
                                    autoComplete='off'
                                />
                                {errors.lastName && (
                                    <p id="lastName-error" className="text-sm text-red-500 mt-1">
                                        {errors.lastName.message}
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