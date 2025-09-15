export type UserRole = 'administrador' | 'usuario' | 'gerente';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface CreateUserData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
}
