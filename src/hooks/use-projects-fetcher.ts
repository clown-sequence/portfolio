import { useState, useEffect, useRef } from 'react';
import { 
  collection,
  query,
  orderBy,
  getDocs,
  Timestamp,
  QuerySnapshot,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Project } from '@/types';

interface CacheData {
  data: Project[];
  timestamp: number;
}

interface ProjectsFetcherState {
  projects: Project[];
  loading: boolean;
  error: string | null;
}

const CACHE_KEY = 'projects_cache';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export function useProjectsFetcher() {
  const [state, setState] = useState<ProjectsFetcherState>({
    projects: [],
    loading: true,
    error: null,
  });

  const isMountedRef = useRef<boolean>(true);
  const cacheRef = useRef<CacheData | null>(null);

  const loadFromCache = (): Project[] | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const cacheData: CacheData = JSON.parse(cached);
      const age = Date.now() - cacheData.timestamp;

      if (age > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      cacheRef.current = cacheData;
      return cacheData.data;
    } catch (error) {
      console.error('Error loading from cache:', error);
      return null;
    }
  };

  const saveToCache = (projects: Project[]): void => {
    try {
      const cacheData: CacheData = {
        data: projects,
        timestamp: Date.now(),
      };
      
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      cacheRef.current = cacheData;
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  };

  const getProject = (projectId: string): Project | undefined => {
    return state.projects.find(p => p.id === projectId);
  };

  const refreshProjects = async (): Promise<void> => {
    localStorage.removeItem(CACHE_KEY);
    cacheRef.current = null;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const projectsQuery = query(
        collection(db, 'projects'),
        orderBy('createdAt', 'desc')
      );

      const snapshot: QuerySnapshot<DocumentData> = await getDocs(projectsQuery);
      const projectsData: Project[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        projectsData.push({
          id: doc.id,
          name: data.name || '',
          category: data.category || '',
          status: data.status ?? false,
          description: data.description || '',
          livePreview: data.livePreview || '',
          github: data.github || '',
          technologies: Array.isArray(data.technologies) ? data.technologies : [],
          keyFeature: data.keyFeature || '',
          inspiredBy: Array.isArray(data.inspiredBy) ? data.inspiredBy : [],
          media: data.media,
          rotation: data.rotation,
          createdBy: data.createdBy,
          updatedBy: data.updatedBy,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : undefined,
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : undefined,
        });
      });

      saveToCache(projectsData);

      if (isMountedRef.current) {
        setState({
          projects: projectsData,
          loading: false,
          error: null,
        });
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      
      const cachedProjects = loadFromCache();
      
      if (isMountedRef.current) {
        if (cachedProjects) {
          setState({
            projects: cachedProjects,
            loading: false,
            error: 'Using cached data due to fetch error',
          });
        } else {
          setState({
            projects: [],
            loading: false,
            error: err instanceof Error ? err.message : 'Failed to fetch projects',
          });
        }
      }
    }
  };

  useEffect(() => {
    let cancelled = false;
    isMountedRef.current = true;

    const initializeProjects = async () => {
      try {
        // Try to load from cache first
        const cachedProjects = loadFromCache();
        if (cachedProjects && !cancelled) {
          setState({
            projects: cachedProjects,
            loading: false,
            error: null,
          });
          return;
        }

        // Fetch from Firestore
        if (!cancelled) {
          setState(prev => ({ ...prev, loading: true, error: null }));
        }

        const projectsQuery = query(
          collection(db, 'projects'),
          orderBy('createdAt', 'desc')
        );

        const snapshot: QuerySnapshot<DocumentData> = await getDocs(projectsQuery);
        const projectsData: Project[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          projectsData.push({
            id: doc.id,
            name: data.name || '',
            category: data.category || '',
            status: data.status ?? false,
            description: data.description || '',
            livePreview: data.livePreview || '',
            github: data.github || '',
            technologies: Array.isArray(data.technologies) ? data.technologies : [],
            keyFeature: data.keyFeature || '',
            inspiredBy: Array.isArray(data.inspiredBy) ? data.inspiredBy : [],
            media: data.media,
            rotation: data.rotation,
            createdBy: data.createdBy,
            updatedBy: data.updatedBy,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : undefined,
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : undefined,
          });
        });

        saveToCache(projectsData);

        if (!cancelled) {
          setState({
            projects: projectsData,
            loading: false,
            error: null,
          });
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        
        const cachedProjects = loadFromCache();
        
        if (!cancelled) {
          if (cachedProjects) {
            setState({
              projects: cachedProjects,
              loading: false,
              error: 'Using cached data due to fetch error',
            });
          } else {
            setState({
              projects: [],
              loading: false,
              error: err instanceof Error ? err.message : 'Failed to fetch projects',
            });
          }
        }
      }
    };

    initializeProjects();

    return () => {
      cancelled = true;
      isMountedRef.current = false;
    };
  }, []);

  return {
    projects: state.projects,
    loading: state.loading,
    error: state.error,
    refreshProjects,
    getProject,
  };
}