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
  FirestoreError
} from 'firebase/firestore';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { db, auth } from '@/config/firebase';
import type { CreateTestimonialData, Testimonial, UpdateTestimonialData } from '@/types';

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

interface TestimonialManagerState {
  testimonials: Testimonial[];
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

export function useAuthenticatedTestimonialManager() {
  const [state, setState] = useState<TestimonialManagerState>({
    testimonials: [],
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

  const RATE_LIMITS = {
    create: 5,
    update: 10,
    delete: 3,
  };

  const checkRateLimit = (operation: 'create' | 'update' | 'delete'): void => {
    const now = Date.now();
    const limitInfo = state.rateLimitInfo[operation];

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

    if (limitInfo.count >= RATE_LIMITS[operation]) {
      const secondsRemaining = Math.ceil((limitInfo.resetTime - now) / 1000);
      throw new Error(
        `Rate limit exceeded for ${operation} operation. Please wait ${secondsRemaining} seconds before trying again.`
      );
    }

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

  // Real-time listener for testimonials (no auth required for reading)
  useEffect(() => {
    console.log('🔄 Setting up real-time listener for testimonials...');
    
    const testimonialsQuery = query(
      collection(db, 'testimonials'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      testimonialsQuery,
      (snapshot) => {
        console.log('📊 Snapshot received, documents count:', snapshot.size);
        const testimonialsData: Testimonial[] = [];
        
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const timestamp = data.createdAt as Timestamp;
          
          testimonialsData.push({
            id: docSnap.id,
            clientName: data.clientName || '',
            company: data.company || '',
            role: data.role || '',
            project: data.project || '',
            message: data.message || '',
            rating: data.rating || 0,
            approved: data.approved || false,
            image: data.image || '',
            createdAt: timestamp ? timestamp.toDate().toISOString() : new Date().toISOString(),
          });
        });
        
        console.log('✅ Testimonials loaded:', testimonialsData.length);
        setState(prev => ({
          ...prev,
          testimonials: testimonialsData,
          loading: false,
          error: prev.error,
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
      console.log('🛑 Cleaning up testimonials listener');
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

  const createTestimonial = async (testimonialData: CreateTestimonialData): Promise<string> => {
    try {
      console.log('🚀 Creating testimonial with data:', testimonialData);
      
      // Check auth and online status
      validateOperation('create');
      
      // Check rate limit
      checkRateLimit('create');
      
      setState(prev => ({ ...prev, error: null }));
      
      // Validate required fields
      if (!testimonialData.clientName || testimonialData.clientName.trim() === '') {
        throw new Error('Client Name is required');
      }

      const docData = {
        clientName: testimonialData.clientName.trim(),
        company: testimonialData.company?.trim() || '',
        project: testimonialData.project?.trim() || '',
        message: testimonialData.message.trim(),
        rating: testimonialData.rating || 0,
        role: testimonialData.role?.trim() || '',
        image: testimonialData.image || '',
        approved: testimonialData.approved || false,
        createdAt: serverTimestamp(),
      };
      
      console.log('📝 Document data to be created:', docData);
      
      const docRef = await addDoc(collection(db, 'testimonials'), docData);
      
      console.log('✅ Testimonial created successfully with ID:', docRef.id);
      return docRef.id;
    } catch (err) {
      console.error('❌ Error creating testimonial:', err);
      
      const error = err as FirestoreError;
      let errorMessage = 'Failed to create testimonial';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. You do not have access to create testimonials.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Firebase is unavailable. Check your internet connection.';
      } else if (error.code === 'unauthenticated') {
        errorMessage = 'Authentication required. Please sign in to create testimonials.';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setState(prev => ({ ...prev, error: errorMessage }));
      throw new Error(errorMessage);
    }
  };

  const updateTestimonial = async (id: string, testimonialData: UpdateTestimonialData): Promise<void> => {
    try {
      console.log('📝 Updating testimonial:', id, testimonialData);
      
      // Check auth and online status
      validateOperation('update');
      
      // Check rate limit
      checkRateLimit('update');
      
      setState(prev => ({ ...prev, error: null }));
      
      if (!id) {
        throw new Error('Testimonial ID is required');
      }
      
      const testimonialRef = doc(db, 'testimonials', id);
      
      // Only include defined fields in the update
      const updateData: Record<string, unknown> = {
        updatedAt: serverTimestamp(),
        updatedBy: state.user!.uid,
      };

      if (testimonialData.clientName !== undefined) updateData.clientName = testimonialData.clientName.trim();
      if (testimonialData.company !== undefined) updateData.company = testimonialData.company.trim();
      if (testimonialData.approved !== undefined) updateData.approved = testimonialData.approved;
      if (testimonialData.createdAt !== undefined) updateData.createdAt = testimonialData.createdAt;
      if (testimonialData.image !== undefined) updateData.image = testimonialData.image;
      if (testimonialData.message !== undefined) updateData.message = testimonialData.message.trim();
      if (testimonialData.project !== undefined) updateData.project = testimonialData.project;
      if (testimonialData.rating !== undefined) updateData.rating = testimonialData.rating;
      if (testimonialData.role !== undefined) updateData.role = testimonialData.role;
      
      await updateDoc(testimonialRef, updateData);
      console.log('✅ Testimonial updated successfully');
    } catch (err) {
      console.error('❌ Error updating testimonial:', err);
      
      const error = err as FirestoreError;
      let errorMessage = 'Failed to update testimonial';
      
      if (error.code === 'not-found') {
        errorMessage = 'Testimonial not found';
      } else if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. You do not have access to update this testimonial.';
      } else if (error.code === 'unauthenticated') {
        errorMessage = 'Authentication required. Please sign in to update testimonials.';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setState(prev => ({ ...prev, error: errorMessage }));
      throw new Error(errorMessage);
    }
  };

  const deleteTestimonial = async (id: string): Promise<void> => {
    try {
      console.log('🗑️ Deleting testimonial:', id);
      
      // Check auth and online status
      validateOperation('delete');
      
      // Check rate limit
      checkRateLimit('delete');
      
      setState(prev => ({ ...prev, error: null }));
      
      if (!id) {
        throw new Error('Testimonial ID is required');
      }
      
      await deleteDoc(doc(db, 'testimonials', id));
      console.log('✅ Testimonial deleted successfully');
    } catch (err) {
      console.error('❌ Error deleting testimonial:', err);
      
      const error = err as FirestoreError;
      let errorMessage = 'Failed to delete testimonial';
      
      if (error.code === 'not-found') {
        errorMessage = 'Testimonial not found';
      } else if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. You do not have access to delete this testimonial.';
      } else if (error.code === 'unauthenticated') {
        errorMessage = 'Authentication required. Please sign in to delete testimonials.';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setState(prev => ({ ...prev, error: errorMessage }));
      throw new Error(errorMessage);
    }
  };

  return {
    // Data
    testimonials: state.testimonials,
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
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
  };
}