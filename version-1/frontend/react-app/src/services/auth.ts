// src/services/auth.ts

export const authHeader = (): HeadersInit =>  {
  const token = localStorage.getItem('access_token');
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
};

export function getUserRole(): string | null {
  return localStorage.getItem('role');
}

export function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('role');
  window.location.href = '/login';
}
