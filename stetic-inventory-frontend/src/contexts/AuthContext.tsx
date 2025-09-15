import * as React from 'react';
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, LoginCredentials, AuthContextType, UserRole } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for development
const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@stetic.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'administrador',
    isActive: true,
    createdAt: '2024-01-01',
    lastLogin: '2024-01-15'
  },
  {
    id: '2',
    username: 'gerente',
    email: 'gerente@stetic.com',
    firstName: 'Manager',
    lastName: 'User',
    role: 'gerente',
    isActive: true,
    createdAt: '2024-01-01'
  },
  {
    id: '3',
    username: 'usuario',
    email: 'usuario@stetic.com',
    firstName: 'Regular',
    lastName: 'User',
    role: 'usuario',
    isActive: true,
    createdAt: '2024-01-01'
  }
];

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(
      u => u.username === credentials.username && u.isActive
    );
    
    // Mock password validation (in real app, this would be done on server)
    const isValidPassword = credentials.password === 'password123';
    
    if (foundUser && isValidPassword) {
      const updatedUser = { ...foundUser, lastLogin: new Date().toISOString() };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const hasRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
