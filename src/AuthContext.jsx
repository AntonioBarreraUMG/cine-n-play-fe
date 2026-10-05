import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from './api';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bootError, setBootError] = useState('');
  const [notice, setNotice] = useState('');
  async function restore() {
    setLoading(true); setBootError('');
    try {
      if (getToken()) setUser(await api('/auth/me'));
    } catch (error) {
      if (error.status !== 401) setBootError(error.message);
    } finally { setLoading(false); }
  }
  useEffect(() => {
    const expired = () => { setToken(null); setUser(null); setNotice('Tu sesión terminó. Inicia sesión nuevamente.'); };
    window.addEventListener('session-expired', expired);
    restore();
    return () => window.removeEventListener('session-expired', expired);
  }, []);
  async function login(correo, password) {
    const result = await api('/auth/login', { method: 'POST', body: { correo, password } });
    setToken(result.access_token);
    try { setUser(await api('/auth/me')); setNotice(''); }
    catch (error) { setToken(null); throw error; }
  }
  async function logout() {
    try { await api('/auth/logout', { method: 'POST' }); }
    catch (error) { if (error.status !== 401) throw error; }
    setToken(null); setUser(null); setNotice('');
  }
  return <AuthContext.Provider value={{ user, loading, bootError, notice, login, logout, restore }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
