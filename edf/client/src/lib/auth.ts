const ACCESS_KEY = "accessToken";

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_KEY, token);
}

export function clearAuth(): void {
  localStorage.removeItem(ACCESS_KEY);
}

export function isAuthenticated(): boolean {
  const token = getAccessToken();
  return token !== null && token !== "";
}

export function apiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
  return raw.replace(/\/$/, "");
}
