import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Save, AlertCircle, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useAuthenticatedProjectManager } from '@/hooks/use-authenticated-project-manager';
import type { Project } from '@/types';

interface ProjectsTabProps {
  mode: 'view' | 'create' | 'edit';
  setMode: (mode: 'view' | 'create' | 'edit') => void;
}

export const ProjectsTab: React.FC<ProjectsTabProps> = ({ mode, setMode }) => {
  const {
    projects,
    loading,
    error,
    user,
    isAuthenticated,
    isOnline,
    authChecking,
    rateLimitInfo,
    createProject,
    updateProject,
    deleteProject,
  } = useAuthenticatedProjectManager();

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    category: '',
    status: false,
    description: '',
    livePreview: '',
    github: '',
    technologies: [],
    keyFeature: '',
    inspiredBy: [],
    media: undefined,
    rotation: undefined,
  });
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Temporary input states for arrays
  const [techInput, setTechInput] = useState<string>('');
  const [inspiredByInput, setInspiredByInput] = useState<string>('');

  const resetForm = (): void => {
    setFormData({
      name: '',
      category: '',
      status: false,
      description: '',
      livePreview: '',
      github: '',
      technologies: [],
      keyFeature: '',
      inspiredBy: [],
      media: undefined,
      rotation: undefined,
    });
    setTechInput('');
    setInspiredByInput('');
    setSelectedProject(null);
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleCreate = async (): Promise<void> => {
    if (!isFormValid()) return;

    try {
      setSaving(true);
      await createProject({
        name: formData.name!,
        category: formData.category!,
        status: formData.status ?? false,
        description: formData.description!,
        livePreview: formData.livePreview || '',
        github: formData.github || '',
        technologies: formData.technologies || [],
        keyFeature: formData.keyFeature || '',
        inspiredBy: formData.inspiredBy || [],
        media: formData.media,
        rotation: formData.rotation,
      });
      showSuccess('Project created successfully!');
      resetForm();
      setMode('view');
    } catch (err) {
      console.error('Failed to create project:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (): Promise<void> => {
    if (!selectedProject || !isFormValid()) return;

    try {
      setSaving(true);
      await updateProject(selectedProject.id, {
        id: selectedProject.id,
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
      });
      showSuccess('Project updated successfully!');
      resetForm();
      setMode('view');
    } catch (err) {
      console.error('Failed to update project:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await deleteProject(id);
      showSuccess('Project deleted successfully!');
      if (selectedProject?.id === id) {
        resetForm();
        setMode('view');
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  const startEdit = (project: Project): void => {
    setSelectedProject(project);
    setFormData({
      id: project.id,
      name: project.name,
      category: project.category,
      status: project.status,
      description: project.description,
      livePreview: project.livePreview,
      github: project.github,
      technologies: project.technologies,
      keyFeature: project.keyFeature,
      inspiredBy: project.inspiredBy,
      media: project.media,
      rotation: project.rotation,
    });
    setMode('edit');
  };

  const addTechnology = (): void => {
    if (techInput.trim()) {
      setFormData({
        ...formData,
        technologies: [...(formData.technologies || []), techInput.trim()],
      });
      setTechInput('');
    }
  };

  const removeTechnology = (index: number): void => {
    setFormData({
      ...formData,
      technologies: (formData.technologies || []).filter((_, i) => i !== index),
    });
  };

  const addInspiredBy = (): void => {
    if (inspiredByInput.trim()) {
      setFormData({
        ...formData,
        inspiredBy: [...(formData.inspiredBy || []), inspiredByInput.trim()],
      });
      setInspiredByInput('');
    }
  };

  const removeInspiredBy = (index: number): void => {
    setFormData({
      ...formData,
      inspiredBy: (formData.inspiredBy || []).filter((_, i) => i !== index),
    });
  };

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>,
    action: () => void
  ): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  const isFormValid = (): boolean => {
    return !!(
      formData.name &&
      formData.description &&
      formData.category
    );
  };

  // Show loading state
  if (loading || authChecking) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {authChecking ? 'Checking authentication...' : 'Loading projects...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {/* Status Bar */}
      <div className="flex items-center justify-between bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 p-4">
        <div className="flex items-center gap-4">
          {/* Online Status */}
          <div className="flex items-center gap-2">
            {isOnline ? (
              <>
                <Wifi className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Offline</span>
              </>
            )}
          </div>

          {/* Auth Status */}
          <div className="flex items-center gap-2 pl-4 border-l border-gray-200 dark:border-neutral-700">
            {isAuthenticated ? (
              <>
                <div className="h-2 w-2 rounded-full bg-green-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Signed in as {user?.email || 'User'}
                </span>
              </>
            ) : (
              <>
                <div className="h-2 w-2 rounded-full bg-red-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Not signed in</span>
              </>
            )}
          </div>

          {/* Rate Limit Info */}
          {isAuthenticated && (
            <div className="flex items-center gap-2 pl-4 border-l border-gray-200 dark:border-neutral-700">
              <span className="text-xs text-gray-500 dark:text-gray-500">
                Rate limits: C:{rateLimitInfo.create.count}/5 | U:{rateLimitInfo.update.count}/10 | D:{rateLimitInfo.delete.count}/3
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-900 dark:text-red-200">Error</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 rounded-full bg-green-600 flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">{successMessage}</p>
          </div>
        </motion.div>
      )}

      {/* Auth Warning */}
      {!isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-200">
                Authentication Required
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Please sign in to create, update, or delete projects. You can still view projects while signed out.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Projects ({projects.length})
              </h2>
              <button
                onClick={() => {
                  resetForm();
                  setMode('create');
                }}
                disabled={!isAuthenticated}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={!isAuthenticated ? 'Sign in to create projects' : 'Create new project'}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              {projects.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">
                  No projects yet. {isAuthenticated ? 'Create your first project!' : 'Sign in to create projects.'}
                </p>
              ) : (
                projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-3 border border-gray-200 dark:border-neutral-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">
                            {project.name}
                          </h3>
                          {project.status && (
                            <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs font-semibold text-green-800 dark:text-green-300">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                          {project.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                            {project.category}
                          </span>
                          {project.technologies.slice(0, 2).map((tech, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.technologies.length > 2 && (
                            <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 rounded">
                              +{project.technologies.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => startEdit(project)}
                          disabled={!isAuthenticated}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={!isAuthenticated ? 'Sign in to edit' : 'Edit project'}
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          disabled={!isAuthenticated}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={!isAuthenticated ? 'Sign in to delete' : 'Delete project'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          {mode === 'view' ? (
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 p-8 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Project Selected
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {isAuthenticated
                    ? 'Select a project to edit or create a new one'
                    : 'Sign in to manage projects'}
                </p>
                <button
                  onClick={() => {
                    resetForm();
                    setMode('create');
                  }}
                  disabled={!isAuthenticated}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create New Project
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {mode === 'create' ? 'Create New Project' : 'Edit Project'}
                </h2>
                <button
                  onClick={() => {
                    resetForm();
                    setMode('view');
                  }}
                  className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., AI Dashboard"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Category *
                  </label>
                  <input
                    type="text"
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Web Development"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Description *
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of your project..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  />
                </div>

                {/* Status Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-800/50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Project Status
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {formData.status ? 'Completed' : 'In Progress'}
                    </p>
                  </div>
                  <button
                    onClick={() => setFormData({ ...formData, status: !formData.status })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.status ? 'bg-green-600' : 'bg-gray-300 dark:bg-neutral-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.status ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Live Preview URL
                    </label>
                    <input
                      type="url"
                      value={formData.livePreview || ''}
                      onChange={(e) => setFormData({ ...formData, livePreview: e.target.value })}
                      placeholder="https://example.com"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      GitHub URL
                    </label>
                    <input
                      type="url"
                      value={formData.github || ''}
                      onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                      placeholder="https://github.com/..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Technologies */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Technologies ({(formData.technologies || []).length})
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, addTechnology)}
                      placeholder="e.g., React"
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <button
                      onClick={addTechnology}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(formData.technologies || []).map((tech, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                      >
                        {tech}
                        <button
                          onClick={() => removeTechnology(idx)}
                          className="text-blue-500 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Key Feature */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Key Feature
                  </label>
                  <input
                    type="text"
                    value={formData.keyFeature || ''}
                    onChange={(e) => setFormData({ ...formData, keyFeature: e.target.value })}
                    placeholder="Main feature of the project"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Inspired By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Inspired By ({(formData.inspiredBy || []).length})
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={inspiredByInput}
                      onChange={(e) => setInspiredByInput(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, addInspiredBy)}
                      placeholder="e.g., Dribbble Design"
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <button
                      onClick={addInspiredBy}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(formData.inspiredBy || []).map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                      >
                        {item}
                        <button
                          onClick={() => removeInspiredBy(idx)}
                          className="text-purple-500 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                {/* Media */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Media (Optional)
                  </label>
                  <div className="space-y-2">
                    <select
                      value={formData.media?.type || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          media: e.target.value
                            ? { type: e.target.value as 'image' | 'video', src: formData.media?.src || '' }
                            : undefined,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="">No media</option>
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>
                    {formData.media?.type && (
                      <input
                        type="url"
                        value={formData.media.src || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            media: { ...formData.media!, src: e.target.value },
                          })
                        }
                        placeholder="Media URL"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    )}
                  </div>
                </div>

                {/* Rotation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Rotation (degrees, optional)
                  </label>
                  <input
                    type="number"
                    value={formData.rotation ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rotation: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    placeholder="e.g., 45"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-neutral-800">
                <button
                  onClick={() => {
                    resetForm();
                    setMode('view');
                  }}
                  disabled={saving}
                  className="px-4 py-2 border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={mode === 'create' ? handleCreate : handleUpdate}
                  disabled={!isFormValid() || saving || !isAuthenticated}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {mode === 'create' ? 'Create' : 'Save'}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};