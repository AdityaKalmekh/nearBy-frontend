import Cookies from 'js-cookie';
import { decryptUserData } from './dataDecrypt';
import { InitiateUserData } from '@/app/hooks/useAuth';

// Types and Interfaces
export interface UserData {
    userId: string;
    authType: string;
    role: number;
    providerId: string | '';
    contactOrEmail: string;
    firstName: string | '';
    lastName?: string;
    verifiedEmail?: boolean;
    verifiedPhone?: boolean;
    status: string;
    isNewUser: boolean;
    fullName?: string;
}

export interface UpdateUserData {
    firstName?: string;
    lastName?: string;
    providerId?: string;
    role?: number;
}

// Constants for cookie names
const AUTH_COOKIE = 'Auth';
const USER_DATA = 'user_data';
const T_DATA_KEY = 't_data_key_c';
const INITIATE_D = 'initiate_d_c';
const AUTH_TOKEN = 'auth_token_cli';
const REFRESH_TOKEN = 'refresh_token_cli';
const SESSION_ID = 'sid_cli';

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

export const cookieAuth = {

    setInitialCookies(secretKey: string, encryptedData: string): void {
        Cookies.set(T_DATA_KEY, JSON.stringify(secretKey), INITIAL_COOKIES_OPTIONS);
        Cookies.set(INITIATE_D, JSON.stringify(encryptedData), INITIAL_COOKIES_OPTIONS);
    },

    setAuthCookies(authToken: string, refreshToken: string, session_id: string, userDt: UserData): void {
        this.clearInitiateUserData();
        console.log({ userDt });
        Cookies.set(AUTH_COOKIE, 'true', REFRESH_COOKIE_CONFIG);
        Cookies.set(AUTH_TOKEN, JSON.stringify(authToken), AUTH_COOKIE_OPTIONS);
        Cookies.set(REFRESH_TOKEN, JSON.stringify(refreshToken), REFRESH_COOKIE_CONFIG);
        Cookies.set(SESSION_ID, JSON.stringify(session_id), {
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        });
        Cookies.set(USER_DATA, JSON.stringify(userDt));
    },

    clearAuthCookies(): void {
        Cookies.remove(AUTH_COOKIE);
        Cookies.remove(USER_DATA);
        Cookies.remove(SESSION_ID);
    },

    clearInitiateUserData(): void {
        Cookies.remove(T_DATA_KEY);
        Cookies.remove(INITIATE_D);
    },

    isAuthenticated(): boolean {
        return Cookies.get(AUTH_COOKIE) === 'true';
    },

    getUserData(): UserData | null {
        const userData = Cookies.get(USER_DATA);
        return userData ? JSON.parse(userData) : null;
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
        if (updateUserData.providerId) {
            const existingData = Cookies.get(USER_DATA);
            if (existingData) {
                Cookies.set(USER_DATA, JSON.stringify({
                    ...JSON.parse(existingData),
                    providerId: updateUserData.providerId,
                    status: "active"
                }));
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

    getSessionId(): string | undefined {
        return Cookies.get(SESSION_ID);
    }
}