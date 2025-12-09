import { useAuthenticatedAboutMeManager } from "@/hooks/use-authenticated-about-me-manager ";
import type { AboutMe } from "@/types";
import { AlertCircle, Edit2, Loader2, Plus, Save, Trash2, Wifi, WifiOff, X } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "motion/react";

interface Skill {
  id: string;
  name: string;
}

interface SkillCategory {
  id: string;
  title: string;
  skills: Skill[];
}

interface Interest {
  icon: string;
  title: string;
  desc: string;
}

interface SocialLink {
  label: string;
  link: string;
  color: string;
}

interface AboutMeTabProps {
  mode: 'view' | 'edit' | 'create';
  setMode: (mode: 'view' | 'edit' | 'create') => void;
}

export const AboutMeTab: React.FC<AboutMeTabProps> = ({ mode, setMode }) => {
  const {
    aboutMe,
    loading,
    error,
    user,
    isAuthenticated,
    isOnline,
    authChecking,
    rateLimitInfo,
    createAboutMe,
    updateAboutMe,
    deleteAboutMe,
  } = useAuthenticatedAboutMeManager();

  const [formData, setFormData] = useState<Partial<AboutMe & { interests: Interest[]; socialLinks: SocialLink[] }>>({
    name: '',
    title: '',
    bio: '',
    location: '',
    userImg: '',
    resume: '',
    skillCategories: [],
    interests: [],
    socialLinks: [],
  });
  
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [newSkillCategoryTitle, setNewSkillCategoryTitle] = useState<string>('');
  const [newSkillInputs, setNewSkillInputs] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (aboutMe) {
      setFormData({
        name: aboutMe.name,
        title: aboutMe.title,
        bio: aboutMe.bio,
        location: aboutMe.location,
        userImg: aboutMe.userImg,
        resume: aboutMe.resume,
        skillCategories: aboutMe.skillCategories,
        interests: [],
        socialLinks: [],
      });
    }
  }, [aboutMe]);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSave = async (): Promise<void> => {
    if (!isFormValid()) return;

    try {
      setSaving(true);
      
      if (aboutMe) {
        // Update existing
        await updateAboutMe(aboutMe.id, {
          id: aboutMe.id,
          name: formData.name,
          title: formData.title,
          bio: formData.bio,
          location: formData.location,
          userImg: formData.userImg,
          resume: formData.resume,
          skillCategories: formData.skillCategories,
        });
        showSuccess('About me updated successfully!');
      } else {
        // Create new
        await createAboutMe({
          name: formData.name!,
          title: formData.title!,
          bio: formData.bio!,
          location: formData.location!,
          userImg: formData.userImg || '',
          resume: formData.resume || '',
          skillCategories: formData.skillCategories || [],
        });
        showSuccess('About me created successfully!');
      }
      
      setMode('view');
    } catch (err) {
      console.error('Failed to save about me:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = (): void => {
    if (aboutMe) {
      setFormData({
        name: aboutMe.name,
        title: aboutMe.title,
        bio: aboutMe.bio,
        location: aboutMe.location,
        userImg: aboutMe.userImg,
        resume: aboutMe.resume,
        skillCategories: aboutMe.skillCategories,
        interests: [],
        socialLinks: [],
      });
    }
    setMode('view');
  };

  // Skill Categories Management
  const addSkillCategory = (): void => {
    if (newSkillCategoryTitle.trim()) {
      const newCategory: SkillCategory = {
        id: Date.now().toString(),
        title: newSkillCategoryTitle.trim().toUpperCase(),
        skills: []
      };
      setFormData({
        ...formData,
        skillCategories: [...(formData.skillCategories || []), newCategory]
      });
      setNewSkillCategoryTitle('');
    }
  };

  const removeSkillCategory = (categoryId: string): void => {
    setFormData({
      ...formData,
      skillCategories: (formData.skillCategories || []).filter((cat: SkillCategory) => cat.id !== categoryId)
    });
  };

  const addSkill = (categoryId: string): void => {
    const skillName = newSkillInputs[categoryId];
    if (skillName?.trim()) {
      setFormData({
        ...formData,
        skillCategories: (formData.skillCategories || []).map((cat: SkillCategory) => 
          cat.id === categoryId
            ? {
                ...cat,
                skills: [...cat.skills, { id: Date.now().toString(), name: skillName.trim() }]
              }
            : cat
        )
      });
      setNewSkillInputs({ ...newSkillInputs, [categoryId]: '' });
    }
  };

  const removeSkill = (categoryId: string, skillId: string): void => {
    setFormData({
      ...formData,
      skillCategories: (formData.skillCategories || []).map((cat: SkillCategory) =>
        cat.id === categoryId
          ? { ...cat, skills: cat.skills.filter((skill: Skill) => skill.id !== skillId) }
          : cat
      )
    });
  };

  // Interests Management
  const addInterest = (): void => {
    const newInterest: Interest = {
      icon: '⭐',
      title: 'New Interest',
      desc: 'Description here'
    };
    setFormData({
      ...formData,
      interests: [...(formData.interests || []), newInterest]
    });
  };

  const updateInterest = (index: number, field: keyof Interest, value: string): void => {
    const updatedInterests = [...(formData.interests || [])];
    updatedInterests[index] = { ...updatedInterests[index], [field]: value };
    setFormData({ ...formData, interests: updatedInterests });
  };

  const removeInterest = (index: number): void => {
    setFormData({
      ...formData,
      interests: (formData.interests || []).filter((_: Interest, i: number) => i !== index)
    });
  };

  // Social Links Management
  const addSocialLink = (): void => {
    const newLink: SocialLink = {
      label: 'New Platform',
      link: '#',
      color: 'from-gray-600 to-gray-700'
    };
    setFormData({
      ...formData,
      socialLinks: [...(formData.socialLinks || []), newLink]
    });
  };

  const updateSocialLink = (index: number, field: keyof SocialLink, value: string): void => {
    const updatedLinks = [...(formData.socialLinks || [])];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setFormData({ ...formData, socialLinks: updatedLinks });
  };

  const removeSocialLink = (index: number): void => {
    setFormData({
      ...formData,
      socialLinks: (formData.socialLinks || []).filter((_: SocialLink, i: number) => i !== index)
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, action: () => void): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  const isFormValid = (): boolean => {
    return !!(
      formData.name &&
      formData.title &&
      formData.bio &&
      formData.location
    );
  };

  const handleDelete = async (): Promise<void> => {
    if (!aboutMe || !window.confirm('Are you sure you want to delete your about me profile? This action cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      await deleteAboutMe(aboutMe.id);
      showSuccess('About me profile deleted successfully!');
      setMode('view');
    } catch (err) {
      console.error('Failed to delete about me:', err);
    } finally {
      setSaving(false);
    }
  };

  // Show loading state
  if (loading || authChecking) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {authChecking ? 'Checking authentication...' : 'Loading about me...'}
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
      className="max-w-5xl mx-auto space-y-4"
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
                Please sign in to create or update your about me profile. You can still view the profile while signed out.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            About Me Information
          </h2>
          {mode === 'view' ? (
            <button
              onClick={() => setMode('edit')}
              disabled={!isAuthenticated}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={!isAuthenticated ? 'Sign in to edit' : 'Edit profile'}
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !isFormValid() || !isAuthenticated}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              {aboutMe && (
                <button
                  onClick={handleDelete}
                  disabled={saving || !isAuthenticated}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              )}
            </div>
          )}
        </div>

        {mode === 'view' ? (
          <div className="space-y-6">
            {!aboutMe ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Profile Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {isAuthenticated
                    ? 'Create your about me profile to get started'
                    : 'Sign in to create your profile'}
                </p>
                {isAuthenticated && (
                  <button
                    onClick={() => setMode('edit')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Create Profile
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                    <p className="text-gray-900 dark:text-white mt-1 text-lg">{aboutMe.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</label>
                    <p className="text-gray-900 dark:text-white mt-1">{aboutMe.title}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Bio</label>
                    <p className="text-gray-900 dark:text-white mt-1">{aboutMe.bio}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</label>
                    <p className="text-gray-900 dark:text-white mt-1">{aboutMe.location}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Joined Date</label>
                    <p className="text-gray-900 dark:text-white mt-1">
                      {aboutMe.createdAt ? new Date(aboutMe.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Skills Summary */}
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 block">
                    Skill Categories ({aboutMe.skillCategories.length})
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {aboutMe.skillCategories.map((category: SkillCategory) => (
                      <div key={category.id} className="p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                          {category.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {category.skills.length} skills
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setFormData({...formData, name: e.target.value})
                    }
                    placeholder="Your name"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Professional Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setFormData({...formData, title: e.target.value})
                    }
                    placeholder="e.g., Full Stack Developer"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Bio *
                </label>
                <textarea
                  value={formData.bio || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                    setFormData({...formData, bio: e.target.value})
                  }
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setFormData({...formData, location: e.target.value})
                    }
                    placeholder="e.g., Lagos, Nigeria"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Profile Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.userImg || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setFormData({...formData, userImg: e.target.value})
                    }
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Resume URL
                </label>
                <input
                  type="url"
                  value={formData.resume || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setFormData({...formData, resume: e.target.value})
                  }
                  placeholder="https://example.com/resume.pdf"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Skill Categories */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Skill Categories ({(formData.skillCategories || []).length})
                </h3>
              </div>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newSkillCategoryTitle}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setNewSkillCategoryTitle(e.target.value)
                  }
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => 
                    handleKeyPress(e, addSkillCategory)
                  }
                  placeholder="New category name (e.g., FRONT-END)"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <button
                  onClick={addSkillCategory}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                {(formData.skillCategories || []).map((category: SkillCategory) => (
                  <div key={category.id} className="p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {category.title}
                      </h4>
                      <button
                        onClick={() => removeSkillCategory(category.id)}
                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newSkillInputs[category.id] || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setNewSkillInputs({ ...newSkillInputs, [category.id]: e.target.value })
                        }
                        onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) =>
                          handleKeyPress(e, () => addSkill(category.id))
                        }
                        placeholder="Add skill"
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                      <button
                        onClick={() => addSkill(category.id)}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {category.skills.map((skill: Skill) => (
                        <span
                          key={skill.id}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-white dark:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                        >
                          {skill.name}
                          <button
                            onClick={() => removeSkill(category.id, skill.id)}
                            className="text-gray-500 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Interests ({(formData.interests || []).length})
                </h3>
                <button
                  onClick={addInterest}
                  className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(formData.interests || []).map((interest: Interest, index: number) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={interest.icon}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            updateInterest(index, 'icon', e.target.value)
                          }
                          className="w-12 px-3 py-1.5 text-center border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          placeholder="Emoji"
                        />
                        <div className="flex-1">
                          <input
                            type="text"
                            value={interest.title}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              updateInterest(index, 'title', e.target.value)
                            }
                            className="w-full px-3 py-1.5 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm font-medium"
                            placeholder="Interest Title"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => removeInterest(index)}
                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <textarea
                      value={interest.desc}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        updateInterest(index, 'desc', e.target.value)
                      }
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                      placeholder="Description of your interest"
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Social Links ({(formData.socialLinks || []).length})
                </h3>
                <button
                  onClick={addSocialLink}
                  className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                {(formData.socialLinks || []).map((link: SocialLink, index: number) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Platform Label
                          </label>
                          <input
                            type="text"
                            value={link.label}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              updateSocialLink(index, 'label', e.target.value)
                            }
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="e.g., GitHub"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Profile URL
                          </label>
                          <input
                            type="url"
                            value={link.link}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              updateSocialLink(index, 'link', e.target.value)
                            }
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="https://github.com/username"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Color Gradient
                          </label>
                          <input
                            type="text"
                            value={link.color}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              updateSocialLink(index, 'color', e.target.value)
                            }
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="from-blue-600 to-blue-700"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => removeSocialLink(index)}
                        className="ml-3 p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button Section */}
            <div className="pt-6 border-t border-gray-200 dark:border-neutral-800">
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCancel}
                  className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !isFormValid() || !isAuthenticated}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                Note: Interests and Social Links are for display purposes only and won't be saved to the database.
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};