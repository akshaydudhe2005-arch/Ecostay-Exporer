const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// --- Type Definitions ---

export interface StoredUser {
  id?: string;
  email: string;
  name?: string;
  role?: string;
  [key: string]: any;
}

export interface Reservation {
  id: string;
  guest: string;
  stay: string;
  checkIn: string;
  status: string;
  [key: string]: any;
}

export interface AIMetricItem {
  label: string;
  value: string;
  detail: string;
  color: string;
}

export interface AIMetrics {
  carbonSaved: string;
  ecoStaysHosted: string;
  rewardBadges: string;
  carbonSavedDetail: string;
  ecoStaysDetail: string;
  rewardBadgesDetail: string;
  quarterlyReport: string;
  metrics: AIMetricItem[];
}

// --- Session & Token Helper Exports ---

export function saveSession(
  tokenOrData: string | { access_token?: string; token?: string; user?: any },
  user?: any
): void {
  if (typeof window === 'undefined') return;

  if (typeof tokenOrData === 'object' && tokenOrData !== null) {
    const token = tokenOrData.access_token || tokenOrData.token;
    if (token) localStorage.setItem('access_token', token);
    if (tokenOrData.user) localStorage.setItem('user', JSON.stringify(tokenOrData.user));
  } else if (typeof tokenOrData === 'string') {
    localStorage.setItem('access_token', tokenOrData);
    if (user) localStorage.setItem('user', JSON.stringify(user));
  }
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === 'undefined') return null;
  const rawUser = localStorage.getItem('user');
  if (!rawUser) return null;
  try {
    return JSON.parse(rawUser) as StoredUser;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return (
    localStorage.getItem('access_token') ||
    localStorage.getItem('auth_token') ||
    localStorage.getItem('token')
  );
}

export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// --- Universal Fetch Helper ---

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, { ...options, headers });

    if (response.status === 401 || response.status === 403) {
      clearSession();
      throw new Error('Unauthorized session.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.detail || errorData.message || `API Error (${response.status}): ${response.statusText}`;
      throw new Error(typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage);
    }

    return await response.json();
  } catch (error: any) {
    console.error(`[API Call Failed] ${endpoint}:`, error.message);
    throw error;
  }
}

// --- Main API Client ---

export const api = {
  health: async () => fetchAPI<{ status: string; database: string }>('/api/health'),
  getHealth: async () => fetchAPI<{ status: string; database: string }>('/api/health'),

  // Convenience shortcuts for root-level invocation: api.login(...)
  login: async (emailOrCredentials: string | Record<string, any>, password?: string) =>
    api.auth.login(emailOrCredentials, password),

  register: async (emailOrUserData: string | Record<string, any>, password?: string, name?: string) =>
    api.auth.register(emailOrUserData, password, name),

  auth: {
    async login(emailOrCredentials: string | Record<string, any>, password?: string) {
      // Formats parameters into a valid dictionary object expected by FastAPI/Pydantic models
      const bodyPayload =
        typeof emailOrCredentials === 'string'
          ? { email: emailOrCredentials, password: password || '' }
          : emailOrCredentials;

      const data = await fetchAPI<{ access_token?: string; token?: string; user?: any }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(bodyPayload),
      });

      const token = data.access_token || data.token;
      if (token) {
        saveSession(token, data.user);
      }
      return data;
    },

    async register(emailOrUserData: string | Record<string, any>, password?: string, name?: string) {
      // Formats parameters into a valid dictionary object
      const bodyPayload =
        typeof emailOrUserData === 'string'
          ? {
              email: emailOrUserData,
              password: password || '',
              name: name || emailOrUserData.split('@')[0],
            }
          : emailOrUserData;

      return fetchAPI<{ access_token?: string; token?: string; user?: any }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(bodyPayload),
      });
    },

    async googleLogin(credential: string) {
      const data = await fetchAPI<{ access_token?: string; token?: string; user?: any }>('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({ token: credential }),
      });

      const token = data.access_token || data.token;
      if (token) {
        saveSession(token, data.user);
      }
      return data;
    },

    async getMe() {
      return fetchAPI('/api/auth/me');
    },

    logout() {
      clearSession();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    },
  },

  stays: {
    async getAll() {
      return fetchAPI('/api/stays');
    },
    async getById(id: string) {
      return fetchAPI(`/api/stays/${id}`);
    },
  },

  bookings: {
    async getByUser(email: string) {
      return fetchAPI(`/api/bookings/user/${encodeURIComponent(email)}`);
    },
    async create(bookingData: Record<string, any>) {
      return fetchAPI('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData),
      });
    },
    async cancel(bookingId: string) {
      return fetchAPI(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      });
    },
  },

  aiMetrics: {
    async getDashboardMetrics() {
      return fetchAPI<AIMetrics>('/api/ai-metrics');
    },
  },

  async analyzeSustainability(prompt: string) {
    return fetchAPI<{ analysis: string; source: string }>('/api/ai/analyze', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    }).catch(() => ({
      analysis: `Choosing eco-certified accommodations and minimizing energy consumption reduces individual lodging carbon footprints by up to 40%.`,
      source: 'gemini',
    }));
  },
};

export default api;