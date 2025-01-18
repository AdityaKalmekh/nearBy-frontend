import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

// Define public paths that don't need authentication
const publicPaths = [
    '/OtpVerification',
    '/',
    '/api/auth',
    '/favicon.ico'
];

export function middleware(request: NextRequest) {
    const authToken = request.cookies.get('AuthToken');
    const userData = request.cookies.get('User_Data');
    const { pathname } = request.nextUrl;

    // More precise public path checking
    const isPublicPath = publicPaths.some(path =>
        // Exact match for root path
        path === '/' ? pathname === '/' :
            // For other paths, check if it starts with the path and is followed by / or end of string
            pathname.startsWith(path + '/') || pathname === path
    );

    // Check if trying to access dashboard or other protected routes
    const isProtectedRoute = pathname.includes('/dashboard') ||
        pathname.includes('/services') ||
        (pathname.startsWith('/provider/') && pathname !== '/provider') ||
        (pathname.startsWith('/requester/') && pathname !== '/requester');


    // If no auth and trying to access protected route
    if (!authToken || !userData) {
        console.log("User_Data cookie ",userData);
        console.log("AuthToken cookie", authToken);
        if (!isProtectedRoute || isPublicPath) {
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL('/', request.url));
    }

    try {
        const [, payload] = authToken.value.split('.') as [string, string, string];
        const decodedPayload = JSON.parse(atob(payload));
        const userRole = decodedPayload.role;
        
        const user = JSON.parse(userData.value);
        console.log("User_Data2 cookie ", user);
        console.log("AuthToken cookie ", authToken);
        console.log("Decode user role ",userRole);
        
        if (!user) {
            const response = NextResponse.redirect(new URL('/', request.url));
            response.cookies.delete('AuthToken');
            response.cookies.delete('User_Data');
            return response;
        }
        
        else if (user.role !== userRole) {
            return NextResponse.redirect(new URL('/unauthorized', request.url));
        }

        else if (user.status === 'pending') {
            // If trying to access signup page, allow it
            if (pathname.startsWith('/signup')) {
                return NextResponse.next();
            }
            // For any other route, redirect to signup
            return NextResponse.redirect(new URL('/signup', request.url));
        }

        else if (userRole === 0 && user.status === 'service_details_pending') {

            if (pathname.startsWith('/provider/services')) {
                return NextResponse.next();
            }
            // return NextResponse.redirect(new URL('/provider/services', request.url));
            return NextResponse.redirect(new URL('/provider/services', request.url));
        }

        else if (userRole === 0 && user.status === 'active') { // Provider

            if (pathname.startsWith('/requester')) {
                return NextResponse.redirect(new URL('/unauthorized', request.url));
            }

            if (!pathname.startsWith('/provider')) {
                return NextResponse.redirect(new URL('/provider/dashboard', request.url));
            }
        }

        else if (userRole === 1) { // Requester
            if (pathname.startsWith('/provider')) {
                return NextResponse.redirect(new URL('/unauthorized', request.url));
            }
            if (!pathname.startsWith('/requester')) {
                return NextResponse.redirect(new URL('/requester/dashboard', request.url));
            }
        }
    } catch (error) {
        console.error(error);
        const response = NextResponse.redirect(new URL('/', request.url));
        response.cookies.delete('AuthToken');
        response.cookies.delete('User_Data');
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|public|unauthorized).*)',
    ],
};