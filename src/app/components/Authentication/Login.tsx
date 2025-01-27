"use client"

import { useRouter, usePathname } from "next/navigation";
import LoginNav from "@/app/components/navbar/LoginNavbar";
import { useForm } from 'react-hook-form';
import { useAuthContext } from "@/contexts/auth-context";
import { Alert, AlertDescription } from "@/components/ui/alert";

type FormInputs = {
    contactInfo: string;
}

type AuthType = 'Email' | 'PhoneNo';
interface AuthRequest {
    role: string,
    email?: string;
    phoneNo?: string;
    authType: AuthType;
}

export default function Login() {
    const router = useRouter();
    const pathName = usePathname();
    const role = pathName.split('/')[1];
    const { initiateAuth, error, isLoading, clearError } = useAuthContext();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
        reset,
        clearErrors
    } = useForm<FormInputs>({
        defaultValues: {
            contactInfo: ''
        }
    });

    // Watch for input changes to clear errors
    const handleInputFocus = () => {
        clearErrors('contactInfo');
        if (error) {
            clearError?.();
        }
    }
    
    const errorMessage = errors.contactInfo?.message || error?.message;
    const validateInput = (input: string) => {
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const phonePattern = /^(\+?\d{1,4}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;

        const cleanInput = input.trim();

        if (emailPattern.test(cleanInput)) {
            return {
                type: 'Email' as AuthType,
                value: cleanInput,
                isValid: true
            };
        }

        // Clean phone number before validation
        const cleanPhone = cleanInput.replace(/[^\d+]/g, '');
        if (phonePattern.test(cleanInput)) {
            return {
                type: 'PhoneNo' as AuthType,
                value: cleanPhone,
                isValid: true
            };
        }

        return {
            value: cleanInput,
            isValid: false
        };
    };

    const onSubmit = async (data: FormInputs) => {
        try {
            const validation = validateInput(data.contactInfo);

            if (!validation.isValid) {
                const isPhoneNo = /^\d+(\.\d+)?$/;
                setError('contactInfo', {
                    type: 'manual',
                    message: isPhoneNo.test(validation.value) ?
                        'Please enter a valid phone number' :
                        'Please enter a valid email'
                })
                return;
            }

            const requestData: AuthRequest = validation.type === 'Email'
                ? { email: validation.value, authType: 'Email', role: role }
                : { phoneNo: validation.value, authType: 'PhoneNo', role: role };


            const otpResult = await initiateAuth(requestData);

            if (otpResult) {
                reset();
                router.push(`/verification`);
            } 
        } catch (error) {
            setError('contactInfo', {
                type: 'manual',
                message: error instanceof Error ? error.message : 'An error occurred'
            });

            reset({ contactInfo: '' }, { 
                keepErrors: true,
                keepDirtyValues: false,
                keepIsSubmitted: false,
                keepTouched: false,
                keepIsValid: false,
                keepSubmitCount: false
            });
        }
    };

    return (
        <>
            <LoginNav />
            <div className="w-full max-w-sm mx-auto p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <h1 className="text-xl font-semibold text-gray-900">
                            What&apos;s your phone number or email?
                        </h1>

                        <input
                            type="text"
                            {...register('contactInfo', {
                                required: 'Please enter a phone number or email'
                            })}
                            disabled={isLoading || isSubmitting}
                            placeholder="Enter phone number or email"
                            className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 focus:ring-1 focus:ring-black focus:outline-none text-gray-900 placeholder-gray-500"
                            autoComplete="off"
                            onFocus={handleInputFocus}
                        />
                        {(errorMessage) && (
                            <div className="flex items-center space-x-2 text-red-500 text-sm mt-1">
                                <Alert variant="destructive">
                                    <AlertDescription>{errorMessage}</AlertDescription>
                                </Alert>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || isSubmitting}
                        className={`w-full relative bg-black text-white rounded-lg py-3 px-4 font-medium 
                            ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-zinc-800'} 
                            transition-colors`}
                    >
                        {(isLoading || isSubmitting) ? (
                            <div className="flex items-center justify-center">
                                <svg
                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Processing...
                            </div>
                        ) : (
                            'Continue'
                        )}
                    </button>
                </form>
            </div>
        </>
    )
}