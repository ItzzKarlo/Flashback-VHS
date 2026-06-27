export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export function apiUrl(path) {
  if (!path) return API_URL;
  if (path.startsWith('http')) return path;
  return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('flashbackvhs.authToken');
}

export function saveAuthSession(data) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('flashbackvhs.authToken', data.token);
  window.localStorage.setItem('flashbackvhs.user', JSON.stringify(data.user));
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem('flashbackvhs.authToken');
  window.localStorage.removeItem('flashbackvhs.user');
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null;

  try {
    const stored = window.localStorage.getItem('flashbackvhs.user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function parseResponseBody(text, contentType) {
  if (!text) return null;

  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function formatApiError(data, fallbackStatus) {
  const detail = data?.detail;

  if (typeof detail === 'string') return detail;

  if (Array.isArray(detail)) {
    return detail.map((item) => {
      const field = Array.isArray(item.loc) ? item.loc.filter((part) => part !== 'body').join('.') : '';
      return field ? `${field}: ${item.msg}` : item.msg || JSON.stringify(item);
    }).join('\n');
  }

  if (detail?.message && detail?.error) {
    return `${detail.message}\n\n${detail.error}`;
  }

  if (detail?.message) return detail.message;
  if (detail?.error) return detail.error;
  if (data?.message) return data.message;
  if (typeof data === 'string' && data.trim()) return data;

  const statusLabel = fallbackStatus ? `HTTP ${fallbackStatus}` : 'network error';
  return `Request failed (${statusLabel}). Please try again.`;
}

export async function apiFetch(path, options = {}) {
  const { auth, ...fetchOptions } = options;
  const token = auth ? getAuthToken() : null;

  const response = await fetch(apiUrl(path), {
    ...fetchOptions,
    headers: {
      ...(fetchOptions.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(fetchOptions.headers || {}),
    },
  });

  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();
  const data = parseResponseBody(text, contentType);

  if (!response.ok) {
    throw new Error(formatApiError(data, response.status));
  }

  return data;
}
