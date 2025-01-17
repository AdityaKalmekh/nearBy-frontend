import { cookieAuth, UserData } from "@/lib/cookieAuth";
import { useEffect, useState } from "react";
import useHttp from "./use-http";
import { FormData } from "../components/forms/signup";
import { LocationData } from "./useLocation";
import { SelectedServiceItem } from "../provider/services/page";

export interface LoginCredentials {
    email: string;
    password: string;
}

interface InitiateRequest {
    success: boolean;
    code: number;
    message: string;
    user: UserData;
    isNewUser: boolean;
}

interface OtpData {
    contactOrEmail: string;
    authType: string;
    role: number;
    userId: string;
    providerId?: string;
    otp?: string
}

interface signUpResult {
    success: boolean,
    data: SignUpResponse
}

export interface AuthContextType {
    isAuthenticated: boolean;
    error: Error | null;
    isLoading: boolean;
    logout: () => void;
    checkAuthStatus: () => void;
    initiateAuth: (requestData: AuthRequest) => Promise<boolean>;
    user: UserData | null;
    verifyOtp: (verificationOTP: OtpData) => Promise<UserVerification>;
    loading: boolean;
    signUp: (formData: FormData) => Promise<signUpResult>;
    registerProvider: (selectedServices: SelectedServiceItem[], locationDetails: LocationData) => Promise<boolean>;
}

type AuthType = 'Email' | 'PhoneNo';

interface AuthRequest {
    role: string,
    email?: string;
    phoneNo?: string;
    authType: AuthType;
}

interface AuthState {
    user: UserData | null;
    isAuthenticated: boolean;
}

interface UserVerification {
    success: boolean;
    code?: number;
    message?: string;
    status: string;
    role: number
}

interface SignUpResponse {
    success: boolean;
    message: string;
    firstName: string;
    lastName: string;
    role: number
}

type ProviderResponse = {
    success: boolean,
    message: string,
    providerId: string
}

export const useAuth = (): AuthContextType => {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        isAuthenticated: false
    });
    const { error, sendRequest, isLoading } = useHttp();
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = (): void => {
        const isAuthenticated = cookieAuth.isAuthenticated();

        if (isAuthenticated) {
            const user = cookieAuth.getUserData();
            setAuthState(prev => ({
                ...prev,
                isAuthenticated,
                user
            }));
            setLoading(false);
        } else {
            const user = cookieAuth.getTempUserData();
            setAuthState(prev => ({
                ...prev,
                isAuthenticated,
                user
            }));
            setLoading(false);
        }
    }

    const initiateAuth = async (requestData: AuthRequest): Promise<boolean> => {
        return new Promise((resolve) => {
            sendRequest({
                url: 'auth/initiate',
                method: 'POST',
                data: requestData
            },
                // Success callback
                (response) => {
                    const initiateRequest = response as InitiateRequest;
                    if (initiateRequest.success) {
                        setAuthState(prev => ({
                            ...prev,
                            user: {
                                userId: initiateRequest.user.userId,
                                authType: initiateRequest.user.authType,
                                role: initiateRequest.user.role,
                                contactOrEmail: requestData.email || requestData.phoneNo || '',
                                providerId: initiateRequest.user.providerId,
                                firstName: initiateRequest.user.firstName,
                                lastName: initiateRequest.user.lastName,
                                verifiedEmail: initiateRequest.user.verifiedEmail,
                                verifiedPhone: initiateRequest.user.verifiedPhone,
                                status: initiateRequest.user.status,
                                isNewUser: initiateRequest.user.isNewUser
                            }
                        }));
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                });
        });
    };

    const verifyOtp = async (verificationOTP: OtpData): Promise<UserVerification> => {
        return new Promise((resolve) => {
            sendRequest({
                url: "auth/verify",
                method: "POST",
                data: verificationOTP
            }, (response) => {
                const userVerification = response as UserVerification;
                if (userVerification.success) {
                    cookieAuth.setAuthCookies();
                    setAuthState(prev => ({
                        ...prev,
                        isAuthenticated: true
                    }));
                    resolve({
                        success: true,
                        status: userVerification.status,
                        role: userVerification.role
                    });
                }
            });
        });
    }

    const signUp = async (formData: FormData): Promise<signUpResult> => {
        return new Promise((resolve) => {
            sendRequest({
                url: 'details',
                method: 'PATCH',
                data: formData
            }, (response) => {
                const signUpResponse = response as SignUpResponse;
                if (signUpResponse.success) {
                    setAuthState((prev) => {
                        if (!prev.user) {
                            return prev;
                        }

                        return {
                            ...prev,
                            user: {
                                ...prev.user,
                                firstName: signUpResponse.firstName,
                                lastName: signUpResponse.lastName
                            }
                        };
                    });
                    resolve({
                        success: true,
                        data: signUpResponse
                    });
                }
                else {
                    resolve({
                        success: false,
                        data: signUpResponse
                    });
                }
            });
        });
    }

    const registerProvider = async (
        selectedServices: SelectedServiceItem[],
        locationDetails: LocationData
    ): Promise<boolean> => {
        const requestData = { locationDetails, selectedServices };

        return new Promise((resolve) => {
            sendRequest({
                url: 'provider',
                method: 'POST',
                data: requestData
            }, (response) => {
                const providerResponse = response as ProviderResponse;
                if (providerResponse.success) {
                    setAuthState((prev) => {
                        if (!prev.user) {
                            return prev;
                        }

                        return {
                            ...prev,
                            user: {
                                ...prev.user,
                                providerId: providerResponse.providerId
                            }
                        };
                    });
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }

    const logout = () => {
        cookieAuth.clearAuthCookies();
    }

    return {
        isAuthenticated: authState.isAuthenticated,
        user: authState.user,
        checkAuthStatus,
        initiateAuth,
        isLoading,
        error,
        verifyOtp,
        logout,
        loading,
        signUp,
        registerProvider
    }
}