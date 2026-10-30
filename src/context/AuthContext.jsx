import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, getProfile } from '../services/reservationApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('tabor_token');
    const savedUser = localStorage.getItem('tabor_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // Verify token is still valid
      getProfile()
        .then((res) => setUser(res.data.user))
        .catch(() => {
          localStorage.removeItem('tabor_token');
          localStorage.removeItem('tabor_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(username, password) {
    const res = await apiLogin({ username, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('tabor_token', token);
    localStorage.setItem('tabor_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }

  function logout() {
    localStorage.removeItem('tabor_token');
    localStorage.removeItem('tabor_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

