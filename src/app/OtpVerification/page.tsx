"use client"

import React, { useState, ChangeEvent, KeyboardEvent, useEffect, useRef } from 'react';
import { VerificationState } from '../types/verification';
import { useRouter } from "next/navigation";
import LoginNav from "@/app/components/navbar/LoginNavbar";
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthContext } from '@/contexts/auth-context';

const Page = () => {
    const { user, verifyOtp, error, isLoading, loading } = useAuthContext();
    const router = useRouter();
    const hasMounted = useRef(false);
    const initialState: VerificationState = {
        code: ['', '', '', ''],
        timer: 2,
        phoneNoOrEmail: user?.contactOrEmail || ''
    };
    const [state, setState] = useState<VerificationState>(initialState);

    console.log(user);
    
    useEffect(() => {
        if (!hasMounted.current) {
            hasMounted.current = true;
            return;
        }
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-white relative">
                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                </div>
            </div>
        );
    }

    if (!user || !user.contactOrEmail) {
        router.push(`/${user?.role}`);
        return null;
    }

    const handleInputChange = async (index: number, value: string): Promise<void> => {
        if (value.length <= 1 && /^\d*$/.test(value)) {
            const newCode = [...state.code];
            newCode[index] = value;
            setState(prevState => ({
                ...prevState,
                code: newCode
            }));

            // Auto-focus next input
            if (value && index < 3) {
                const nextInput = document.getElementById(`code-${index + 1}`);
                if (nextInput instanceof HTMLInputElement) {
                    nextInput.focus();
                }
            }
            if (newCode.every(digit => digit.trim() !== '')) {
                if (!user) {
                    router.push('/');
                    return;
                }
                const otp = newCode.join('');
                const verificationData = {
                    otp,
                    userId: user.userId!, // Add non-null assertion if you're sure it exists
                    authType: user.authType!,
                    role: user.role!,
                    contactOrEmail: user.contactOrEmail!,
                    providerId: user.providerId!
                };
                const { status, success, role } = await verifyOtp(verificationData);
                
                if (success) {
                    if (status === 'pending') {
                        router.push("/signup");
                    } else if (status === 'service_details_pending') {
                        router.push('/provider/services');
                    } else if (role === 0) {
                        router.push("/provider/dashboard");
                    } else if (role === 1) {
                        router.push("/requester/dashboard");
                    }
                }
            }
            // else{
            //     console.log("Invalid otp");
            // }
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Backspace' && !state.code[index] && index > 0) {
            const prevInput = document.getElementById(`code-${index - 1}`);
            if (prevInput instanceof HTMLInputElement) {
                prevInput.focus();
            }
        }
    };

    const handleBack = (): void => {
        router.push("/Login");
    };

    const handleResendCode = (): void => {
        setState(prevState => ({
            ...prevState,
            timer: 2,
            code: ['', '', '', '']
        }));
        // Add your resend code logic here
    };

    const handleNextClick = (): void => {
        const verificationCode = state.code.join('');
        if (verificationCode.length === 4) {
            // Add your verification logic here
            console.log('Verification code:', verificationCode);
        }
    };

    const isCodeComplete = state.code.every(digit => digit !== '');

    return (
        <div className="min-h-screen bg-white relative">
            {/* Fullscreen Loader */}
            {isLoading || loading && (
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
            <LoginNav />

            {/* Main Content */}
            <main className="max-w-md mx-auto p-6">
                <div className="space-y-6">
                    {user.isNewUser ? (<h2 className="text-2xl font-semibold text-center">
                        {/* Welcome back, {user?.firstName}. */}
                        Enter the 4-digit code sent to you at {user.contactOrEmail}.
                    </h2>) : (
                        <div>
                            <h2 className='text-2xl font-semibold text-center'>
                                Welcome back, {user.firstName}.
                            </h2>

                            <p className="text-center text-gray-700 mt-4">
                                Enter the 4-digit code sent to you at {user.contactOrEmail}.
                            </p>
                        </div>
                    )}

                    {/* Verification Code Input */}
                    <div className="flex justify-center gap-2">
                        {state.code.map((digit, index) => (
                            <input
                                key={index}
                                id={`code-${index}`}
                                type="text"
                                inputMode="numeric"
                                pattern="\d*"
                                maxLength={1}
                                value={digit}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    handleInputChange(index, e.target.value)
                                }
                                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
                                    handleKeyDown(index, e)
                                }
                                className="w-12 h-12 text-center border-2 border-gray-300 rounded-lg text-xl 
                            focus:border-black focus:outline-none transition-colors"
                                aria-label={`Digit ${index + 1}`}
                                autoComplete='off'
                            />
                        ))}
                    </div>

                    {/* Additional Options */}
                    <div className="space-y-4">
                        <button
                            onClick={handleResendCode}
                            disabled={state.timer > 0}
                            className="w-full text-gray-500 text-center py-2 disabled:opacity-50"
                        >
                            Resend code via SMS ({state.timer}:0{state.timer})
                        </button>
                        <button className="w-full text-gray-700 font-medium text-center py-2">
                            More options
                        </button>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between mt-8">
                        <button
                            onClick={handleBack}
                            className="p-4 rounded-full hover:bg-gray-100 transition-colors"
                            aria-label="Go back"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                        </button>
                        <button
                            onClick={handleNextClick}
                            disabled={!isCodeComplete}
                            className={`px-6 py-2 rounded-full transition-colors ${isCodeComplete
                                ? 'bg-black text-white'
                                : 'bg-gray-100 text-gray-400'
                                }`}
                        >
                            Next →
                        </button>
                    </div>

                    {/* Changed number link */}
                    <div className="text-center">
                        <a
                            href="#"
                            className="text-black underline hover:text-gray-700 transition-colors"
                            onClick={(e) => {
                                e.preventDefault();
                                // Add your change number logic here
                            }}
                        >
                            Changed your mobile number?
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Page;