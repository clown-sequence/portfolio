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
import type { 
  AuthContextType, 
  AuthErrorResponse,
  SignInCredentials,
  SignUpCredentials 
} from '@/types';
import { 
  getAuthErrorMessage, 
  isValidEmail, 
  isValidPassword 
} from '@/config/auth-utils';


export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<AuthErrorResponse | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser: User | null) => {
        setUser(currentUser);
        setLoading(false);
      },
      (error: Error) => {
        
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

    return () => unsubscribe();
  }, []);

  const signIn = async (
    credentials: SignInCredentials
  ): Promise<UserCredential> => {
    const { email, password } = credentials;
    
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
      
      return userCredential;
      
    } catch (err) {
      const authError = err as AuthError;
      const errorResponse = getAuthErrorMessage(authError);
      setError(errorResponse);
      throw new Error(errorResponse.message);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    credentials: SignUpCredentials
  ): Promise<UserCredential> => {
    const { email, password } = credentials;
    
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
      
      return userCredential;
      
    } catch (err) {
      const authError = err as AuthError;
      const errorResponse = getAuthErrorMessage(authError);
      setError(errorResponse);
      throw new Error(errorResponse.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err) {
      const authError = err as AuthError;
      const errorResponse = getAuthErrorMessage(authError);
      setError(errorResponse);
      throw new Error(errorResponse.message);
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  const isAuthenticated = !!user;

  const getUserId = (): string | null => {
    return user?.uid || null;
  };

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