import React, { createContext, useContext, useState, useEffect } from 'react';

export type Role = 'ADMIN' | 'USER' | 'GUEST';

export interface User {
  id: string;
  name: string;
  customClaims: {
    role: Role;
    accessibleModules: string[];
    tenantId: string;
  };
}

interface AuthContextType {
  currentUser: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// LocalStorage key for persisting the mock session
const AUTH_STORAGE_KEY = 'wayn_ai_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Check local storage for existing session on initial load
    const storedSession = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedSession) {
      try {
        return JSON.parse(storedSession);
      } catch (e) {
        console.error('Failed to parse stored session', e);
      }
    }
    return null; // 초기 상태는 null (로그인 안 됨)
  });

  const login = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  // Keep localStorage synced if state changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
