// Cookie utility functions

export const setCookie = (name: string, value: string, days: number = 7): void => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};

export const getCookie = (name: string): string | null => {
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }
  return null;
};

export const removeCookie = (name: string): void => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict`;
};

// Convenience functions for common operations
export const setUserSession = (userId: string, userName: string): void => {
  const loginTimestamp = Date.now().toString();
  setCookie("user_id", userId, 7);
  setCookie("user_name", userName, 7);
  setCookie("login_timestamp", loginTimestamp, 7);
};

export const clearUserSession = (): void => {
  removeCookie("user_id");
  removeCookie("user_name");
  removeCookie("login_timestamp");
};

export const getUserSession = (): { userId: string | null; userName: string | null; loginTimestamp: string | null } => {
  return {
    userId: getCookie("user_id"),
    userName: getCookie("user_name"),
    loginTimestamp: getCookie("login_timestamp"),
  };
};
