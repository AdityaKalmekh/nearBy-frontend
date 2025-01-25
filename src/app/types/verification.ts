export interface VerificationState {
    code: string[];
    timer: number;
    resendCount: number;
    isResendDisable: boolean;
    phoneNoOrEmail: string;
}