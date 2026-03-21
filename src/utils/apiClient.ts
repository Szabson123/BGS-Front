const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export const apiClient = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const csrfToken = getCookie('csrftoken');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(csrfToken && !['GET', 'HEAD', 'OPTIONS'].includes(options.method || 'GET') && {
      'X-CSRFToken': csrfToken
    }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Błąd serwera Django');
  }

  if (response.status === 204) return {} as T;
  return response.json();
};