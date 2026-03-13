import React, { createContext, useContext, useState } from 'react';

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
}

const mockUser: User = {
  id: 'u1',
  name: '김원장',
  customClaims: {
    role: 'ADMIN',
    // 'DENTi-Ai' 만 접근 가능하게 라이선스 모사. LOGiS-Ai 등은 미포함.
    accessibleModules: ['DENTi-Ai'], 
    tenantId: 'denti-a-001',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser] = useState<User | null>(mockUser);

  return (
    <AuthContext.Provider value={{ currentUser }}>
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
