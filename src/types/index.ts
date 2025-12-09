// ============================================================================
// Base Types
// ============================================================================

import type { User } from "firebase/auth";

export type TabType = 'projects' | 'about' | 'testimonials' | 'connect';
export type FormMode = 'view' | 'edit' | 'create';

// ============================================================================
// Authentication Types
// ============================================================================

/**
 * Authentication error with user-friendly messages
 */
export interface AuthErrorResponse {
  code: string;
  message: string;
}

/**
 * Sign in credentials
 */
export interface SignInCredentials {
  email: string;
  password: string;
}

/**
 * Sign up credentials with optional display name
 */
export interface SignUpCredentials extends SignInCredentials {
  displayName?: string;
}

/**
 * Auth context state and methods
 */
export interface AuthContextType {
  // State
  user: User | null;
  loading: boolean;
  error: AuthErrorResponse | null;
  
  // Methods
  signIn: (credentials: SignInCredentials) => Promise<Credential>;
  signUp: (credentials: SignUpCredentials) => Promise<Credential>;
  logout: () => Promise<void>;
  clearError: () => void;
  
  // Helper methods
  isAuthenticated: boolean;
  getUserId: () => string | null;
  getUserEmail: () => string | null;
}

// ============================================================================
// Project Types
// ============================================================================

export interface ProjectMedia {
  type: 'image' | 'video';
  src: string;
  alt?: string;
}

export interface BaseProject {
  name: string;
  category: string;
  status?: boolean;
  description: string;
  livePreview: string;
  github: string;
  technologies: string[];
  keyFeature: string;
  inspiredBy: string[];
  media?: ProjectMedia;
  rotation?: number;
}

export interface Project extends BaseProject {
  id: string;
  status: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CreateProjectData = BaseProject;

export interface UpdateProjectData extends Partial<BaseProject> {
  id: string;
}

export interface Technology {
  id: string;
  name: string;
  category?: 'frontend' | 'backend' | 'database' | 'devops' | 'tools';
  icon?: string;
}

export interface ProjectMetrics {
  users?: number;
  performance?: string;
  impact?: string;
  [key: string]: string | number | undefined;
}

// ============================================================================
// About Me Types
// ============================================================================

export interface Skill {
  id: string;
  name: string;
  level?: number;
}

export interface SkillCategory {
  id: string;
  title: string;
  skills: Skill[];
}

export interface BaseAboutMe {
  name: string;
  title: string;
  bio: string;
  location: string;
  userImg: string;
  resume: string;
  skillCategories: SkillCategory[];
}

export interface AboutMe extends BaseAboutMe {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

export type CreateAboutMeData = BaseAboutMe;

export interface UpdateAboutMeData extends Partial<BaseAboutMe> {
  id: string;
}

export interface ContactData {
  availableHours: {
    weekdays: string;
    weekends: string;
  };
  hotline: {
    phone: string;
    location: string;
  };
  socialLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
  };
}
// ============================================================================
// Testimonial Types
// ============================================================================

export interface BaseTestimonial {
  clientName: string;
  company: string;
  role: string;
  project: string;
  message: string;
  rating: number;
  approved?: boolean;
  image?: string;
  createdAt?: Date | string;
  
  // UI compatibility fields
  name?: string;
  avatar?: string;
  content?: string;
  date?: string;
  verified?: boolean;
  featured?: boolean;
  relationship?: 'client' | 'colleague' | 'manager' | 'mentor' | 'other';
  updatedAt?: string;
}

export interface Testimonial extends BaseTestimonial {
  id: string;
  approved: boolean;
  createdAt: Date | string;
}

export type CreateTestimonialData = BaseTestimonial;

export interface UpdateTestimonialData extends Partial<BaseTestimonial> {
  id: string;
}

// ============================================================================
// UI Component Types
// ============================================================================

export interface BentoGridItem {
  className?: string;
  title: string;
  description: string;
  header: React.ReactNode;
  content?: React.ReactNode;
  icon?: React.ReactNode;
}

export interface PortfolioItem {
  title: string;
  description: string;
  header: React.ReactNode;
  className: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export interface Tab {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
}

export interface DeleteConfirmation {
  type: 'projects' | 'testimonials' | 'about';
  id: string;
}

// ============================================================================
// Event Handler Types
// ============================================================================

export type KeyboardEventHandler = (event: KeyboardEvent) => void;
export type MouseEventHandler = (e: React.MouseEvent<HTMLDivElement>) => void;
export type MediaQueryChangeHandler = (e: MediaQueryListEvent) => void;

// ============================================================================
// Form Types
// ============================================================================

export interface ProjectFormData extends BaseProject {
  id?: string;
}

export interface AboutMeFormData extends BaseAboutMe {
  id?: string;
}

export interface TestimonialFormData extends BaseTestimonial {
  id?: string;
}

// ============================================================================
// Component Props Types (REMOVED empty interfaces)
// ============================================================================

export interface BaseTabProps {
  mode: FormMode;
  setMode: React.Dispatch<React.SetStateAction<FormMode>>;
}

export interface ProjectsTabProps extends BaseTabProps {
  onProjectSelect?: (project: Project) => void;
  projects?: Project[];
  onCreateProject?: (data: CreateProjectData) => Promise<void>;
  onUpdateProject?: (data: UpdateProjectData) => Promise<void>;
  onDeleteProject?: (id: string) => Promise<void>;
}

export interface AboutMeTabProps extends BaseTabProps {
  aboutMe?: AboutMe;
  onUpdateAboutMe?: (data: UpdateAboutMeData) => Promise<void>;
}

export interface TestimonialsTabProps extends BaseTabProps {
  onTestimonialSelect?: (testimonial: Testimonial) => void;
  testimonials?: Testimonial[];
  onCreateTestimonial?: (data: CreateTestimonialData) => Promise<void>;
  onUpdateTestimonial?: (data: UpdateTestimonialData) => Promise<void>;
  onDeleteTestimonial?: (id: string) => Promise<void>;
}

// ============================================================================
// State Management Types
// ============================================================================

export interface AdminDashboardState {
  activeTab: TabType;
  isDarkMode: boolean;
  projectMode: FormMode;
  aboutMeMode: FormMode;
  testimonialMode: FormMode;
  selectedProject: Project | null;
  selectedTestimonial: Testimonial | null;
  selectedAboutMe: AboutMe | null;
  showDeleteConfirm: DeleteConfirmation | null;
  projects: Project[];
  testimonials: Testimonial[];
  aboutMe: AboutMe | null;
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// API & Validation Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  status?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  totalPages: number;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: ValidationError[];
}

// ============================================================================
// Action Types (for useReducer)
// ============================================================================

export type AdminAction =
  | { type: 'SET_ACTIVE_TAB'; payload: TabType }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_DARK_MODE'; payload: boolean }
  | { type: 'SET_PROJECT_MODE'; payload: FormMode }
  | { type: 'SET_SELECTED_PROJECT'; payload: Project | null }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'SET_TESTIMONIAL_MODE'; payload: FormMode }
  | { type: 'SET_SELECTED_TESTIMONIAL'; payload: Testimonial | null }
  | { type: 'SET_TESTIMONIALS'; payload: Testimonial[] }
  | { type: 'ADD_TESTIMONIAL'; payload: Testimonial }
  | { type: 'UPDATE_TESTIMONIAL'; payload: Testimonial }
  | { type: 'DELETE_TESTIMONIAL'; payload: string }
  | { type: 'SET_ABOUT_ME_MODE'; payload: FormMode }
  | { type: 'SET_ABOUT_ME'; payload: AboutMe | null }
  | { type: 'SHOW_DELETE_CONFIRM'; payload: DeleteConfirmation | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

// ============================================================================
// Utility Types
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// ============================================================================
// Type Guards
// ============================================================================

export const isProject = (item: unknown): item is Project => {
  return (
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    typeof (item as Project).id === 'string' &&
    'name' in item &&
    typeof (item as Project).name === 'string' &&
    'description' in item &&
    typeof (item as Project).description === 'string'
  );
};

export const isTestimonial = (item: unknown): item is Testimonial => {
  return (
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    typeof (item as Testimonial).id === 'string' &&
    'clientName' in item &&
    typeof (item as Testimonial).clientName === 'string' &&
    'message' in item &&
    typeof (item as Testimonial).message === 'string'
  );
};

export const isAboutMe = (item: unknown): item is AboutMe => {
  return (
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    typeof (item as AboutMe).id === 'string' &&
    'name' in item &&
    typeof (item as AboutMe).name === 'string' &&
    'bio' in item &&
    typeof (item as AboutMe).bio === 'string'
  );
};

export const isValidTabType = (value: string): value is TabType => {
  return ['projects', 'about', 'testimonials', 'connect'].includes(value);
};

export const isValidFormMode = (value: string): value is FormMode => {
  return ['view', 'edit', 'create'].includes(value);
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Converts form data to update data
 */
export const toUpdateProjectData = (formData: ProjectFormData): UpdateProjectData | null => {
  if (!formData.id) return null;
  
  return {
    id: formData.id,
    name: formData.name,
    category: formData.category,
    status: formData.status,
    description: formData.description,
    livePreview: formData.livePreview,
    github: formData.github,
    technologies: formData.technologies,
    keyFeature: formData.keyFeature,
    inspiredBy: formData.inspiredBy,
    media: formData.media,
    rotation: formData.rotation,
  };
};

/**
 * Converts form data to create data
 */
export const toCreateProjectData = (formData: ProjectFormData): CreateProjectData => {
  const { ...createData } = formData;
  return createData;
};

export const toUpdateAboutMeData = (formData: AboutMeFormData): UpdateAboutMeData | null => {
  if (!formData.id) return null;
  
  const { id, ...updateData } = formData;
  return { id, ...updateData };
};

export const toUpdateTestimonialData = (formData: TestimonialFormData): UpdateTestimonialData | null => {
  if (!formData.id) return null;
  
  const { id, ...updateData } = formData;
  return { id, ...updateData };
};

/**
 * Type-safe way to check if an object has a property
 */
export function hasProperty<T extends object, K extends PropertyKey>(
  obj: T,
  key: K
): obj is T & Record<K, unknown> {
  return key in obj;
}

/**
 * Type-safe way to get a property value
 */
export function getProperty<T extends object, K extends keyof T>(
  obj: T,
  key: K
): T[K] {
  return obj[key];
}