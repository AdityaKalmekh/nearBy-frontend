import Cookies from 'js-cookie';

// Types and Interfaces
export interface UserData {
    userId: string;
    authType: string;
    role: number;
    providerId?: string;
    contactOrEmail: string;
    firstName?: string; 
    lastName?: string;
    verifiedEmail?: boolean;
    verifiedPhone?: boolean;
    status: string;
    isNewUser?: boolean;
}

// Constants for cookie names
const AUTH_COOKIE = 'Auth';
const USER_DATA = 'User_Data';
const SESSION_ID = 'NEARBY_SID';
const TEMP_AUTH_DATA = 't_auth_d';

// Cookie configuration
const COOKIE_OPTIONS: Cookies.CookieAttributes = {
    expires : new Date(Date.now() + 1 * 60 * 1000),
    secure: process.env.NODE_ENV === 'production', // Use secure in production
    sameSite: 'Strict',
    path: '/'
};

export const cookieAuth = {
    setAuthCookies(authToken:string): void {
        Cookies.set(AUTH_COOKIE, 'true', COOKIE_OPTIONS);
        console.log(authToken);
        // Cookies.set("auth_token",authToken,COOKIE_OPTIONS);
    },

    clearAuthCookies(): void {
        Cookies.remove(AUTH_COOKIE);
        Cookies.remove(USER_DATA);
        Cookies.remove(SESSION_ID);
    },

    isAuthenticated(): boolean {
        return Cookies.get(AUTH_COOKIE) === 'true';
    },

    getUserData(): UserData | null {
        const userData = Cookies.get(USER_DATA);
        return userData ? JSON.parse(userData) : null;
    },

    getTempUserData(): UserData | null {
        const tempUserData = Cookies.get(TEMP_AUTH_DATA);
        return tempUserData ? JSON.parse(tempUserData) : null;
    },

    getSessionId(): string | undefined {
        return Cookies.get(SESSION_ID);
    }
}