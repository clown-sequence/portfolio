import { createContext, useState, useEffect, type ReactNode, useContext } from 'react';
import { 
  type User,
  type UserCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type AuthError
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import type { AuthContextType, AuthErrorResponse } from '@/types/auth-types';
import { 
  getAuthErrorMessage, 
  isValidEmail, 
  isValidPassword 
} from '@/config/auth-utils';

// ============================================
// CONTEXT CREATION
// ============================================

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// AUTH PROVIDER COMPONENT
// ============================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<AuthErrorResponse | null>(null);

  // Listen to auth state changes
  useEffect(() => {
    // FIXED: Use Error type instead of AuthError for the error callback
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser: User | null) => {
        console.log('Auth state changed:', currentUser?.email || 'No user');
        setUser(currentUser);
        setLoading(false);
      },
      (error: Error) => {  // FIXED: Changed from AuthError to Error
        console.error('Auth state change error:', error);
        
        // Type guard to check if it's an AuthError
        if ('code' in error && typeof (error as AuthError).code === 'string') {
          setError(getAuthErrorMessage(error as AuthError));
        } else {
          setError({
            code: 'auth/unknown',
            message: error.message || 'An unknown error occurred'
          });
        }
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  /**
   * Sign in with email and password
   */
  const signIn = async (
    email: string, 
    password: string
  ): Promise<UserCredential> => {
    try {
      setError(null);
      
      if (!email || !password) {
        const validationError: AuthErrorResponse = {
          code: 'auth/invalid-input',
          message: 'Email and password are required'
        };
        setError(validationError);
        throw new Error(validationError.message);
      }

      if (!isValidEmail(email)) {
        const validationError: AuthErrorResponse = {
          code: 'auth/invalid-email',
          message: 'Invalid email address format'
        };
        setError(validationError);
        throw new Error(validationError.message);
      }

      setLoading(true);
      
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        email.trim(), 
        password
      );
      
      console.log('Sign in successful:', userCredential.user.email);
      return userCredential;
      
    } catch (err) {
      const authError = err as AuthError;
      const errorResponse = getAuthErrorMessage(authError);
      setError(errorResponse);
      console.error('Sign in error:', errorResponse);
      throw new Error(errorResponse.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign up with email and password
   */
  const signUp = async (
    email: string, 
    password: string
  ): Promise<UserCredential> => {
    try {
      setError(null);
      
      if (!email || !password) {
        const validationError: AuthErrorResponse = {
          code: 'auth/invalid-input',
          message: 'Email and password are required'
        };
        setError(validationError);
        throw new Error(validationError.message);
      }

      if (!isValidEmail(email)) {
        const validationError: AuthErrorResponse = {
          code: 'auth/invalid-email',
          message: 'Invalid email address format'
        };
        setError(validationError);
        throw new Error(validationError.message);
      }

      const passwordValidation = isValidPassword(password);
      if (!passwordValidation.valid) {
        const validationError: AuthErrorResponse = {
          code: 'auth/weak-password',
          message: passwordValidation.message || 'Invalid password'
        };
        setError(validationError);
        throw new Error(validationError.message);
      }

      setLoading(true);
      
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        email.trim(), 
        password
      );
      
      console.log('Sign up successful:', userCredential.user.email);
      return userCredential;
      
    } catch (err) {
      const authError = err as AuthError;
      const errorResponse = getAuthErrorMessage(authError);
      setError(errorResponse);
      console.error('Sign up error:', errorResponse);
      throw new Error(errorResponse.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout current user
   */
  const logout = async (): Promise<void> => {
    try {
      setError(null);
      await signOut(auth);
      console.log('Logout successful');
    } catch (err) {
      const authError = err as AuthError;
      const errorResponse = getAuthErrorMessage(authError);
      setError(errorResponse);
      console.error('Logout error:', errorResponse);
      throw new Error(errorResponse.message);
    }
  };

  /**
   * Clear error state
   */
  const clearError = (): void => {
    setError(null);
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = !!user;

  /**
   * Get current user ID
   */
  const getUserId = (): string | null => {
    return user?.uid || null;
  };

  /**
   * Get current user email
   */
  const getUserEmail = (): string | null => {
    return user?.email || null;
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    signIn,
    signUp,
    logout,
    clearError,
    isAuthenticated,
    getUserId,
    getUserEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// CUSTOM HOOK (Only export this and AuthProvider)
// ============================================

/**
 * Custom hook to use auth context
 * @throws {Error} If used outside of AuthProvider
 * @returns {AuthContextType} Auth context value
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error(
      'useAuth must be used within an AuthProvider. ' +
      'Wrap your component tree with <AuthProvider>.'
    );
  }
  
  return context;
}
