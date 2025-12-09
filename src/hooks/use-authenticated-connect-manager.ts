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
import type { ContactData } from '@/types';

// Extended ContactData type with metadata
interface ContactDocument extends ContactData {
  id: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Types for create and update operations
type CreateContactData = ContactData;
type UpdateContactData = Partial<ContactData>;

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

interface ContactManagerState {
  contact: ContactDocument | null;
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

export function useAuthenticatedContactManager() {
  const [state, setState] = useState<ContactManagerState>({
    contact: null,
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
    update: 15,  // 15 updates per minute (higher for frequent edits)
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

  // Real-time listener for contact data
  useEffect(() => {
    console.log('🔄 Setting up real-time listener for contact...');
    
    const contactQuery = query(
      collection(db, 'contact'),
      orderBy('createdAt', 'desc'),
      limit(1) // Only get the most recent one (should only be one)
    );

    const unsubscribe = onSnapshot(
      contactQuery,
      (snapshot) => {
        console.log('📊 Snapshot received, documents count:', snapshot.size);
        
        if (snapshot.empty) {
          console.log('ℹ️ No contact document found');
          setState(prev => ({
            ...prev,
            contact: null,
            loading: false,
          }));
          return;
        }

        const docSnap = snapshot.docs[0];
        const data = docSnap.data();
        
        const contactData: ContactDocument = {
          id: docSnap.id,
          availableHours: {
            weekdays: data.availableHours?.weekdays || '',
            weekends: data.availableHours?.weekends || '',
          },
          hotline: {
            phone: data.hotline?.phone || '',
            location: data.hotline?.location || '',
          },
          socialLinks: {
            facebook: data.socialLinks?.facebook || '',
            instagram: data.socialLinks?.instagram || '',
            twitter: data.socialLinks?.twitter || '',
            linkedin: data.socialLinks?.linkedin || '',
          },
          createdBy: data.createdBy || undefined,
          updatedBy: data.updatedBy || undefined,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : undefined,
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : undefined,
        };
        
        console.log('✅ Contact loaded:', contactData);
        setState(prev => ({
          ...prev,
          contact: contactData,
          loading: false,
          error: prev.error
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
      console.log('🛑 Cleaning up contact listener');
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

  // Validate contact data structure
  const validateContactData = (data: CreateContactData | UpdateContactData, isUpdate = false): void => {
    // For updates, we only validate fields that are being updated
    if (!isUpdate) {
      // Required structure validation for create
      if (!data.availableHours) {
        throw new Error('Available hours information is required');
      }
      if (!data.hotline) {
        throw new Error('Hotline information is required');
      }
      if (!data.socialLinks) {
        throw new Error('Social links information is required');
      }
    }

    // Validate URLs if provided
    const urlFields = [
      data.socialLinks?.facebook,
      data.socialLinks?.instagram,
      data.socialLinks?.twitter,
      data.socialLinks?.linkedin,
    ].filter(Boolean);

    for (const url of urlFields) {
      if (url && url.trim() !== '') {
        try {
          new URL(url);
        } catch {
          throw new Error(`Invalid URL format: ${url}`);
        }
      }
    }
  };

  const createContact = async (contactData: CreateContactData): Promise<string> => {
    try {
      console.log('🚀 Creating contact with data:', contactData);
      
      // Check auth and online status
      validateOperation('create');
      
      // Check rate limit
      checkRateLimit('create');
      
      setState(prev => ({ ...prev, error: null }));
      
      // Validate data structure
      validateContactData(contactData);

      // Check if a contact document already exists
      const existingQuery = query(collection(db, 'contact'), limit(1));
      const existingDocs = await getDocs(existingQuery);
      
      if (!existingDocs.empty) {
        throw new Error('Contact information already exists. Please update the existing one instead of creating a new one.');
      }

      const docData = {
        availableHours: {
          weekdays: contactData.availableHours.weekdays.trim(),
          weekends: contactData.availableHours.weekends.trim(),
        },
        hotline: {
          phone: contactData.hotline.phone.trim(),
          location: contactData.hotline.location.trim(),
        },
        socialLinks: {
          facebook: contactData.socialLinks.facebook?.trim() || '',
          instagram: contactData.socialLinks.instagram?.trim() || '',
          twitter: contactData.socialLinks.twitter?.trim() || '',
          linkedin: contactData.socialLinks.linkedin?.trim() || '',
        },
        createdBy: state.user!.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      console.log('📝 Document data to be created:', docData);
      
      const docRef = await addDoc(collection(db, 'contact'), docData);
      
      console.log('✅ Contact created successfully with ID:', docRef.id);
      return docRef.id;
    } catch (err) {
      console.error('❌ Error creating contact:', err);
      
      const error = err as FirestoreError;
      let errorMessage = 'Failed to create contact';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. You do not have access to create contact information.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Firebase is unavailable. Check your internet connection.';
      } else if (error.code === 'unauthenticated') {
        errorMessage = 'Authentication required. Please sign in to create contact information.';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setState(prev => ({ ...prev, error: errorMessage }));
      throw new Error(errorMessage);
    }
  };

  const updateContact = async (contactId: string, contactData: UpdateContactData): Promise<void> => {
    try {
      console.log('📝 Updating contact:', contactId, contactData);
      
      // Check auth and online status
      validateOperation('update');
      
      // Check rate limit
      checkRateLimit('update');
      
      setState(prev => ({ ...prev, error: null }));
      
      if (!contactId) {
        throw new Error('Contact ID is required');
      }

      // Validate data
      validateContactData(contactData, true);
      
      const contactRef = doc(db, 'contact', contactId);
      
      // Build update data dynamically
      const updateData: Record<string, unknown> = {
        updatedAt: serverTimestamp(),
        updatedBy: state.user!.uid,
      };

      // Update nested fields if provided
      if (contactData.availableHours) {
        if (contactData.availableHours.weekdays !== undefined) {
          updateData['availableHours.weekdays'] = contactData.availableHours.weekdays.trim();
        }
        if (contactData.availableHours.weekends !== undefined) {
          updateData['availableHours.weekends'] = contactData.availableHours.weekends.trim();
        }
      }

      if (contactData.hotline) {
        if (contactData.hotline.phone !== undefined) {
          updateData['hotline.phone'] = contactData.hotline.phone.trim();
        }
        if (contactData.hotline.location !== undefined) {
          updateData['hotline.location'] = contactData.hotline.location.trim();
        }
      }

      if (contactData.socialLinks) {
        if (contactData.socialLinks.facebook !== undefined) {
          updateData['socialLinks.facebook'] = contactData.socialLinks.facebook.trim();
        }
        if (contactData.socialLinks.instagram !== undefined) {
          updateData['socialLinks.instagram'] = contactData.socialLinks.instagram.trim();
        }
        if (contactData.socialLinks.twitter !== undefined) {
          updateData['socialLinks.twitter'] = contactData.socialLinks.twitter.trim();
        }
        if (contactData.socialLinks.linkedin !== undefined) {
          updateData['socialLinks.linkedin'] = contactData.socialLinks.linkedin.trim();
        }
      }
      
      await updateDoc(contactRef, updateData);
      console.log('✅ Contact updated successfully');
    } catch (err) {
      console.error('❌ Error updating contact:', err);
      
      const error = err as FirestoreError;
      let errorMessage = 'Failed to update contact';
      
      if (error.code === 'not-found') {
        errorMessage = 'Contact not found';
      } else if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. You do not have access to update this contact.';
      } else if (error.code === 'unauthenticated') {
        errorMessage = 'Authentication required. Please sign in to update contact.';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setState(prev => ({ ...prev, error: errorMessage }));
      throw new Error(errorMessage);
    }
  };

  const deleteContact = async (contactId: string): Promise<void> => {
    try {
      console.log('🗑️ Deleting contact:', contactId);
      
      // Check auth and online status
      validateOperation('delete');
      
      // Check rate limit
      checkRateLimit('delete');
      
      setState(prev => ({ ...prev, error: null }));
      
      if (!contactId) {
        throw new Error('Contact ID is required');
      }
      
      await deleteDoc(doc(db, 'contact', contactId));
      console.log('✅ Contact deleted successfully');
    } catch (err) {
      console.error('❌ Error deleting contact:', err);
      
      const error = err as FirestoreError;
      let errorMessage = 'Failed to delete contact';
      
      if (error.code === 'not-found') {
        errorMessage = 'Contact not found';
      } else if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. You do not have access to delete this contact.';
      } else if (error.code === 'unauthenticated') {
        errorMessage = 'Authentication required. Please sign in to delete contact.';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setState(prev => ({ ...prev, error: errorMessage }));
      throw new Error(errorMessage);
    }
  };

  return {
    // Data
    contact: state.contact,
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
    createContact,
    updateContact,
    deleteContact,
  };
}