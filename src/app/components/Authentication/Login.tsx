"use client"

import { useState } from "react";
import LoginNav from "../navbar/LoginNav";
import useHttp from "../../hooks/use-http";
import { useRouter, usePathname } from "next/navigation";
import { useOtpStore } from "@/app/store/otpStore";

interface phoneOrEmail {
    userId: string;
    input: string
}

type AuthType = 'Email' | 'PhoneNo';

interface AuthRequest {
    role: string,
    email?: string;
    phoneNo?: string;
    authType: AuthType;
}

export default function Login() {
    const [input, setInput] = useState<string>('');
    const [inputError, setInputError] = useState<string>('');
    const router = useRouter();
    const { error, sendRequest, isLoading } = useHttp<phoneOrEmail>();
    const pathName = usePathname();
    const role = pathName.split('/')[1];
    const setOtpData = useOtpStore(state => state.setOtpData);

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
            type: null,
            value: cleanInput,
            isValid: false
        };
    };

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        try {
            const validation = validateInput(input);

            if (!validation.isValid) {
                setInputError('Please enter a valid email or phone number');
                return;
            }

            const requestData: AuthRequest = validation.type === 'Email'
                ? { email: validation.value, authType: 'Email', role: role }
                : { phoneNo: validation.value, authType: 'PhoneNo', role: role };
            
            console.log(requestData);
            
            sendRequest({
                url: "auth/initiate",
                method: "POST",
                data: requestData
            }, (user) => {
                setOtpData({
                    contactOrEmail: input,
                    authType: requestData.authType,
                    role: role,
                    userId: user.userId
                })
                console.log(user);
                router.push('/OtpVerification')
            })
        } catch (error) {
            setInputError(error instanceof Error ? error.message : 'An error occurred');
        }
    };

    return (
        <>
            <LoginNav />
            <div className="w-full max-w-sm mx-auto p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <h1 className="text-xl font-semibold text-gray-900">
                            What&apos;s your phone number or email?
                        </h1>

                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value.trim())}
                            placeholder="Enter phone number or email"
                            // className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 focus:ring-1 focus:ring-black focus:outline-none text-gray-900 placeholder-gray-500"
                            className={`w-full px-4 py-3 rounded-lg bg-gray-100 border-0 
                                ${error || inputError ? 'ring-1 ring-red-500' : 'focus:ring-1 focus:ring-black'} 
                                focus:outline-none text-gray-900 placeholder-gray-500`}
                        />
                        {/* {inputError && <div className="error-message">{inputError}</div>} */}

                        {(error || inputError) && (
                            <div className="flex items-center space-x-2 text-red-500 text-sm mt-1">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span>{`${inputError}` || `${Error}`}</span>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        // className="w-full bg-black text-white rounded-lg py-3 px-4 font-medium hover:bg-zinc-800 transition-colors"
                        className={`w-full relative bg-black text-white rounded-lg py-3 px-4 font-medium 
                            ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-zinc-800'} 
                            transition-colors`}
                    >
                        {isLoading ? (
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
                        {/* Continue */}
                    </button>
                </form>
            </div>
        </>
    )
}