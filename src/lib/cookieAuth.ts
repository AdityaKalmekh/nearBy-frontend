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
const T_DATA_KEY = 't_data_key_c';
const INITIATE_D = 'initiate_d_c';

// Cookie configuration
// const COOKIE_OPTIONS: Cookies.CookieAttributes = {
//     expires: new Date(Date.now() + 60 * 60 * 1000),
//     secure: process.env.NODE_ENV === 'production', // Use secure in production
//     sameSite: 'Strict',
//     path: '/'
// };

const INITIAL_COOKIES_OPTIONS : Cookies.CookieAttributes = {
    expires: new Date(Date.now() + 10 * 60 * 1000),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    path: '/'
}

export const cookieAuth = {

    setInitialCookies(): void {
        const secretKey = Cookies.get('t_data_key');
        const encrpData = Cookies.get('initiate_d');

        console.log("received server side cookies ",secretKey);
        
        if (secretKey && encrpData) {
            Cookies.set(T_DATA_KEY, secretKey, INITIAL_COOKIES_OPTIONS);
            Cookies.set(INITIATE_D, encrpData, INITIAL_COOKIES_OPTIONS);
        } else {
            throw new Error('Secret key or data is not define');
        }
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

    getInitiateUserData(): UserData | null {
        // const parseSecretKey = JSON.parse(Cookies.get())
        const tempUserData = Cookies.get(TEMP_AUTH_DATA);
        return tempUserData ? JSON.parse(tempUserData) : null;
    },

    getSessionId(): string | undefined {
        return Cookies.get(SESSION_ID);
    }
}