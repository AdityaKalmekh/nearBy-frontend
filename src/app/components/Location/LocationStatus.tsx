import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface LocationStatusProps {
    status: 'idle' | 'loading' | 'success' | 'error' | 'denied';
    error?: string;
    onRetry?: () => void;
    source?: string;
}

export const LocationStatus: React.FC<LocationStatusProps> = ({
    status,
    error,
    onRetry,
    source
}) => {
    if (status === 'denied') {
        return (
            <Alert variant="destructive">
                <AlertTitle>Location Access Denied</AlertTitle>
                <AlertDescription className="space-y-4">
                    <p>You&apos;ve denied access to your location. To continue:</p>
                    <ol className="list-decimal ml-4 space-y-2">
                        <li>Click the location icon in your browser&apos;s address bar</li>
                        <li>Choose &quot;Allow&quot; for location access</li>
                        <li>Click &quot;Try Again&quot; below</li>
                    </ol>
                    {onRetry && (
                        <Button 
                            variant="outline" 
                            onClick={onRetry}
                            className="mt-2"
                        >
                            Try Again
                        </Button>
                    )}
                </AlertDescription>
            </Alert>
        );
    }

    if (error && status === 'error') {
        return (
            <Alert variant="destructive" className="flex justify-between items-center">
                <AlertDescription>{error}</AlertDescription>
                {onRetry && (
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={onRetry}
                        className="ml-4"
                    >
                        Try Again
                    </Button>
                )}
            </Alert>
        );
    }

    if (status === 'success') {
        return (
            <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                    Location obtained successfully!
                    {source === 'ip' && ' (Using approximate location)'}
                </AlertDescription>
            </Alert>
        );
    }

    return null;
};