'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { api } from './api';
import type { Role } from './types';

interface JwtPayload {
  sub: string;
  userId: number;
  role: Role;
  exp: number;
}

interface AuthContextType {
  token: string | null;
  userId: number | null;
  email: string | null;
  role: Role | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (nome: string, email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (stored) {
      try {
        const decoded = jwtDecode<JwtPayload>(stored);
        if (decoded.exp * 1000 > Date.now()) {
          setToken(stored);
          setUserId(decoded.userId);
          setEmail(decoded.sub);
          setRole(decoded.role);
        } else {
          localStorage.removeItem('token');
        }
      } catch {
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, senha: string) => {
    const res = await api.post<{ token: string }>('/usuario/login', { email, senha });
    const decoded = jwtDecode<JwtPayload>(res.token);
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setUserId(decoded.userId);
    setEmail(decoded.sub);
    setRole(decoded.role);
  };

  const register = async (nome: string, email: string, senha: string) => {
    await api.post('/usuario', { nome, email, senha });
    await login(email, senha);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUserId(null);
    setEmail(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ token, userId, email, role, isAdmin: role === 'ADMIN', isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
