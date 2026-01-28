// Simple encryption/decryption using Base64 with a salt
// For production, consider using Web Crypto API for stronger encryption

const SALT = "LM_R0B0T_2024";

export const encrypt = (value: string): string => {
  try {
    const salted = SALT + value + SALT;
    return btoa(encodeURIComponent(salted));
  } catch {
    return value;
  }
};

export const decrypt = (encryptedValue: string): string => {
  try {
    const decoded = decodeURIComponent(atob(encryptedValue));
    // Remove salt from both ends
    if (decoded.startsWith(SALT) && decoded.endsWith(SALT)) {
      return decoded.slice(SALT.length, -SALT.length);
    }
    // If salt not found, return as-is (legacy unencrypted value)
    return encryptedValue;
  } catch {
    // If decryption fails, return original value (legacy unencrypted)
    return encryptedValue;
  }
};
