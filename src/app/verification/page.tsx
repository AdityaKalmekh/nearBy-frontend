"use client"

import React, { useState, ChangeEvent, KeyboardEvent, useEffect, useRef } from 'react';
import { VerificationState } from '../types/verification';
import { useRouter } from "next/navigation";
import LoginNav from "@/app/components/navbar/LoginNavbar";
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthContext } from '@/contexts/auth-context';

const Page = () => {
    const { user, verifyOtp, error, isLoading, loading, reSendOTP, clearError } = useAuthContext();
    const router = useRouter();
    const hasMounted = useRef(false);
    const initialState: VerificationState = {
        code: ['', '', '', ''],
        timer: 30,
        resendCount: 0,
        phoneNoOrEmail: user?.contactOrEmail || ''
    };
    const [state, setState] = useState<VerificationState>(initialState);

    useEffect(() => {
        if (!hasMounted.current) {
            hasMounted.current = true;
            return;
        }
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (state.timer > 0) {
            interval = setInterval(() => {
                setState(prev => ({
                    ...prev,
                    timer: prev.timer - 1,
                }));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [state.timer]);
    
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
        router.back();
        return null;
    }

    const handleVerifyOTP = async (otp: string) => {
        const verificationData = {
            otp,
            userId: user.userId!, // Add non-null assertion if you're sure it exists
            authType: user.authType!,
            role: user.role!,
            contactOrEmail: user.contactOrEmail!,
            isNewUser: user.isNewUser!
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

    const handleInputChange = async (index: number, value: string): Promise<void> => {
        if (error) {
            clearError?.();
        }

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
                handleVerifyOTP(otp);
            }
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
        router.back();
    };

    const handleInputFocus = () => {
        if (error) {
            clearError?.();
        }
    }

    const handleResendCode = async () => {
        setState(prevState => ({
            ...prevState
        }));

        const response = await reSendOTP();
        if (response) {
            setState(prevState => ({
                ...prevState,
                timer: 30,
                code: ['', '', '', ''],
                resendCount: prevState.resendCount + 1
            }));
        } else {
            setState(prevState => ({
                ...prevState,
            }))
        }
    };

    const handleNextClick = (): void => {
        const verificationCode = state.code.join('');
        if (verificationCode.length === 4) {
            handleVerifyOTP(verificationCode);
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

            {/* Header */}
            <LoginNav />

            {/* Main Content */}
            <main className="w-ful max-w-md mx-auto p-6">
                <div className="md:ml-6 space-y-6">
                    {!user.firstName ? (<h2 className="text-2xl font-semibold text-left">
                        Enter the 4-digit code sent to you at: {user.contactOrEmail}
                    </h2>) : (
                        <div>
                            <h2 className='text-2xl font-semibold text-left'>
                                Welcome back, {user.firstName}.
                            </h2>

                            <p className="text-left text-gray-700 mt-4">
                                Enter the 4-digit code sent to you at: {user.contactOrEmail}.
                            </p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* OTP Input Container */}
                        <div className="relative">
                            {/* Verification Code Input */}
                            <div className="flex gap-2">
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
                                        onFocus={handleInputFocus}
                                        className="w-12 h-12 text-center border-2 border-gray-300 rounded-lg text-xl 
                                        focus:border-black focus:outline-none transition-colors"
                                        aria-label={`Digit ${index + 1}`}
                                        autoComplete="off"
                                    />
                                ))}
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mt-2">
                                    <Alert variant="destructive">
                                        <AlertDescription>
                                            {error.message}
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            )}
                            {/* {error && (
                                <div className="w-full mt-2">
                                    <div className='inline-block min-w-48 max-w-[90%]'>
                                        <Alert variant="destructive" className='w-auto'>
                                            <AlertDescription className="text-left">
                                                {error.message}
                                            </AlertDescription>
                                        </Alert>
                                    </div>
                                </div>
                            )} */}
                        </div>
                    </div>

                    {/* Tips section */}
                    {user.authType === 'Email' && (
                        <div className="text-xs text-slate-500">
                            <p>Tip: Make sure to check your inbox and spam folders</p>
                        </div>
                    )}

                    {/* Additional Options */}
                    <div className="space-y-1">
                        <button
                            onClick={handleResendCode}
                            disabled={state.timer > 0}
                            className={`px-4 py-2 bg-gray-200 rounded-full transition-all duration-200 text-sm font-semibold 
                                ${state.timer > 0
                                    ? 'disabled:text-slate-400'
                                    : 'hover:bg-black hover:text-white'
                                }`}
                        >
                            {state.timer > 0
                                ? `I didn't receive a code (${Math.floor(state.timer / 60)}:${String(state.timer % 60).padStart(2, '0')})`
                                : `I didn't receive a code`}
                        </button>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between mt-8">
                        <button
                            onClick={handleBack}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
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
                </div>
            </main>
        </div>
    );
};

export default Page;