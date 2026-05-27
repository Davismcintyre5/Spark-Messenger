import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from '@/types/models';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  needsSetup: boolean;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  finishSetup: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ACCESS_TOKEN_KEY = 'spark_access_token';
const REFRESH_TOKEN_KEY = 'spark_refresh_token';
const USER_KEY = 'spark_user';
const SETUP_DONE_KEY = 'spark_setup_done';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);
    const setupDone = localStorage.getItem(SETUP_DONE_KEY) === 'true';

    if (token && savedUser) {
      try {
        setAccessToken(token);
        setUser(JSON.parse(savedUser));
        setNeedsSetup(!setupDone);
      } catch {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(SETUP_DONE_KEY);
      }
    }

    setIsLoading(false);
  }, []);

  const login = useCallback((token: string, refreshToken: string, userData: User) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    localStorage.removeItem(SETUP_DONE_KEY);
    setAccessToken(token);
    setUser(userData);
    setNeedsSetup(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SETUP_DONE_KEY);
    setAccessToken(null);
    setUser(null);
    setNeedsSetup(true);
  }, []);

  const updateUser = useCallback((userData: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  }, []);

  const finishSetup = useCallback(() => {
    localStorage.setItem(SETUP_DONE_KEY, 'true');
    setNeedsSetup(false);
  }, []);

  const value: AuthContextType = {
    user,
    accessToken,
    isAuthenticated: !!accessToken && !!user,
    isLoading,
    needsSetup,
    login,
    logout,
    updateUser,
    finishSetup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}