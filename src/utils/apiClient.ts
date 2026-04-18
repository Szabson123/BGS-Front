function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
}

export const apiClient = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const isPost = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method || 'GET');

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (isPost) {
    const csrfToken = getCookie('csrftoken');
    if (csrfToken) {
      defaultHeaders['X-CSRFToken'] = csrfToken;
    }
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', 
  };

  const response = await fetch(`/api${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Błąd połączenia z API');
  }

  if (response.status === 204) return {} as T;

  return response.json();
};