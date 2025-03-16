import Cookies from 'js-cookie';
import { decryptUserData, decryptUserId } from './dataDecrypt';
import { InitiateUserData } from '@/app/hooks/useAuth';

// Types and Interfaces
export interface UserData {
    userId?: string;
    authType?: string;
    role?: number;
    providerId?: string;
    contactOrEmail?: string;
    firstName?: string;
    lastName?: string;
    verifiedEmail?: boolean;
    verifiedPhone?: boolean;
    status?: string;
    isNewUser?: boolean;
    fullName?: string;
}

export interface UpdateUserData {
    firstName?: string;
    lastName?: string;
    role?: number;
    encryptedPId?: string,
    encryptionPKey?: string
}

export interface DecryptedUserData {
    user: UserData;
    userId: string;
    providerId: string;
}

// Constants for cookie names
const AUTH_COOKIE = 'Auth';
const USER_DATA = 'user_data';
const T_DATA_KEY = 't_data_key_c';
const INITIATE_D = 'initiate_d_c';
const AUTH_TOKEN = 'auth_token_cli';
const REFRESH_TOKEN = 'refresh_token_cli';
const SESSION_ID = 'sid_cli';
const USER_ID = 'uid_cli';
const USER_ID_SECRET_KEY = 'diukey_cli';
const PROVIDER_ID = 'puid_cli';
const PROVIDER_ID_SECRET_KEY = 'puidkey_cli';
const CURRENT_STATUS = 'current_status';

// Cookie configuration
const AUTH_COOKIE_OPTIONS: Cookies.CookieAttributes = {
    expires: new Date(Date.now() + 60 * 60 * 1000),
    secure: process.env.NODE_ENV === 'production', // Use secure in production
    sameSite: 'Strict',
    path: '/'
};

const REFRESH_COOKIE_CONFIG: Cookies.CookieAttributes = {
    ...AUTH_COOKIE_OPTIONS,
    expires: new Date(Date.now() + 30 * 24 * 60 * 60)
}

const INITIAL_COOKIES_OPTIONS: Cookies.CookieAttributes = {
    expires: new Date(Date.now() + 10 * 60 * 1000),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    path: '/'
}

const USERID_COOKIES_OPTIONS: Cookies.CookieAttributes = {
    ...AUTH_COOKIE_OPTIONS,
    expires: new Date(Date.now() + 30 * 24 * 60 * 60)
}

export const cookieAuth = {

    setInitialCookies(secretKey: string, encryptedData: string): void {
        Cookies.set(T_DATA_KEY, JSON.stringify(secretKey), INITIAL_COOKIES_OPTIONS);
        Cookies.set(INITIATE_D, JSON.stringify(encryptedData), INITIAL_COOKIES_OPTIONS);
    },

    setAuthCookies(
        authToken: string,
        refreshToken: string,
        session_id: string,
        userDt: UserData,
        uid: string,
        uidKey: string,
        puid?: string,
        puidkey?: string
    ): void {
        this.clearInitiateUserData();
        Cookies.set(AUTH_COOKIE, 'true', REFRESH_COOKIE_CONFIG);
        Cookies.set(AUTH_TOKEN, JSON.stringify(authToken), AUTH_COOKIE_OPTIONS);
        Cookies.set(REFRESH_TOKEN, JSON.stringify(refreshToken), REFRESH_COOKIE_CONFIG);
        Cookies.set(SESSION_ID, JSON.stringify(session_id), {
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        });
        Cookies.set(USER_DATA, JSON.stringify(userDt));
        Cookies.set(USER_ID, uid, USERID_COOKIES_OPTIONS);
        Cookies.set(USER_ID_SECRET_KEY, uidKey, USERID_COOKIES_OPTIONS);
        if (puid && puidkey) {
            Cookies.set(PROVIDER_ID, puid, USERID_COOKIES_OPTIONS);
            Cookies.set(PROVIDER_ID_SECRET_KEY, puidkey, USERID_COOKIES_OPTIONS);
            Cookies.set(CURRENT_STATUS, JSON.stringify("0"), USERID_COOKIES_OPTIONS);
        }
    },

    clearAuthCookies(): void {
        Cookies.remove(AUTH_COOKIE);
        Cookies.remove(USER_DATA);
        Cookies.remove(SESSION_ID);
        Cookies.remove(USER_ID);
        Cookies.remove(AUTH_TOKEN);
        Cookies.remove(USER_ID_SECRET_KEY);
        Cookies.remove(REFRESH_TOKEN);
        Cookies.remove(PROVIDER_ID);
        Cookies.remove(PROVIDER_ID_SECRET_KEY);
        Cookies.remove(CURRENT_STATUS);
        // Cookies.remove()
    },

    clearInitiateUserData(): void {
        Cookies.remove(T_DATA_KEY);
        Cookies.remove(INITIATE_D);
    },

    isAuthenticated(): boolean {
        return Cookies.get(AUTH_COOKIE) === 'true';
    },

    getUserData(): DecryptedUserData | null {
        try {
            const userData = Cookies.get(USER_DATA);
            const secretKey = Cookies.get(USER_ID_SECRET_KEY);
            const encryptedUserId = Cookies.get(USER_ID);

            if (!userData || !secretKey || !encryptedUserId) {
                return null;
            }

            const userId = decryptUserId(JSON.parse(encryptedUserId), secretKey);
            if (!userId) {
                return null;
            }

            const user: UserData = JSON.parse(userData);

            if (user.role === 0) {
                const providerSecretKey = Cookies.get(PROVIDER_ID_SECRET_KEY);
                const encryptedProviderId = Cookies.get(PROVIDER_ID);

                if (providerSecretKey && encryptedProviderId) {
                    const providerId = decryptUserId(JSON.parse(encryptedProviderId), providerSecretKey);

                    return {
                        user,
                        userId,
                        providerId
                    }
                }
            }
            return {
                user,
                userId,
                providerId: ''
            };
        } catch (error) {
            console.error('Error getting user data:', error);
            return null;
        }
    },

    getInitiateUserData(): InitiateUserData | null {
        const secretKey = Cookies.get(T_DATA_KEY);
        const initiateUserData = Cookies.get(INITIATE_D);

        if (secretKey && initiateUserData) {
            const decryptedData = decryptUserData(JSON.parse(initiateUserData), JSON.parse(secretKey));
            console.log(decryptedData);
            return decryptedData;
        }
        return null;
    },

    updateUserData(updateUserData: UpdateUserData): void {
        if (updateUserData.encryptedPId && updateUserData.encryptionPKey) {
            const existingData = Cookies.get(USER_DATA);
            if (existingData) {
                Cookies.set(USER_DATA, JSON.stringify({
                    ...JSON.parse(existingData),
                    status: "active"
                }));
                Cookies.set(PROVIDER_ID, updateUserData.encryptedPId, USERID_COOKIES_OPTIONS);
                Cookies.set(PROVIDER_ID_SECRET_KEY, updateUserData.encryptionPKey, USERID_COOKIES_OPTIONS);
            }
        } else {
            const existingData = Cookies.get(USER_DATA);
            if (existingData) {
                Cookies.set(USER_DATA, JSON.stringify({
                    ...JSON.parse(existingData),
                    firstName: updateUserData.firstName,
                    lastName: updateUserData.lastName,
                    status: updateUserData.role === 0 ? "service_details_pending" : "active"
                }));
            }
        }
    },

    providerStatusHandler() {
        const getCurrentStatus = Cookies.get(CURRENT_STATUS);

        if (!getCurrentStatus) {
            console.error("Current status not found");
            return;
        }

        const currentState: string = JSON.parse(getCurrentStatus);
        if (currentState === "0") {
            Cookies.set(CURRENT_STATUS, JSON.stringify('1'), USERID_COOKIES_OPTIONS);
        } else {
            Cookies.set(CURRENT_STATUS, JSON.stringify('0'), USERID_COOKIES_OPTIONS);
        }
    },

    getProviderWorkingStatus(): boolean {
        // Check if we're in the browser environment
        if (typeof window === 'undefined') {
            return false; // Default value during server-side rendering
        }

        const getCurrentStatus = Cookies.get(CURRENT_STATUS);
        if (!getCurrentStatus) {
            console.debug("Current status not found");
            return false;
        }

        const parseCurrentState: string = JSON.parse(getCurrentStatus);
        if (parseCurrentState === '0') {
            return false;
        } else {
            return true;
        }
    },

    getSessionId(): string | undefined {
        return Cookies.get(SESSION_ID);
    }
}