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

interface VisitingChargeModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedService: string;
    onSave: (charge: number) => void;
}

const VisitingChargeModal: React.FC<VisitingChargeModalProps> = ({
    isOpen,
    onClose,
    selectedService,
    onSave,
}) => {
    const [visitingCharge, setVisitingCharge] = useState<string>('');
    const [error, setError] = useState<string>('');

    const handleSave = () => {
        if (!visitingCharge) {
            setError('Please enter a visiting charge');
            return;
        }

        const charge = parseFloat(visitingCharge);
        if (isNaN(charge) || charge <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        onSave(charge);
        setVisitingCharge('');
        setError('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-11/12 max-w-lg mx-auto rounded-lg p-6 sm:max-w-[425px]">
                <DialogHeader className="space-y-3">
                    <DialogTitle className="text-xl font-semibold text-center sm:text-left">
                        Set Visiting Charge for {selectedService}
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col space-y-4 py-4">
                    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                        <Label htmlFor="visitingCharge" className="text-sm font-medium sm:w-1/4 sm:text-right">
                            Amount
                        </Label>
                        <div className="flex-1">
                            <Input
                                id="visitingCharge"
                                type="number"
                                value={visitingCharge}
                                onChange={(e) => {
                                    setVisitingCharge(e.target.value);
                                    setError('');
                                }}
                                placeholder="Enter visiting charge"
                                className="w-full"
                            />
                            {error && (
                                <span className="text-sm text-red-500 mt-1">{error}</span>
                            )}
                        </div>
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
                        onClick={handleSave}
                        className="w-full sm:w-auto"    
                    >   
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default VisitingChargeModal;