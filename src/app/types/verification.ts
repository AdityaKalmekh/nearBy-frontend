export interface VerificationState {
    code: string[];
    timer: number;
    resendCount: number;
    phoneNoOrEmail: string;
}