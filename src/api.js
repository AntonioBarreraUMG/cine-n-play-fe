export const API_URL = (import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const TOKEN_KEY = 'cineplay_token';
export const getToken = () => sessionStorage.getItem(TOKEN_KEY);
export const setToken = token => token ? sessionStorage.setItem(TOKEN_KEY, token) : sessionStorage.removeItem(TOKEN_KEY);
export function errorMessage(detail) {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map(item => `${item.loc?.slice(1).join('.') || 'Campo'}: ${item.msg}`).join(' · ');
  return 'No se pudo completar la operación.';
}
export async function api(path, { method = 'GET', body, signal } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { method, headers, signal, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('No se pudo conectar al backend. Comprueba que está iniciado y que la URL y CORS están configurados.');
  }
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && path !== '/auth/login') window.dispatchEvent(new Event('session-expired'));
    const error = new Error(errorMessage(data.detail));
    error.status = response.status;
    throw error;
  }
  return data;
}
