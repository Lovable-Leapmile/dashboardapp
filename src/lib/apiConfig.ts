import { secureStorage } from "./secureStorage";

const API_CONFIG_KEY = "api_config";

export interface ApiConfig {
  apiName: string;
  baseUrl: string;
}

// Get the base URL from environment variable or fallback to stored config
export const getApiBaseUrl = (): string => {
  // First priority: VITE_BASE_URL environment variable
  const envBaseUrl = import.meta.env.VITE_BASE_URL as string;
  if (envBaseUrl) {
    // Extract just up to .com (remove any path after the domain)
    try {
      const url = new URL(envBaseUrl);
      return `${url.protocol}//${url.host}`;
    } catch {
      // If parsing fails, return as-is
      return envBaseUrl;
    }
  }
  
  // Fallback: stored configuration
  const config = getStoredApiConfig();
  if (!config) {
    throw new Error("API_NOT_CONFIGURED");
  }
  return config.baseUrl;
};

// Extract API name from base URL (for backward compatibility)
export const getApiName = (): string => {
  const envBaseUrl = import.meta.env.VITE_BASE_URL as string;
  if (envBaseUrl) {
    try {
      const url = new URL(envBaseUrl);
      // Extract subdomain (e.g., "sudarshan" from "sudarshan.leapmile.com")
      const hostParts = url.host.split('.');
      if (hostParts.length >= 1) {
        return hostParts[0];
      }
    } catch {
      // Parsing failed
    }
  }
  
  const config = getStoredApiConfig();
  return config?.apiName || '';
};

export const getStoredApiConfig = (): ApiConfig | null => {
  try {
    const parsed = secureStorage.getJSON<ApiConfig>(API_CONFIG_KEY);
    if (parsed?.apiName && parsed?.baseUrl) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

export const storeApiConfig = (apiName: string): ApiConfig => {
  const trimmed = apiName.trim();
  const baseUrl = `https://${trimmed}.leapmile.com`;
  const config: ApiConfig = { apiName: trimmed, baseUrl };
  secureStorage.setJSON(API_CONFIG_KEY, config);
  return config;
};

export const clearApiConfig = (): void => {
  secureStorage.removeItem(API_CONFIG_KEY);
};

export const isApiConfigured = (): boolean => {
  // If VITE_BASE_URL is set, consider it configured
  const envBaseUrl = import.meta.env.VITE_BASE_URL as string;
  if (envBaseUrl) {
    return true;
  }
  
  // Otherwise check stored config
  return getStoredApiConfig() !== null;
};
