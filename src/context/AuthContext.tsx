import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import * as db from '../lib/database';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string) => void;
  signIn: (email: string, password: string) => void;
  signOut: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const currentUser = db.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const handleSignUp = useCallback((email: string, password: string) => {
    setError(null);
    try {
      const newUser = db.signUp(email, password);
      setUser(newUser);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign up failed');
    }
  }, []);

  const handleSignIn = useCallback((email: string, password: string) => {
    setError(null);
    try {
      const existingUser = db.signIn(email, password);
      setUser(existingUser);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign in failed');
    }
  }, []);

  const handleSignOut = useCallback(() => {
    db.signOut();
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signUp: handleSignUp,
        signIn: handleSignIn,
        signOut: handleSignOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
