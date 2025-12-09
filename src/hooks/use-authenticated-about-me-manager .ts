import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  FirestoreError,
  limit,
  getDocs
} from 'firebase/firestore';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { db, auth } from '@/config/firebase';
import type { AboutMe, CreateAboutMeData, UpdateAboutMeData } from '@/types';

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

interface AboutMeManagerState {
  aboutMe: AboutMe | null;
  loading: boolean;
  error: string | null;
  user: User | null;
  isOnline: boolean;
  authChecking: boolean;
  rateLimitInfo: {
    create: RateLimitInfo;
    update: RateLimitInfo;
    delete: RateLimitInfo;
  };
}

export function useAuthenticatedAboutMeManager() {
  const [state, setState] = useState<AboutMeManagerState>({
    aboutMe: null,
    loading: true,
    error: null,
    user: null,
    isOnline: navigator.onLine,
    authChecking: true,
    rateLimitInfo: {
      create: { count: 0, resetTime: Date.now() + 60000 },
      update: { count: 0, resetTime: Date.now() + 60000 },
      delete: { count: 0, resetTime: Date.now() + 60000 },
    }
  });

  // Rate limiter configuration (requests per minute)
  const RATE_LIMITS = {
    create: 5,   // 5 creates per minute
    update: 10,  // 10 updates per minute
    delete: 3,   // 3 deletes per minute
  };

  // Check and update rate limit
  const checkRateLimit = (operation: 'create' | 'update' | 'delete'): void => {
    const now = Date.now();
    const limitInfo = state.rateLimitInfo[operation];

    // Reset counter if time window has passed
    if (now >= limitInfo.resetTime) {
      setState(prev => ({
        ...prev,
        rateLimitInfo: {
          ...prev.rateLimitInfo,
          [operation]: { count: 0, resetTime: now + 60000 }
        }
      }));
      return;
    }

    // Check if limit exceeded
    if (limitInfo.count >= RATE_LIMITS[operation]) {
      const secondsRemaining = Math.ceil((limitInfo.resetTime - now) / 1000);
      throw new Error(
        `Rate limit exceeded for ${operation} operation. Please wait ${secondsRemaining} seconds before trying again.`
      );
    }

    // Increment counter
    setState(prev => ({
      ...prev,
      rateLimitInfo: {
        ...prev.rateLimitInfo,
        [operation]: { 
          count: limitInfo.count + 1, 
          resetTime: limitInfo.resetTime 
        }
      }
    }));

    console.log(`⏱️ Rate limit check passed for ${operation}: ${limitInfo.count + 1}/${RATE_LIMITS[operation]}`);
  };

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Connection restored');
      setState(prev => ({ ...prev, isOnline: true, error: null }));
    };

    const handleOffline = () => {
      console.log('📡 Connection lost');
      setState(prev => ({ 
        ...prev, 
        isOnline: false, 
        error: 'No internet connection. Please check your network.' 
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitor authentication state
  useEffect(() => {
    console.log('🔐 Setting up auth state listener...');
    
    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (user) => {
        console.log('👤 Auth state changed:', user ? `User: ${user.uid}` : 'No user');
        setState(prev => ({
          ...prev,
          user,
          authChecking: false,
          error: user ? null : prev.error
        }));
      },
      (error) => {
        console.error('❌ Auth state error:', error);
        setState(prev => ({
          ...prev,
          authChecking: false,
          error: 'Authentication error occurred'
        }));
      }
    );

    return () => {
      console.log('🛑 Cleaning up auth listener');
      unsubscribeAuth();
    };
  }, []);

  // Real-time listener for about me (no auth required for reading)
  // Note: Typically there should only be ONE about me document
  useEffect(() => {
    console.log('🔄 Setting up real-time listener for about me...');
    
    const aboutMeQuery = query(
      collection(db, 'aboutMe'),
      orderBy('createdAt', 'desc'),
      limit(1) // Only get the most recent one
    );

    const unsubscribe = onSnapshot(
      aboutMeQuery,
      (snapshot) => {
        console.log('📊 Snapshot received, documents count:', snapshot.size);
        
        if (snapshot.empty) {
          console.log('ℹ️ No about me document found');
          setState(prev => ({
            ...prev,
            aboutMe: null,
            loading: false,
          }));
          return;
        }

        const docSnap = snapshot.docs[0]; // Get the first (and should be only) document
        const data = docSnap.data();
        
        const aboutMeData: AboutMe = {
          id: docSnap.id,
          name: data.name || '',
          title: data.title || '',
          bio: data.bio || '',
          location: data.location || '',
          userImg: data.userImg || '',
          resume: data.resume || '',
          skillCategories: Array.isArray(data.skillCategories) ? data.skillCategories : [],
          createdBy: data.createdBy || undefined,
          updatedBy: data.updatedBy || undefined,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : undefined,
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : undefined,
        };
        
        console.log('✅ About me loaded:', aboutMeData);
        setState(prev => ({
          ...prev,
          aboutMe: aboutMeData,
          loading: false,
          error: prev.error // Keep auth/network errors if present
        }));
      },
      (err: FirestoreError) => {
        console.error('❌ Error in snapshot listener:', err);
        setState(prev => ({
          ...prev,
          error: err.message,
          loading: false
        }));
      }
    );

    return () => {
      console.log('🛑 Cleaning up about me listener');
      unsubscribe();
    };
  }, []);

  // Pre-operation validation
  const validateOperation = (operationName: string): void => {
    if (!state.isOnline) {
      throw new Error('No internet connection. Please check your network and try again.');
    }

    if (state.authChecking) {
      throw new Error('Authentication check in progress. Please wait a moment.');
    }

    if (!state.user) {
      throw new Error('You must be signed in to perform this action. Please log in and try again.');
    }

    console.log(`✅ Validation passed for ${operationName} (User: ${state.user.uid})`);
  };

  const createAboutMe = async (aboutMeData: CreateAboutMeData): Promise<string> => {
    try {
      console.log('🚀 Creating about me with data:', aboutMeData);
      
      // Check auth and online status
      validateOperation('create');
      
      // Check rate limit
      checkRateLimit('create');
      
      setState(prev => ({ ...prev, error: null }));
      
      // Validate required fields
      if (!aboutMeData.name || aboutMeData.name.trim() === '') {
        throw new Error('Name is required');
      }
      
      if (!aboutMeData.title || aboutMeData.title.trim() === '') {
        throw new Error('Title is required');
      }

      if (!aboutMeData.bio || aboutMeData.bio.trim() === '') {
        throw new Error('Bio is required');
      }

      // Check if an about me document already exists
      const existingQuery = query(collection(db, 'aboutMe'), limit(1));
      const existingDocs = await getDocs(existingQuery);
      
      if (!existingDocs.empty) {
        throw new Error('About me profile already exists. Please update the existing one instead of creating a new one.');
      }

      const docData = {
        name: aboutMeData.name.trim(),
        title: aboutMeData.title.trim(),
        bio: aboutMeData.bio.trim(),
        location: aboutMeData.location?.trim() || '',
        userImg: aboutMeData.userImg?.trim() || '',
        resume: aboutMeData.resume?.trim() || '',
        skillCategories: aboutMeData.skillCategories || [],
        createdBy: state.user!.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      console.log('📝 Document data to be created:', docData);
      
      const docRef = await addDoc(collection(db, 'aboutMe'), docData);
      
      console.log('✅ About me created successfully with ID:', docRef.id);
      return docRef.id;
    } catch (err) {
      console.error('❌ Error creating about me:', err);
      
      const error = err as FirestoreError;
      let errorMessage = 'Failed to create about me';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. You do not have access to create about me.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Firebase is unavailable. Check your internet connection.';
      } else if (error.code === 'unauthenticated') {
        errorMessage = 'Authentication required. Please sign in to create about me.';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setState(prev => ({ ...prev, error: errorMessage }));
      throw new Error(errorMessage);
    }
  };

  const updateAboutMe = async (aboutMeId: string, aboutMeData: UpdateAboutMeData): Promise<void> => {
    try {
      console.log('📝 Updating about me:', aboutMeId, aboutMeData);
      
      // Check auth and online status
      validateOperation('update');
      
      // Check rate limit
      checkRateLimit('update');
      
      setState(prev => ({ ...prev, error: null }));
      
      if (!aboutMeId) {
        throw new Error('About me ID is required');
      }

      // Validate data
      if (aboutMeData.name !== undefined && aboutMeData.name.trim() === '') {
        throw new Error('Name cannot be empty');
      }

      if (aboutMeData.title !== undefined && aboutMeData.title.trim() === '') {
        throw new Error('Title cannot be empty');
      }

      if (aboutMeData.bio !== undefined && aboutMeData.bio.trim() === '') {
        throw new Error('Bio cannot be empty');
      }
      
      const aboutMeRef = doc(db, 'aboutMe', aboutMeId);
      
      // Only include defined fields in the update
      const updateData: Record<string, unknown> = {
        updatedAt: serverTimestamp(),
        updatedBy: state.user!.uid,
      };

      if (aboutMeData.name !== undefined) updateData.name = aboutMeData.name.trim();
      if (aboutMeData.title !== undefined) updateData.title = aboutMeData.title.trim();
      if (aboutMeData.bio !== undefined) updateData.bio = aboutMeData.bio.trim();
      if (aboutMeData.location !== undefined) updateData.location = aboutMeData.location.trim();
      if (aboutMeData.userImg !== undefined) updateData.userImg = aboutMeData.userImg.trim();
      if (aboutMeData.resume !== undefined) updateData.resume = aboutMeData.resume.trim();
      if (aboutMeData.skillCategories !== undefined) updateData.skillCategories = aboutMeData.skillCategories;
      
      await updateDoc(aboutMeRef, updateData);
      console.log('✅ About me updated successfully');
    } catch (err) {
      console.error('❌ Error updating about me:', err);
      
      const error = err as FirestoreError;
      let errorMessage = 'Failed to update about me';
      
      if (error.code === 'not-found') {
        errorMessage = 'About me not found';
      } else if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. You do not have access to update this about me.';
      } else if (error.code === 'unauthenticated') {
        errorMessage = 'Authentication required. Please sign in to update about me.';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setState(prev => ({ ...prev, error: errorMessage }));
      throw new Error(errorMessage);
    }
  };

  const deleteAboutMe = async (aboutMeId: string): Promise<void> => {
    try {
      console.log('🗑️ Deleting about me:', aboutMeId);
      
      // Check auth and online status
      validateOperation('delete');
      
      // Check rate limit
      checkRateLimit('delete');
      
      setState(prev => ({ ...prev, error: null }));
      
      if (!aboutMeId) {
        throw new Error('About me ID is required');
      }
      
      await deleteDoc(doc(db, 'aboutMe', aboutMeId));
      console.log('✅ About me deleted successfully');
    } catch (err) {
      console.error('❌ Error deleting about me:', err);
      
      const error = err as FirestoreError;
      let errorMessage = 'Failed to delete about me';
      
      if (error.code === 'not-found') {
        errorMessage = 'About me not found';
      } else if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. You do not have access to delete this about me.';
      } else if (error.code === 'unauthenticated') {
        errorMessage = 'Authentication required. Please sign in to delete about me.';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setState(prev => ({ ...prev, error: errorMessage }));
      throw new Error(errorMessage);
    }
  };

  return {
    // Data
    aboutMe: state.aboutMe,
    loading: state.loading,
    error: state.error,
    
    // Auth & Network status
    user: state.user,
    isAuthenticated: !!state.user,
    isOnline: state.isOnline,
    authChecking: state.authChecking,
    
    // Rate limit info
    rateLimitInfo: state.rateLimitInfo,
    
    // Operations
    createAboutMe,
    updateAboutMe,
    deleteAboutMe,
  };
}