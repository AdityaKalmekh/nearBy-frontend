import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface OtpState {
    otpData: {
        contactOrEmail: string,
        authType: string,
        role: number,
        userId: string
    } | null;
    setOtpData: (data: OtpState['otpData']) => void;
    clearOtpData: () => void;
}

export const useOtpStore = create<OtpState>()(
    devtools(
        (set) => ({
            otpData: null,
            setOtpData: (data) => set({ otpData: data }, false, 'setOtpData'),
            clearOtpData: () => set({ otpData: null }, false, 'clearOtpData')
        }),
        { name: 'OTP Store' }
    )
)