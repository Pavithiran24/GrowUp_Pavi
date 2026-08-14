const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

let accessTokenMemory: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessTokenMemory = token;
  if (token) {
    localStorage.setItem('taskflow_access_token', token);
  } else {
    localStorage.removeItem('taskflow_access_token');
  }
};

export const getAccessToken = (): string | null => {
  if (accessTokenMemory) return accessTokenMemory;
  if (typeof window !== 'undefined') {
    accessTokenMemory = localStorage.getItem('taskflow_access_token');
  }
  return accessTokenMemory;
};

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };

  let response = await fetch(`${API_BASE}${endpoint}`, config);

  // Auto refresh token if 401 expired
  if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
    try {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        if (refreshData.success && refreshData.data?.accessToken) {
          setAccessToken(refreshData.data.accessToken);
          headers['Authorization'] = `Bearer ${refreshData.data.accessToken}`;
          response = await fetch(`${API_BASE}${endpoint}`, { ...config, headers });
        }
      } else {
        setAccessToken(null);
      }
    } catch (err) {
      setAccessToken(null);
    }
  }

  const data: ApiResponse<T> = await response.json().catch(() => ({
    success: false,
    message: 'Failed to parse server response',
  }));

  if (!response.ok && data.success) {
    data.success = false;
  }

  return data;
}
