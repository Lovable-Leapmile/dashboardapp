import { encrypt, decrypt } from "./encryption";

/**
 * Secure localStorage wrapper that encrypts values on write and decrypts on read
 */
export const secureStorage = {
  setItem: (key: string, value: string): void => {
    const encrypted = encrypt(value);
    localStorage.setItem(key, encrypted);
  },

  getItem: (key: string): string | null => {
    const encrypted = localStorage.getItem(key);
    if (encrypted === null) return null;
    return decrypt(encrypted);
  },

  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  },

  clear: (): void => {
    localStorage.clear();
  },

  // For JSON objects
  setJSON: <T>(key: string, value: T): void => {
    const jsonString = JSON.stringify(value);
    secureStorage.setItem(key, jsonString);
  },

  getJSON: <T>(key: string): T | null => {
    const value = secureStorage.getItem(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },
};
