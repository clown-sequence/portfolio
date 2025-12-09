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
import type { CreateProjectData, Project, UpdateProjectData } from '@/types';

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

interface ProjectManagerState {
  projects: Project[];
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

export function useAuthenticatedProjectManager() {
  const [state, setState] = useState<ProjectManagerState>({
    projects: [],
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

  // Real-time listener for projects (no auth required for reading)
  useEffect(() => {
    console.log('🔄 Setting up real-time listener for projects...');
    
    const projectsQuery = query(
      collection(db, 'projects'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      projectsQuery,
      (snapshot) => {
        console.log('📊 Snapshot received, documents count:', snapshot.size);
        const projectsData: Project[] = [];
        
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          
          projectsData.push({
            id: docSnap.id, // Firebase document ID (string)
            name: data.name || '',
            category: data.category || '',
            status: data.status ?? false,
            description: data.description || '',
            livePreview: data.livePreview || '',
            github: data.github || '',
            technologies: Array.isArray(data.technologies) ? data.technologies : [],
            keyFeature: data.keyFeature || '',
            inspiredBy: Array.isArray(data.inspiredBy) ? data.inspiredBy : [],
            media: data.media || undefined,
            rotation: data.rotation || undefined,
            createdBy: data.createdBy || undefined,
            updatedBy: data.updatedBy || undefined,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : undefined,
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : undefined,
          });
        });
        
        console.log('✅ Projects loaded:', projectsData.length);
        setState(prev => ({
          ...prev,
          projects: projectsData,
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
      console.log('🛑 Cleaning up projects listener');
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

  const createProject = async (projectData: CreateProjectData): Promise<string> => {
    try {
      console.log('🚀 Creating project with data:', projectData);
      
      // Check auth and online status
      validateOperation('create');
      
      // Check rate limit
      checkRateLimit('create');
      
      setState(prev => ({ ...prev, error: null }));
      
      // Validate required fields
      if (!projectData.name || projectData.name.trim() === '') {
        throw new Error('Name is required');
      }
      
      if (!projectData.description || projectData.description.trim() === '') {
        throw new Error('Description is required');
      }

      if (!projectData.category || projectData.category.trim() === '') {
        throw new Error('Category is required');
      }

      // Validate media if provided
      if (projectData.media) {
        if (!projectData.media.type || !['image', 'video'].includes(projectData.media.type)) {
          throw new Error('Media type must be "image" or "video"');
        }
        if (!projectData.media.src || projectData.media.src.trim() === '') {
          throw new Error('Media source is required');
        }
      }

      const docData = {
        name: projectData.name.trim(),
        category: projectData.category.trim(),
        status: projectData.status ?? false,
        description: projectData.description.trim(),
        livePreview: projectData.livePreview?.trim() || '',
        github: projectData.github?.trim() || '',
        technologies: projectData.technologies || [],
        keyFeature: projectData.keyFeature?.trim() || '',
        inspiredBy: projectData.inspiredBy || [],
        media: projectData.media || null,
        rotation: projectData.rotation ?? null,
        createdBy: state.user!.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      console.log('📝 Document data to be created:', docData);
      
      const docRef = await addDoc(collection(db, 'projects'), docData);
      
      console.log('✅ Project created successfully with ID:', docRef.id);
      return docRef.id;
    } catch (err) {
      console.error('❌ Error creating project:', err);
      
      const error = err as FirestoreError;
      let errorMessage = 'Failed to create project';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. You do not have access to create projects.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Firebase is unavailable. Check your internet connection.';
      } else if (error.code === 'unauthenticated') {
        errorMessage = 'Authentication required. Please sign in to create projects.';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setState(prev => ({ ...prev, error: errorMessage }));
      throw new Error(errorMessage);
    }
  };

  const updateProject = async (projectId: string, projectData: UpdateProjectData): Promise<void> => {
    try {
      console.log('📝 Updating project:', projectId, projectData);
      
      // Check auth and online status
      validateOperation('update');
      
      // Check rate limit
      checkRateLimit('update');
      
      setState(prev => ({ ...prev, error: null }));
      
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      // Validate data
      if (projectData.name !== undefined && projectData.name.trim() === '') {
        throw new Error('Name cannot be empty');
      }

      if (projectData.description !== undefined && projectData.description.trim() === '') {
        throw new Error('Description cannot be empty');
      }

      if (projectData.category !== undefined && projectData.category.trim() === '') {
        throw new Error('Category cannot be empty');
      }

      // Validate media if provided
      if (projectData.media) {
        if (!['image', 'video'].includes(projectData.media.type)) {
          throw new Error('Media type must be "image" or "video"');
        }
        if (!projectData.media.src || projectData.media.src.trim() === '') {
          throw new Error('Media source is required');
        }
      }
      
      const projectRef = doc(db, 'projects', projectId);
      
      // Only include defined fields in the update
      const updateData: Record<string, unknown> = {
        updatedAt: serverTimestamp(),
        updatedBy: state.user!.uid,
      };

      if (projectData.name !== undefined) updateData.name = projectData.name.trim();
      if (projectData.category !== undefined) updateData.category = projectData.category.trim();
      if (projectData.status !== undefined) updateData.status = projectData.status;
      if (projectData.description !== undefined) updateData.description = projectData.description.trim();
      if (projectData.livePreview !== undefined) updateData.livePreview = projectData.livePreview.trim();
      if (projectData.github !== undefined) updateData.github = projectData.github.trim();
      if (projectData.technologies !== undefined) updateData.technologies = projectData.technologies;
      if (projectData.keyFeature !== undefined) updateData.keyFeature = projectData.keyFeature.trim();
      if (projectData.inspiredBy !== undefined) updateData.inspiredBy = projectData.inspiredBy;
      if (projectData.media !== undefined) updateData.media = projectData.media;
      if (projectData.rotation !== undefined) updateData.rotation = projectData.rotation;
      
      await updateDoc(projectRef, updateData);
      console.log('✅ Project updated successfully');
    } catch (err) {
      console.error('❌ Error updating project:', err);
      
      const error = err as FirestoreError;
      let errorMessage = 'Failed to update project';
      
      if (error.code === 'not-found') {
        errorMessage = 'Project not found';
      } else if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. You do not have access to update this project.';
      } else if (error.code === 'unauthenticated') {
        errorMessage = 'Authentication required. Please sign in to update projects.';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setState(prev => ({ ...prev, error: errorMessage }));
      throw new Error(errorMessage);
    }
  };

  const deleteProject = async (projectId: string): Promise<void> => {
    try {
      console.log('🗑️ Deleting project:', projectId);
      
      // Check auth and online status
      validateOperation('delete');
      
      // Check rate limit
      checkRateLimit('delete');
      
      setState(prev => ({ ...prev, error: null }));
      
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      
      await deleteDoc(doc(db, 'projects', projectId));
      console.log('✅ Project deleted successfully');
    } catch (err) {
      console.error('❌ Error deleting project:', err);
      
      const error = err as FirestoreError;
      let errorMessage = 'Failed to delete project';
      
      if (error.code === 'not-found') {
        errorMessage = 'Project not found';
      } else if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. You do not have access to delete this project.';
      } else if (error.code === 'unauthenticated') {
        errorMessage = 'Authentication required. Please sign in to delete projects.';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setState(prev => ({ ...prev, error: errorMessage }));
      throw new Error(errorMessage);
    }
  };

  return {
    // Data
    projects: state.projects,
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
    createProject,
    updateProject,
    deleteProject,
  };
}