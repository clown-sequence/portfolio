import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  Timestamp,
  FirestoreError,
  Query,
  type DocumentData,
  QuerySnapshot,
  DocumentSnapshot,
  type Unsubscribe
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { ContactData } from '@/types';

// ==================== TYPE DEFINITIONS ====================

/**
 * Extended ContactData type with metadata
 */
interface ContactDocument extends ContactData {
  id: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * State for contact data management
 */
interface ContactDataState {
  contact: ContactDocument | null;
  loading: boolean;
  error: string | null;
  isOnline: boolean;
}

/**
 * Return type for useContactData hook
 */
interface UseContactDataReturn {
  contact: ContactDocument | null;
  loading: boolean;
  error: string | null;
  isOnline: boolean;
  refresh: () => Promise<void>;
}

/**
 * Return type for useContactById hook
 */
interface UseContactByIdReturn {
  contact: ContactDocument | null;
  loading: boolean;
  error: string | null;
  isOnline: boolean;
}

/**
 * Raw Firestore document data structure
 */
interface RawContactData {
  availableHours?: {
    weekdays?: string;
    weekends?: string;
  };
  hotline?: {
    phone?: string;
    location?: string;
  };
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Transforms Firestore document to ContactDocument
 */
const transformDocument = (docId: string, data: RawContactData): ContactDocument => {
  return {
    id: docId,
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
    createdBy: data.createdBy,
    updatedBy: data.updatedBy,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : undefined,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : undefined,
  };
};

/**
 * Gets user-friendly error message from FirestoreError
 */
const getErrorMessage = (err: unknown): string => {
  if (err instanceof FirestoreError) {
    switch (err.code) {
      case 'unavailable':
        return 'Firebase is currently unavailable. Please try again later.';
      case 'permission-denied':
        return 'Permission denied. Unable to access contact data.';
      default:
        return err.message;
    }
  }
  
  if (err instanceof Error) {
    return err.message;
  }
  
  return 'Failed to fetch contact data';
};

// ==================== HOOKS ====================

/**
 * Hook to fetch and manage contact data with optional real-time updates
 * @param realtime - Enable real-time Firestore listener (default: true)
 * @returns Contact data state and refresh function
 */
export function useContactData(realtime: boolean = true): UseContactDataReturn {
  const [state, setState] = useState<ContactDataState>({
    contact: null,
    loading: true,
    error: null,
    isOnline: navigator.onLine,
  });

  // Monitor online/offline status
  useEffect((): (() => void) => {
    const handleOnline = (): void => {
      console.log('🌐 Connection restored');
      setState(prev => ({ ...prev, isOnline: true, error: null }));
    };

    const handleOffline = (): void => {
      console.log('📡 Connection lost');
      setState(prev => ({ 
        ...prev, 
        isOnline: false, 
        error: 'No internet connection. Displaying cached data.' 
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return (): void => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Real-time listener for contact data
  useEffect((): (() => void) | undefined => {
    if (!realtime) return; // Skip if real-time is disabled

    console.log('🔄 Setting up real-time listener for contact data...');
    
    const contactQuery: Query<DocumentData> = query(
      collection(db, 'contact'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribe: Unsubscribe = onSnapshot(
      contactQuery,
      (snapshot: QuerySnapshot<DocumentData>): void => {
        console.log('📊 Real-time snapshot received, documents:', snapshot.size);
        
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
        const data = docSnap.data() as RawContactData;
        
        const contactData: ContactDocument = transformDocument(docSnap.id, data);
        
        console.log('✅ Contact loaded (real-time):', contactData);
        setState(prev => ({
          ...prev,
          contact: contactData,
          loading: false,
          error: null,
        }));
      },
      (err: FirestoreError): void => {
        console.error('❌ Error in real-time listener:', err);
        const errorMessage: string = getErrorMessage(err);
        
        setState(prev => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
      }
    );

    return (): void => {
      console.log('🛑 Cleaning up real-time contact listener');
      unsubscribe();
    };
  }, [realtime]);

  // One-time fetch for contact data (when real-time is disabled)
  useEffect((): void => {
    if (realtime) return; // Skip if real-time is enabled

    const fetchContact = async (): Promise<void> => {
      console.log('📥 Fetching contact data (one-time)...');
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const contactQuery: Query<DocumentData> = query(
          collection(db, 'contact'),
          orderBy('createdAt', 'desc'),
          limit(1)
        );

        const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(contactQuery);

        if (querySnapshot.empty) {
          console.log('ℹ️ No contact document found');
          setState(prev => ({
            ...prev,
            contact: null,
            loading: false,
          }));
          return;
        }

        const docSnap = querySnapshot.docs[0];
        const data = docSnap.data() as RawContactData;
        
        const contactData: ContactDocument = transformDocument(docSnap.id, data);
        
        console.log('✅ Contact fetched (one-time):', contactData);
        setState({
          contact: contactData,
          loading: false,
          error: null,
          isOnline: navigator.onLine,
        });
      } catch (err) {
        console.error('❌ Error fetching contact:', err);
        const errorMessage: string = getErrorMessage(err);
        
        setState(prev => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
      }
    };

    fetchContact();
  }, [realtime]);

  /**
   * Manual refresh function to fetch latest contact data
   */
  const refresh = async (): Promise<void> => {
    console.log('🔄 Manual refresh triggered...');
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const contactQuery: Query<DocumentData> = query(
        collection(db, 'contact'),
        orderBy('createdAt', 'desc'),
        limit(1)
      );

      const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(contactQuery);

      if (querySnapshot.empty) {
        console.log('ℹ️ No contact document found');
        setState(prev => ({
          ...prev,
          contact: null,
          loading: false,
        }));
        return;
      }

      const docSnap = querySnapshot.docs[0];
      const data = docSnap.data() as RawContactData;
      
      const contactData: ContactDocument = transformDocument(docSnap.id, data);
      
      console.log('✅ Contact refreshed:', contactData);
      setState(prev => ({
        ...prev,
        contact: contactData,
        loading: false,
        error: null,
      }));
    } catch (err) {
      console.error('❌ Error refreshing contact:', err);
      const errorMessage: string = getErrorMessage(err);
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
    }
  };

  return {
    contact: state.contact,
    loading: state.loading,
    error: state.error,
    isOnline: state.isOnline,
    refresh,
  };
}

/**
 * Hook to fetch and manage a specific contact by ID with optional real-time updates
 * @param contactId - Contact document ID (null to skip fetching)
 * @param realtime - Enable real-time Firestore listener (default: true)
 * @returns Contact data state
 */
export function useContactById(
  contactId: string | null, 
  realtime: boolean = true
): UseContactByIdReturn {
  // Initialize state with null contactId handling
  const [state, setState] = useState<ContactDataState>(() => ({
    contact: null,
    loading: contactId ? true : false,
    error: null,
    isOnline: navigator.onLine,
  }));

  // Real-time listener for specific contact
  useEffect((): (() => void) | undefined => {
    if (!contactId) return; // Exit early if no contactId
    if (!realtime) return; // Skip if real-time is disabled

    console.log('🔄 Setting up real-time listener for contact ID:', contactId);
    
    const contactRef = doc(db, 'contact', contactId);

    const unsubscribe: Unsubscribe = onSnapshot(
      contactRef,
      (docSnap: DocumentSnapshot<DocumentData>): void => {
        if (!docSnap.exists()) {
          console.log('ℹ️ Contact document not found');
          setState(prev => ({
            ...prev,
            contact: null,
            loading: false,
            error: 'Contact not found',
          }));
          return;
        }

        const data = docSnap.data() as RawContactData;
        const contactData: ContactDocument = transformDocument(docSnap.id, data);
        
        console.log('✅ Contact loaded by ID (real-time):', contactData);
        setState(prev => ({
          ...prev,
          contact: contactData,
          loading: false,
          error: null,
        }));
      },
      (err: FirestoreError): void => {
        console.error('❌ Error in real-time listener:', err);
        const errorMessage: string = getErrorMessage(err);
        
        setState(prev => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
      }
    );

    return (): void => {
      console.log('🛑 Cleaning up contact listener for ID:', contactId);
      unsubscribe();
    };
  }, [contactId, realtime]);

  // One-time fetch by ID
  useEffect((): void => {
    if (!contactId || realtime) return; // Skip if no ID or real-time is enabled

    const fetchContactById = async (): Promise<void> => {
      console.log('📥 Fetching contact by ID:', contactId);
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const contactRef = doc(db, 'contact', contactId);
        const docSnap: DocumentSnapshot<DocumentData> = await getDoc(contactRef);

        if (!docSnap.exists()) {
          setState(prev => ({
            ...prev,
            contact: null,
            loading: false,
            error: 'Contact not found',
          }));
          return;
        }

        const data = docSnap.data() as RawContactData;
        const contactData: ContactDocument = transformDocument(docSnap.id, data);
        
        console.log('✅ Contact fetched by ID:', contactData);
        setState({
          contact: contactData,
          loading: false,
          error: null,
          isOnline: navigator.onLine,
        });
      } catch (err) {
        console.error('❌ Error fetching contact by ID:', err);
        const errorMessage: string = getErrorMessage(err);
        
        setState(prev => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
      }
    };

    fetchContactById();
  }, [contactId, realtime]);

  return {
    contact: state.contact,
    loading: state.loading,
    error: state.error,
    isOnline: state.isOnline,
  };
}