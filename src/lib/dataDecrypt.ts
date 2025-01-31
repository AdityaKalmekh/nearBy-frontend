import { InitiateUserData } from "@/app/hooks/useAuth";
import CryptoJS from "crypto-js";
interface EncryptedData {
    data: string;
    iv: string;
}

interface EncryptedUserId {
    ciphertext: string;
    iv: string;
    salt: string;
}

export const decryptUserData = (encryptedData: EncryptedData, secretKey: string): InitiateUserData => {
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

export const decryptUserId = (encryptedData: EncryptedUserId, encryptionKey: string): string => {
    try {
        // Recreate key using PBKDF2
        const key = CryptoJS.PBKDF2(encryptionKey, CryptoJS.enc.Hex.parse(encryptedData.salt), {
            keySize: 256 / 32,
            iterations: 1000
        });

        // Create cipher params
        const cipherParams = CryptoJS.lib.CipherParams.create({
            ciphertext: CryptoJS.enc.Hex.parse(encryptedData.ciphertext)
        });

        // Decrypt
        const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
            iv: CryptoJS.enc.Hex.parse(encryptedData.iv),
            padding: CryptoJS.pad.Pkcs7,
            mode: CryptoJS.mode.CBC
        });

        return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error('Failed to decrypt user ID or Provider ID', error);
        throw new Error('Failed to decrypt user ID or Provider ID');
    }
}