/**
 * API Client - Kết nối tới Node.js Backend Server
 * 
 * Khi deploy lên máy chủ 10.24.16.77 với nginx proxy,
 * API_BASE_URL sẽ là '' (rỗng) vì nginx proxy /api/ tới Node.js.
 * 
 * Khi dev trên Lovable, fallback về localStorage.
 */

// Nếu chạy trên máy chủ thực, đổi thành '' (nginx proxy) hoặc 'http://10.24.16.77:3000'
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Kiểm tra xem có backend API không
let _apiAvailable: boolean | null = null;

export async function isApiAvailable(): Promise<boolean> {
  if (_apiAvailable !== null) return _apiAvailable;
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, { 
      signal: AbortSignal.timeout(2000) 
    });
    _apiAvailable = res.ok;
  } catch {
    _apiAvailable = false;
  }
  return _apiAvailable;
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Lỗi kết nối server' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}
