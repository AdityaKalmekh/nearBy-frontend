import CryptoJS from "crypto-js";

export function setEncryptedItem(key: string, value: string) {
    const encrypted = CryptoJS.AES.encrypt(value, `${process.env.NEXT_PUBLIC_REQUEST_SECRET_KEY}`).toString();
    sessionStorage.setItem(key, encrypted);
}

export function getDecryptedItem(key: string) {
    const encryptedData = sessionStorage.getItem(key);
    if (!encryptedData) return null;

    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, `${process.env.NEXT_PUBLIC_REQUEST_SECRET_KEY}`);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return JSON.parse(decrypted); 
    } catch (err) {
        console.error("Request data decryption failed: ",err);
        return null;
    }
}

export function removeItem(key: string) {
    sessionStorage.removeItem(key);
}