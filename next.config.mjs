import { env } from 'process';

const nextConfig = {
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Credentials', value: 'true' },
                    // Use env.CORS_ORIGIN or fallback to your production URL
                    { key: 'Access-Control-Allow-Origin', value: env.CORS_ORIGIN || 'https://nearby-backend-ougv.onrender.com/nearBy' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS,PATCH' },
                    { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, Cookie' },
                ],
            },
        ];
    },
    // Add these if you need additional configurations
    reactStrictMode: true,
    poweredByHeader: false,
    // Add any other configurations you need
};

export default nextConfig;