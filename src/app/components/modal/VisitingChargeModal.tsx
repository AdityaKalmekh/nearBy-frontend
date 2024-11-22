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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Set Visiting Charge for {selectedService}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="visitingCharge" className="text-right">
                            Amount
                        </Label>
                        <div className="col-span-3">
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
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default VisitingChargeModal;