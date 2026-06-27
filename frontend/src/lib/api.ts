const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

function parseErrorDetail(detail: unknown): string {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) =>
        typeof item === 'object' && item && 'msg' in item ? String(item.msg) : String(item),
      )
      .join(', ');
  }
  return 'Request failed';
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('ecostay_token') : null;
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(parseErrorDetail(error.detail));
  }

  return response.json() as Promise<T>;
}

export interface EcoStay {
  id: number;
  title: string;
  description: string;
  image: string;
  location: string;
  rating: number;
  badge: string;
}

export interface Reservation {
  id: string;
  guest: string;
  stay: string;
  checkIn: string;
  status: 'Confirmed' | 'Pending' | 'Checked In';
}

export interface ImpactMetric {
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
  metrics: ImpactMetric[];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: StoredUser;
}

export interface StoredUser {
  id: string;
  email: string;
  name: string;
}

export interface AIAnalysisResult {
  analysis: string;
  source: string;
}

export const api = {
  getStays: () => request<EcoStay[]>('/api/stays'),
  getReservations: () => request<Reservation[]>('/api/reservations'),
  getMetrics: () => request<AIMetrics>('/api/ai-metrics'),
  analyzeSustainability: (prompt: string) =>
    request<AIAnalysisResult>('/api/ai-metrics/analyze', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    }),
  login: (email: string, password: string) =>
    request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string, name = '') =>
    request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),
  health: () => request<{ status: string; database: string }>('/api/health'),
};

export function saveSession(token: string, user: StoredUser) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('ecostay_token', token);
  localStorage.setItem('ecostay_user', JSON.stringify(user));
  window.dispatchEvent(new Event('ecostay-auth-change'));
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('ecostay_token');
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('ecostay_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('ecostay_token');
  localStorage.removeItem('ecostay_user');
  window.dispatchEvent(new Event('ecostay-auth-change'));
}

/** @deprecated use saveSession */
export function saveAuthToken(token: string) {
  saveSession(token, { id: '', email: '', name: '' });
}
