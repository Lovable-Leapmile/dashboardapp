import { getCookie, setCookie } from "./cookieStorage";

export const AUTH_TOKEN_STORAGE_KEY = "auth_token";

const candidateKeys = [
  AUTH_TOKEN_STORAGE_KEY,
  "token",
  "access_token",
  "Authorization",
  "authorization",
] as const;

/**
 * Get stored auth token from cookies ONLY (no localStorage fallback)
 * Cookies are the single source of truth
 */
export const getStoredAuthToken = (): string | null => {
  for (const key of candidateKeys) {
    const cookieValue = getCookie(key);
    if (cookieValue && cookieValue.trim()) {
      return cookieValue.trim();
    }
  }
  return null;
};

/**
 * Store auth token in cookies ONLY
 */
export const storeAuthToken = (rawToken: unknown) => {
  if (typeof rawToken !== "string") return;
  const t = rawToken.trim();
  if (!t) return;

  const normalized = t.toLowerCase().startsWith("bearer ") ? t : `Bearer ${t}`;
  
  // Store in cookie only
  setCookie(AUTH_TOKEN_STORAGE_KEY, normalized);
};
