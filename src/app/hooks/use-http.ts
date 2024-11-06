import { useCallback, useState } from "react";

interface BaseRequestConfig {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    credentials?: RequestCredentials;
}

interface GetRequestConfig extends BaseRequestConfig {
    method: 'GET'
}

interface JsonRequestConfig<T> extends BaseRequestConfig {
    method: 'POST' | 'PUT' | 'DELETE';
    data: T;
}

type RequestConfig<T> = GetRequestConfig | JsonRequestConfig<T>;

interface HttpResponse<T> {
    error: Error | null;
    isLoading: boolean;
    sendRequest: <D>(config: RequestConfig<D>, applyData: (data: T) => void) => Promise<void>;
}

const useHttp = <T>(): HttpResponse<T> => {
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const sendRequest = useCallback(async <D>(
        requestConfig: RequestConfig<D>,
        applyData: (data: T) => void
    ) => {
        setIsLoading(true);
        setError(null);

        try {
            const requestOptions: RequestInit = {
                method: requestConfig.method,
                credentials: requestConfig.credentials || 'include',
                headers: {
                    ...(!(requestConfig.method === 'GET') &&
                        !('data' in requestConfig && requestConfig.data instanceof FormData) && {
                        'Content-Type': 'application/json',
                    }),
                    ...requestConfig.headers,
                },
            };

            // Add body for non-GET requests
            if ('data' in requestConfig) {
                requestOptions.body = requestConfig.data instanceof FormData
                    ? requestConfig.data
                    : JSON.stringify(requestConfig.data);
            }

            // console.log(JSON.stringify(requestConfig.data));
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}${requestConfig.url}`, requestOptions);

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            const responseData = await response.json();
            applyData(responseData);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Something went wrong'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        error,
        isLoading,
        sendRequest,
    };
};

export default useHttp;