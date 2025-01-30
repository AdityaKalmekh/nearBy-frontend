import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle
} from "@/components/ui/dialog"
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface OTPVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    onVerify: (otp: string) => void;
}

const OTPVerificationModal: React.FC<OTPVerificationModalProps> = ({
    isOpen,
    onClose,
    title,
    onVerify,
}) => {
    const [otp, setOtp] = useState<string>('');
    const [error, setError] = useState<string>('');

    const handleVerify = () => {
        if (!otp) {
            setError('Please enter the OTP');
            return;
        }

        if (!/^\d{4}$/.test(otp)) {
            setError('Please enter a valid 4-digit OTP');
            return;
        }

        onVerify(otp);
        setOtp('');
        setError('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-11/12 max-w-lg mx-auto rounded-lg p-5 sm:max-w-[425px]">
                <DialogHeader className="space-y-3">
                    <DialogTitle className="text-xl font-semibold text-center sm:text-left">
                        {title}
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col space-y-4 py-2">
                    <div className="flex flex-col space-y-2">
                        <Label htmlFor="otp" className="text-sm font-medium">
                            Enter 4-digit OTP
                        </Label>
                        <div className="flex justify-center gap-2">
                            <Input
                                id="otp"
                                type="text"
                                inputMode="numeric"
                                pattern="\d*"
                                maxLength={4}
                                value={otp}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    setOtp(value);
                                    setError('');
                                }}
                                placeholder="Enter 4-digit OTP"
                                className="text-center text-xl tracking-wider"
                            />
                        </div>
                        {error && (
                            <span className="text-sm text-red-500 mt-1 text-center">{error}</span>
                        )}
                    </div>
                </div>
                <DialogFooter className="flex flex-col space-y-2 sm:flex-row sm:justify-end sm:space-y-0 sm:space-x-2">
                    <Button 
                        variant="outline" 
                        onClick={onClose}
                        className="w-full sm:w-auto"
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleVerify}
                        className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600"
                    >   
                        Verify OTP
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default OTPVerificationModal;