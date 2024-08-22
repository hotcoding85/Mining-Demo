// utils/cryptoUtils.ts

import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY ?? "your-secret-key";
const IV_LENGTH = 16; // For AES encryption, IV length is typically 16 bytes

// Function to encrypt data
export const encryptData = <T>(data: T): string => {
  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    ENCRYPTION_KEY,
    { iv: CryptoJS.lib.WordArray.random(IV_LENGTH) }
  ).toString();
  return encrypted;
};

// Function to decrypt data
export const decryptData = <T>(encryptedData: string): T => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  return decrypted;
};
