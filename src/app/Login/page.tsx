"use client"

import { useState } from "react";
import LoginNav from "../components/navbar/loginNav"
import useHttp from "../hooks/use-http";

interface phoneOrEmail {
    input: string
}

type AuthType = 'EMAIL' | 'PHONE';

interface AuthRequest {
    email?: string;
    phone?: string;
    authType: AuthType;
}

export default function Page() {    
    const [input, setInput] = useState<string>('');
    const [inputError, setInputError] = useState<string>('');

    const { error, isLoading, sendRequest } = useHttp<phoneOrEmail>();

    const validateInput = (input: string) => {
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const phonePattern = /^(\+?\d{1,4}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;

        const cleanInput = input.trim();

        if (emailPattern.test(cleanInput)) {
            return {
                type: 'EMAIL' as AuthType,
                value: cleanInput,
                isValid: true
            };
        }

        // Clean phone number before validation
        const cleanPhone = cleanInput.replace(/[^\d+]/g, '');
        if (phonePattern.test(cleanInput)) {
            return {
                type: 'PHONE' as AuthType,
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

            const requestData: AuthRequest = validation.type === 'EMAIL'
                ? { email: validation.value, authType: 'EMAIL' }
                : { phone: validation.value, authType: 'PHONE' };

            sendRequest({
                url: "auth/initiate",
                method: "POST",
                data: requestData
            }, (newUser) => {
                console.log(newUser);
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
                            className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 focus:ring-1 focus:ring-black focus:outline-none text-gray-900 placeholder-gray-500"
                        />
                        {inputError && <div className="error-message">{inputError}</div>}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-black text-white rounded-lg py-3 px-4 font-medium hover:bg-zinc-800 transition-colors"
                    >
                        Continue
                    </button>
                </form>
            </div>
        </>
    )
}