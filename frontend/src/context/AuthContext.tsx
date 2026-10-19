import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { authApi } from '../api/auth';
import { clearAuth, getStoredUser, setAuth } from '../api/client';
import type { UserInfo } from '../types';

interface AuthContextValue {
  user: UserInfo | null;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(() => getStoredUser<UserInfo>());

  const login = useCallback(async (username: string, password: string) => {
    const res = await authApi.login(username, password);
    setAuth(res.token, res.user);
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // 后端无状态，忽略登调接口失败
    }
    clearAuth();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAdmin: user?.role === 'ADMIN', login, logout }),
    [user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth 必须在 AuthProvider 内使用');
  return ctx;
}
