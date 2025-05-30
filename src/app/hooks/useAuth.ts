import { cookieAuth, UserData } from "@/lib/cookieAuth";
import { useEffect, useState } from "react";
import useHttp from "./use-http";
import { FormData } from "../components/forms/signup";
import { LocationData } from "./useLocation";
import { SelectedServiceItem } from "../provider/services/page";
import { decryptUserId } from "@/lib/dataDecrypt";
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface InitiateUserData {
    userId: string;
    firstName: string;
    authType: string;
    role: number;
    isNewUser: boolean;
    contactOrEmail: string;
    status: string;
}
interface InitiateRequest {
    success: boolean;
    code: number;
    message: string;
    user: InitiateUserData;
    secretKey: string;
    encryptedData: string;
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
    verifyOtp: (verificationOTP: OtpData) => Promise<UserVerificationReturn>;
    loading: boolean;
    signUp: (formData: FormData) => Promise<signUpResult>;
    registerProvider: (selectedServices: SelectedServiceItem[], locationDetails: LocationData) => Promise<boolean>;
    reSendOTP: () => Promise<boolean>;
    clearError: () => void;
    userId: string;
    providerId: string;
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
    userId: string;
    providerId: string;
}

interface UserVerificationReturn {
    success: boolean;
    status?: string;
    role?: number;
}

interface UserVerificationResponse {
    success: boolean;
    code: number;
    message: string;
    authToken: string;
    refreshToken: string;
    session_id: string;
    user: UserData;
    encryptedUId: string;
    encryptionKey: string;
    encryptedPId?: string;
    encryptionPKey?: string;
}

interface SignUpResponse {
    success: boolean;
    message: string;
    firstName: string;
    lastName: string;
    role: number
}

interface ResendOTPResponse {
    success: boolean;
    otp: string;
}

interface LogoutResponse {
    success: boolean;
}

type ProviderResponse = {
    success: boolean,
    message: string,
    encryptedPId: string,
    encryptionPKey: string
}

export const useAuth = (): AuthContextType => {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        userId: '',
        providerId: ''
    });
    const { error, sendRequest, isLoading, clearError } = useHttp();
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = (): void => {
        const isAuthenticated = cookieAuth.isAuthenticated();
        if (isAuthenticated) {
            const userData = cookieAuth.getUserData();
            if (userData) {
                const { user, userId, providerId } = userData;
                setAuthState(prev => ({
                    ...prev,
                    isAuthenticated,
                    user,
                    userId,
                    providerId
                }));
                setLoading(false);
            }
        } else {
            const user = cookieAuth.getInitiateUserData();
            setAuthState(prev => ({
                ...prev,
                isAuthenticated,
                user
            }));
            setLoading(false);
        }
    }

    const initiateAuth = async (
        requestData: AuthRequest
    ): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            sendRequest({
                url: 'auth/initiate',
                method: 'POST',
                data: requestData
            },
                // Success callback
                (response) => {
                    const initiateRequest = response as InitiateRequest;
                    if (initiateRequest.success) {
                        cookieAuth.setInitialCookies(initiateRequest.secretKey, initiateRequest.encryptedData);
                        setAuthState(prev => ({
                            ...prev,
                            user: {
                                userId: initiateRequest.user.userId,
                                authType: initiateRequest.user.authType,
                                role: initiateRequest.user.role,
                                contactOrEmail: requestData.email || requestData.phoneNo || '',
                                firstName: initiateRequest.user.firstName,
                                isNewUser: initiateRequest.user.isNewUser,
                                status: initiateRequest.user.status,
                            }
                        }));
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                },
                (error) => {
                    reject(error);
                }
            );
        });
    };

    const verifyOtp = async (verificationOTP: OtpData): Promise<UserVerificationReturn> => {
        return new Promise((resolve) => {
            sendRequest({
                url: "auth/verify",
                method: "POST",
                data: verificationOTP
            }, (response) => {
                const userVerification = response as UserVerificationResponse;
                if (userVerification.success) {
                    cookieAuth.setAuthCookies(userVerification.authToken,
                        userVerification.refreshToken,
                        userVerification.session_id,
                        userVerification.user,
                        userVerification.encryptedUId,
                        userVerification.encryptionKey,
                        userVerification.encryptedPId,
                        userVerification.encryptionPKey
                    );

                    let providerId = '';
                    if (userVerification.user.role === 0
                        && userVerification.encryptedPId
                        && userVerification.encryptionPKey) {
                        providerId = decryptUserId(
                            JSON.parse(userVerification.encryptedPId),
                            userVerification.encryptionPKey
                        );
                    }
                    setAuthState((prev) => {
                        if (!prev.user) {
                            return prev;
                        }
                        return {
                            ...prev,
                            user: {
                                ...prev.user,
                                ...userVerification.user
                            },
                            userId: prev.user.userId || '',
                            providerId,
                            isAuthenticated: true
                        }
                    });

                    resolve({
                        success: true,
                        status: userVerification.user.status,
                        role: userVerification.user.role
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
                    cookieAuth.updateUserData({
                        firstName: signUpResponse.firstName,
                        lastName: signUpResponse.lastName,
                        role: signUpResponse.role
                    });
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
                    cookieAuth.updateUserData({
                        encryptedPId: providerResponse.encryptedPId,
                        encryptionPKey: providerResponse.encryptionPKey
                    });
                    const providerId = decryptUserId(
                        JSON.parse(providerResponse.encryptedPId),
                        providerResponse.encryptionPKey);

                    setAuthState((prev) => {
                        if (!prev.user) {
                            return prev;
                        }

                        return {
                            ...prev,
                            user: {
                                ...prev.user,
                                status: "active"
                            },
                            providerId
                        };
                    });
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }

    const reSendOTP = async (): Promise<boolean> => {
        return new Promise((resolve) => {
            sendRequest({
                url: 'resendOTP',
                method: 'PATCH',
                data: authState.user
            }, (response) => {
                const resendResponse = response as ResendOTPResponse;
                console.log({ resendResponse });
                if (resendResponse.success) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        })
    }

    const logout = async (): Promise<boolean> => {
        return new Promise((resolve) => {
            sendRequest({
                url: 'logout',
                method: 'DELETE',
                data: { userId: authState.userId }
            }, (response) => {
                const logoutResponse = response as LogoutResponse;
                if (logoutResponse.success) {
                    cookieAuth.clearAuthCookies();
                    resolve(true);
                } else {
                    resolve(false);
                }
            })
        });
    }

    return {
        isAuthenticated: authState.isAuthenticated,
        user: authState.user,
        userId: authState.userId,
        providerId: authState.providerId,
        checkAuthStatus,
        initiateAuth,
        isLoading,
        error,
        verifyOtp,
        logout,
        loading,
        signUp,
        registerProvider,
        reSendOTP,
        clearError
    }
}