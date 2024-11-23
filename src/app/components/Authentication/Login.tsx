"use client"

import useHttp from "../../hooks/use-http";
import { useRouter, usePathname } from "next/navigation";
import { useOtpStore } from "@/app/store/otpStore";
import LoginNav from "@/app/components/navbar/LoginNavbar";
import { useForm } from 'react-hook-form';
interface responseData {
    role: number;
    userId: string;
}

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
    const { error, sendRequest, isLoading } = useHttp<responseData>();
    const pathName = usePathname();
    const role = pathName.split('/')[1];
    const setOtpData = useOtpStore(state => state.setOtpData);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError
    } = useForm<FormInputs>({
        defaultValues: {
            contactInfo: ''
        }
    })

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

            sendRequest({
                url: "auth/initiate",
                method: "POST",
                data: requestData
            }, (user) => {
                setOtpData({
                    contactOrEmail: data.contactInfo,
                    authType: requestData.authType,
                    role: user?.role,
                    userId: user.userId
                })
                router.push('/OtpVerification')
            });
        } catch (error) {
            setError('contactInfo', {
                type: 'manual',
                message: error instanceof Error ? error.message : 'An error occurred'
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
                        />
                        {(errors.contactInfo || error) && (
                            <div className="flex items-center space-x-2 text-red-500 text-sm mt-1">
                                <span>{`${errors.contactInfo?.message}` || `${error?.message}`}</span>
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