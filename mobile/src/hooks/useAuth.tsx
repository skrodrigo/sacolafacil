import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/infra/api';
import { User, Session } from '@/types';

interface AuthContextType {
  user: User | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, signIn: async () => { }, signOut: async () => { }, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    setLoading(true);
    try {
      const session = await api.get<Session>('/api/auth/session');
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  const signIn = async () => {
    await loadUser();
  };

  const signOut = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Failed to logout on backend', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};

