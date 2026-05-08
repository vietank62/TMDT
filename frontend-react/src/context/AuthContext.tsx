import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem('micromentor_user');
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: Readonly<{ children: ReactNode }>) => {
  // Lazy initializer reads localStorage once on mount — avoids setState-in-effect.
  const [user, setUser] = useState<User | null>(readStoredUser);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('micromentor_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('micromentor_user');
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
