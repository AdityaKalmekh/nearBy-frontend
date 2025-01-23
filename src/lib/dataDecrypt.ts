import CryptoJS from "crypto-js";
interface EncryptedData {
    data: string;
    iv: string;
} 

interface UserData {
    userId: string,
    firstName?: string,
    authType: string,
    role: number,
    isNewUser: boolean,
    contactOrEmail: string
}

export const decryptUserData = (encryptedData: EncryptedData, secretKey: string): UserData => {
    try {
        // Decrypt the data
        const decrypted = CryptoJS.AES.decrypt(
            encryptedData.data,
            secretKey,
            {
                iv: CryptoJS.enc.Hex.parse(encryptedData.iv),
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }
        );

        // Convert to string and parse JSON
        const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
        if (!decryptedString) {
            throw new Error('Decryption failed');
        }

        return JSON.parse(decryptedString);
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt user data');
    }
};
