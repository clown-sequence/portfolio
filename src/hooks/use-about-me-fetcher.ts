import { useState, useEffect, useRef } from 'react';
import { 
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  QuerySnapshot,
  type DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { AboutMe, Skill, SkillCategory } from '@/types';


interface CacheData {
  data: AboutMe;
  timestamp: number;
}

interface AboutMeFetcherState {
  aboutMe: AboutMe | null;
  loading: boolean;
  error: string | null;
}

const CACHE_KEY = 'aboutMe_cache';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export function useAboutMeFetcher() {
  const [state, setState] = useState<AboutMeFetcherState>({
    aboutMe: null,
    loading: true,
    error: null,
  });

  const isMountedRef = useRef<boolean>(true);
  const cacheRef = useRef<CacheData | null>(null);

  const loadFromCache = (): AboutMe | null => {
    try {
      const cached: string | null = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const cacheData: CacheData = JSON.parse(cached);
      const age: number = Date.now() - cacheData.timestamp;

      if (age > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      // Convert createdAt string back to Date object
      const userData: AboutMe = {
        ...cacheData.data,
        createdAt: cacheData.data.createdAt 
          ? new Date(cacheData.data.createdAt) 
          : undefined,
      };

      cacheRef.current = { ...cacheData, data: userData };
      return userData;
    } catch (error) {
      console.error('Error loading from cache:', error);
      return null;
    }
  };

  const saveToCache = (userData: AboutMe): void => {
    try {
      const cacheData: CacheData = {
        data: userData,
        timestamp: Date.now(),
      };
      
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      cacheRef.current = cacheData;
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  };

  const mapFirestoreToUserData = (
    doc: QueryDocumentSnapshot<DocumentData>
  ): AboutMe => {
    const data = doc.data() as AboutMe;

    return {
      id: doc.id,
      name: data.name ?? '',
      title: data.title ?? '',
      bio: data.bio ?? '',
      location: data.location ?? '',
      userImg: data.userImg ?? '',
      resume: data.resume ?? '',
      skillCategories: Array.isArray(data.skillCategories) 
        ? data.skillCategories.map((cat: SkillCategory): SkillCategory => ({
            id: cat.id ?? '',
            title: cat.title ?? '',
            skills: Array.isArray(cat.skills) 
              ? cat.skills.map((skill: Skill): Skill => ({
                  id: skill.id ?? '',
                  name: skill.name ?? '',
                }))
              : [],
          }))
        : [],
      createdAt: data.createdAt instanceof Timestamp 
        ? data.createdAt.toDate() 
        : undefined,
    };
  };

  const refreshAboutMe = async (): Promise<void> => {
    localStorage.removeItem(CACHE_KEY);
    cacheRef.current = null;
    
    try {
      setState((prev: AboutMeFetcherState): AboutMeFetcherState => ({ 
        ...prev, 
        loading: true, 
        error: null 
      }));

      const aboutMeQuery = query(
        collection(db, 'aboutMe'),
        orderBy('createdAt', 'desc'),
        limit(1)
      );

      const snapshot: QuerySnapshot<DocumentData> = await getDocs(aboutMeQuery);

      if (snapshot.empty) {
        throw new Error('No user data found');
      }

      const doc: QueryDocumentSnapshot<DocumentData> = snapshot.docs[0];
      const userData: AboutMe = mapFirestoreToUserData(doc);

      saveToCache(userData);

      if (isMountedRef.current) {
        setState({
          aboutMe: userData,
          loading: false,
          error: null,
        });
      }
    } catch (err) {
      console.error('Error fetching about me data:', err);
      
      const cachedData: AboutMe | null = loadFromCache();
      
      if (isMountedRef.current) {
        if (cachedData) {
          setState({
            aboutMe: cachedData,
            loading: false,
            error: 'Using cached data due to fetch error',
          });
        } else {
          setState({
            aboutMe: null,
            loading: false,
            error: err instanceof Error ? err.message : 'Failed to fetch about me data',
          });
        }
      }
    }
  };

  useEffect((): (() => void) => {
    let cancelled = false;
    isMountedRef.current = true;

    const initializeAboutMe = async (): Promise<void> => {
      try {
        // Try to load from cache first
        const cachedData: AboutMe | null = loadFromCache();
        if (cachedData && !cancelled) {
          setState({
            aboutMe: cachedData,
            loading: false,
            error: null,
          });
          return;
        }

        // Fetch from Firestore
        if (!cancelled) {
          setState((prev: AboutMeFetcherState): AboutMeFetcherState => ({ 
            ...prev, 
            loading: true, 
            error: null 
          }));
        }

        const aboutMeQuery = query(
          collection(db, 'aboutMe'),
          orderBy('createdAt', 'desc'),
          limit(1)
        );

        const snapshot: QuerySnapshot<DocumentData> = await getDocs(aboutMeQuery);

        if (snapshot.empty) {
          throw new Error('No user data found');
        }

        const doc: QueryDocumentSnapshot<DocumentData> = snapshot.docs[0];
        const userData: AboutMe = mapFirestoreToUserData(doc);

        saveToCache(userData);

        if (!cancelled) {
          setState({
            aboutMe: userData,
            loading: false,
            error: null,
          });
        }
      } catch (err) {
        console.error('Error fetching about me data:', err);
        
        const cachedData: AboutMe | null = loadFromCache();
        
        if (!cancelled) {
          if (cachedData) {
            setState({
              aboutMe: cachedData,
              loading: false,
              error: 'Using cached data due to fetch error',
            });
          } else {
            setState({
              aboutMe: null,
              loading: false,
              error: err instanceof Error ? err.message : 'Failed to fetch about me data',
            });
          }
        }
      }
    };

    initializeAboutMe();

    return (): void => {
      cancelled = true;
      isMountedRef.current = false;
    };
  }, []);

  return {
    aboutMe: state.aboutMe,
    loading: state.loading,
    error: state.error,
    refreshAboutMe,
  };
}