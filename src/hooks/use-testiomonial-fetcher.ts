import { useState, useEffect, useRef } from 'react';
import { 
  collection,
  query,
  orderBy,
  where,
  getDocs,
  Timestamp,
  QuerySnapshot,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Testimonial } from '@/types';

interface CacheData {
  data: Testimonial[];
  timestamp: number;
}

interface TestimonialsFetcherState {
  testimonials: Testimonial[];
  loading: boolean;
  error: string | null;
}

type TimestampInput = 
  | Timestamp
  | { seconds: number; nanoseconds: number }
  | Date
  | string
  | number
  | null
  | undefined;

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const CACHE_KEY = 'testimonials_cache_approved';

// Helper function to safely convert timestamp to ISO string
const convertToISOString = (timestamp: TimestampInput): string => {
  try {
    if (!timestamp) {
      return new Date().toISOString();
    }

    // Check if it's a Firestore Timestamp
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toISOString();
    }

    // Check for serialized Firestore Timestamp
    if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
      const ts = timestamp as { seconds: number; nanoseconds: number };
      const date = new Date(ts.seconds * 1000 + ts.nanoseconds / 1000000);
      return date.toISOString();
    }

    // For Date objects
    if (timestamp instanceof Date) {
      return timestamp.toISOString();
    }

    // For strings and numbers
    if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }

    return new Date().toISOString();
  } catch (error) {
    console.warn('Error converting timestamp:', error, 'value:', timestamp);
    return new Date().toISOString();
  }
};

export function useTestimonialsFetcher(shouldFetch: boolean = true) {
  const [state, setState] = useState<TestimonialsFetcherState>(() => ({
    testimonials: [],
    loading: shouldFetch,
    error: null,
  }));

  const isMountedRef = useRef<boolean>(true);
  const cacheRef = useRef<CacheData | null>(null);
  const shouldFetchRef = useRef<boolean>(shouldFetch);

  const loadFromCache = (): Testimonial[] | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const cacheData: CacheData = JSON.parse(cached);
      const age = Date.now() - cacheData.timestamp;

      if (age > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        cacheRef.current = null;
        return null;
      }

      cacheRef.current = cacheData;
      return cacheData.data;
    } catch (error) {
      console.error('Error loading from cache:', error);
      return null;
    }
  };

  const saveToCache = (testimonials: Testimonial[]): void => {
    try {
      const cacheData: CacheData = {
        data: testimonials,
        timestamp: Date.now(),
      };
      
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      cacheRef.current = cacheData;
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  };

  const getTestimonial = (id: string): Testimonial | undefined => {
    return state.testimonials.find(t => t.id === id);
  };

  const refreshTestimonials = async (): Promise<void> => {
    if (!shouldFetch) {
      console.warn('Cannot refresh: fetching is disabled');
      return;
    }

    localStorage.removeItem(CACHE_KEY);
    cacheRef.current = null;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Only fetch approved testimonials
      const testimonialsQuery = query(
        collection(db, 'testimonials'),
        where('approved', '==', true),
        orderBy('createdAt', 'desc')
      );

      const snapshot: QuerySnapshot<DocumentData> = await getDocs(testimonialsQuery);
      const testimonialsData: Testimonial[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        
        const testimonial = {
          id: doc.id,
          clientName: data.clientName || '',
          company: data.company || '',
          role: data.role || '',
          project: data.project || '',
          message: data.message || '',
          rating: data.rating || 0,
          approved: data.approved || false,
          image: data.image || '',
          createdAt: convertToISOString(data.createdAt),
        };
        
        testimonialsData.push(testimonial);
      });

      saveToCache(testimonialsData);

      if (isMountedRef.current) {
        setState({
          testimonials: testimonialsData,
          loading: false,
          error: null,
        });
      }
    } catch (err) {
      console.error('Error fetching testimonials:', err);
      
      const cachedTestimonials = loadFromCache();
      
      if (isMountedRef.current) {
        if (cachedTestimonials) {
          setState({
            testimonials: cachedTestimonials,
            loading: false,
            error: 'Using cached data due to fetch error',
          });
        } else {
          setState({
            testimonials: [],
            loading: false,
            error: err instanceof Error ? err.message : 'Failed to fetch testimonials',
          });
        }
      }
    }
  };

  // Debug function to check what's in Firestore
  const debugFirestoreData = async (): Promise<void> => {
    try {
      const snapshot = await getDocs(collection(db, 'testimonials'));
      console.log('🔥 Firestore Data Structure:');
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`📄 Document: ${doc.id}`);
        console.log('  Data:', JSON.stringify(data, null, 2));
        console.log('  createdAt:', data.createdAt);
        console.log('  createdAt type:', typeof data.createdAt);
        console.log('  Is Timestamp?', data.createdAt instanceof Timestamp);
        console.log('  approved:', data.approved);
        console.log('---');
      });
    } catch (error) {
      console.error('Debug error:', error);
    }
  };

  useEffect(() => {
    // If shouldFetch is false, don't fetch anything
    if (!shouldFetch) {
      return;
    }

    let cancelled = false;
    isMountedRef.current = true;
    shouldFetchRef.current = shouldFetch;

    const initializeTestimonials = async () => {
      try {
        // Try to load from cache first
        const cachedTestimonials = loadFromCache();
        if (cachedTestimonials && !cancelled) {
          setState({
            testimonials: cachedTestimonials,
            loading: false,
            error: null,
          });
          return;
        }

        // Fetch only approved testimonials from Firestore
        if (!cancelled) {
          setState(prev => ({ ...prev, loading: true, error: null }));
        }

        const testimonialsQuery = query(
          collection(db, 'testimonials'),
          // where('approved', '==', true),
          // orderBy('createdAt', 'desc')
        );

        const snapshot: QuerySnapshot<DocumentData> = await getDocs(testimonialsQuery);
        const testimonialsData: Testimonial[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          
          const testimonial = {
            id: doc.id,
            clientName: data.clientName || '',
            company: data.company || '',
            role: data.role || '',
            project: data.project || '',
            message: data.message || '',
            rating: data.rating || 0,
            approved: data.approved || false,
            image: data.image || '',
            createdAt: convertToISOString(data.createdAt),
          };
          
          testimonialsData.push(testimonial);
        });

        saveToCache(testimonialsData);

        if (!cancelled) {
          setState({
            testimonials: testimonialsData,
            loading: false,
            error: null,
          });
        }
        console.log('gggg', state.testimonials);
        
      } catch (err) {
        console.error('Error fetching testimonials:', err);
        
        const cachedTestimonials = loadFromCache();
        
        if (!cancelled) {
          if (cachedTestimonials) {
            setState({
              testimonials: cachedTestimonials,
              loading: false,
              error: 'Using cached data due to fetch error',
            });
          } else {
            setState({
              testimonials: [],
              loading: false,
              error: err instanceof Error ? err.message : 'Failed to fetch testimonials',
            });
          }
        }
      }
    };

    initializeTestimonials();

    return () => {
      cancelled = true;
      isMountedRef.current = false;
    };
  }, [shouldFetch]);

  return {
    testimonials: state.testimonials,
    loading: state.loading,
    error: state.error,
    refreshTestimonials,
    getTestimonial,
    debugFirestoreData,
  };
}