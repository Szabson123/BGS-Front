// src/auth/AuthContext.tsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../utils/apiClient';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      await apiClient('/user/auth/csrf/');
      const userData = await apiClient<User>('/user/auth/me/');
      setUser(userData);
    } catch (err) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials: any) => {
    await apiClient('/user/auth/csrf/');
    const userData = await apiClient<User>('/user/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    setUser(userData);
  };

  const logout = async () => {
    await apiClient('/user/auth/logout/', { method: 'POST' });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};