/**
 * Google Auth & Drive Token Manager
 */

let cachedAccessToken: string | null = null;
let googleUser: { name: string; email: string; photoUrl?: string } | null = null;

export const setAccessToken = (token: string | null, user?: { name: string; email: string; photoUrl?: string }) => {
  cachedAccessToken = token;
  if (user) {
    googleUser = user;
  }
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const getGoogleUser = () => {
  return googleUser;
};

export const logoutGoogle = () => {
  cachedAccessToken = null;
  googleUser = null;
};
