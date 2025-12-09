import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Save, Check, Clock, Star, AlertCircle, Loader2, Wifi, WifiOff } from 'lucide-react';
import { useAuthenticatedTestimonialManager } from '@/hooks/use-authenticated-testimonial-manager';
import type { Testimonial } from '@/types';


interface TestimonialsTabProps {
  mode: 'view' | 'create' | 'edit';
  setMode: (mode: 'view' | 'create' | 'edit') => void;
}

export const TestimonialsTab: React.FC<TestimonialsTabProps> = ({ 
  mode, 
  setMode 
}) => {
  const {
    testimonials: hookTestimonials,
    loading,
    error,
    user,
    isAuthenticated,
    isOnline,
    authChecking,
    rateLimitInfo,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
  } = useAuthenticatedTestimonialManager();
 
  // Transform hook testimonials to match component expectations
  const testimonials: Testimonial[] = hookTestimonials.map(testimonial => ({
    ...testimonial,
    id: testimonial.id,
    clientName: testimonial.clientName || '',
    message: testimonial.message || '',
    image: testimonial.image || '',
    approved: testimonial.approved || false,
    company: testimonial.company || '',
    project: testimonial.project || '',
    role: testimonial.role || '',
    rating: testimonial.rating || 0,
    createdAt: typeof testimonial.createdAt === 'string' ? testimonial.createdAt.split('T')[0] : new Date(testimonial.createdAt).toISOString().split('T')[0]
  }));

  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved'>('all');

  const [formData, setFormData] = useState<Partial<Testimonial>>({
    clientName: '',
    company: '',
    approved: false,
    image: '',
    message: '',
    rating: 3,
    project: '',
    role: '',
    createdAt: Date(),
  });

  useEffect(() => {
    if (selectedTestimonial) {
      setFormData(selectedTestimonial);
    }
  }, [selectedTestimonial]);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const resetForm = (): void => {
    setFormData({
      clientName: '',
      company: '',
      approved: false,
      image: '',
      message: '',
      rating: 3,
      project: '',
      role: '',
      createdAt: Date(),
    });
    setSelectedTestimonial(null);
  };

  const handleCreate = async (): Promise<void> => {
    if (!isFormValid()) return;

    try {
      setSaving(true);
      
      await createTestimonial({
        clientName: formData.clientName || '',
        company: formData.company || '',
        approved: formData.approved || false,
        image: formData.image || '',
        message: formData.message || '',
        rating: formData.rating || 3,
        project: formData.project || '',
        role: formData.role || '',
        createdAt: Date(),
      });

      showSuccess('Testimonial created successfully!');
      resetForm();
      setMode('view');
    } catch (err) {
      console.error('Failed to create testimonial:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (): Promise<void> => {
    if (!selectedTestimonial || !isFormValid()) return;

    try {
      setSaving(true);
      
      await updateTestimonial(selectedTestimonial.id, {
        id: selectedTestimonial.id,
        clientName: formData.clientName!,
        role: formData.role!,
        company: formData.company!,
        image: formData.image || '',
        message: formData.message!,
        rating: formData.rating || 3,
        approved: formData.approved || false,
        project: formData.project || '',
        createdAt: selectedTestimonial.createdAt,
      });

      showSuccess('Testimonial updated successfully!');
      resetForm();
      setMode('view');
    } catch (err) {
      console.error('Failed to update testimonial:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) {
      return;
    }

    try {
      setSaving(true);
      await deleteTestimonial(id);
      showSuccess('Testimonial deleted successfully!');
    } catch (err) {
      console.error('Failed to delete testimonial:', err);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (testimonial: Testimonial): void => {
    setSelectedTestimonial(testimonial);
    setFormData(testimonial);
    setMode('edit');
  };

  const toggleVerified = async (id: string): Promise<void> => {
    try {
      const testimonial = testimonials.find(t => t.id === id);
      if (!testimonial) return;

      await updateTestimonial(id, {
        id: testimonial.id,
        approved: !testimonial.approved,
      });
      
      showSuccess(`Testimonial ${!testimonial.approved ? 'approved' : 'unapproved'} successfully!`);
    } catch (err) {
      console.error('Failed to toggle approved status:', err);
    }
  };

  

  const isFormValid = (): boolean => {
    return !!(
      formData.clientName &&
      formData.role &&
      formData.company &&
      formData.message &&
      formData.message.length >= 10
    );
  };

  const filteredTestimonials = testimonials.filter((t: Testimonial) => {
    if (filterStatus === 'pending') return !t.approved;
    if (filterStatus === 'approved') return t.approved;
    return true;
  });

  const pendingCount = testimonials.filter(t => !t.approved).length;
  const approvedCount = testimonials.filter(t => t.approved).length;

  // Show loading state
  if (loading || authChecking) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {authChecking ? 'Checking authentication...' : 'Loading testimonials...'}
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
                Please sign in to manage testimonials. You can still view testimonials while signed out.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Testimonials List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Testimonials ({testimonials.length})
              </h2>
              <button
                onClick={() => {
                  resetForm();
                  setMode('create');
                }}
                disabled={!isAuthenticated}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={!isAuthenticated ? 'Sign in to create' : 'Create testimonial'}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-neutral-800 p-1 rounded-lg">
              <button
                onClick={() => setFilterStatus('all')}
                className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                All ({testimonials.length})
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filterStatus === 'pending'
                    ? 'bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setFilterStatus('approved')}
                className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filterStatus === 'approved'
                    ? 'bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Approved ({approvedCount})
              </button>
            </div>

            {/* Stats Cards */}
            {pendingCount > 0 && (
              <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    {pendingCount} testimonial{pendingCount > 1 ? 's' : ''} awaiting approval
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-[calc(100vh-450px)] overflow-y-auto">
              {filteredTestimonials.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">
                  {filterStatus === 'pending' 
                    ? 'No pending testimonials' 
                    : filterStatus === 'approved'
                    ? 'No approved testimonials yet'
                    : 'No testimonials yet. Create your first one!'}
                </p>
              ) : (
                filteredTestimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className={`p-3 border rounded-lg transition-all ${
                      testimonial.approved
                        ? 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/10'
                        : 'border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-900/10'
                    } hover:shadow-md`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {testimonial.image ? (
                          <img 
                            src={testimonial.image} 
                            alt={testimonial.clientName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                            {testimonial.clientName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm">
                            {testimonial.clientName}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {testimonial.role} at {testimonial.company}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < (testimonial.rating || 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300 dark:text-neutral-600'
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                      {testimonial.message}
                    </p>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {testimonial.approved ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                          <Check className="h-3 w-3" />
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium">
                          <Clock className="h-3 w-3" />
                          Pending
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {!testimonial.approved && isAuthenticated && (
                        <button
                          onClick={() => toggleVerified(testimonial.id)}
                          disabled={saving}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          <Check className="h-3 w-3" />
                          Approve
                        </button>
                      )}
                      {isAuthenticated && (
                        <>
                          <button
                            onClick={() => startEdit(testimonial)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(testimonial.id)}
                            disabled={saving}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
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
                  No Testimonial Selected
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Select a testimonial to edit or create a new one
                </p>
                <button
                  onClick={() => {
                    resetForm();
                    setMode('create');
                  }}
                  disabled={!isAuthenticated}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create New Testimonial
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {mode === 'create' ? 'Create New Testimonial' : 'Edit Testimonial'}
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
                {/* Personal Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Cleint Name *
                    </label>
                    <input
                      type="text"
                      value={formData.clientName || ''}
                      onChange={(e) => 
                        setFormData({...formData, clientName: e.target.value})
                      }
                      placeholder="John Doe"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Role/Position *
                    </label>
                    <input
                      type="text"
                      value={formData.role || ''}
                      onChange={(e) => 
                        setFormData({...formData, role: e.target.value})
                      }
                      placeholder="CEO"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Project *
                    </label>
                    <input
                      type="text"
                      value={formData.project || ''}
                      onChange={(e) => 
                        setFormData({...formData, project: e.target.value})
                      }
                      placeholder="Mobile App / Web App"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Company *
                  </label>
                  <input
                    type="text"
                    value={formData.company || ''}
                    onChange={(e) => 
                      setFormData({...formData, company: e.target.value})
                    }
                    placeholder="Tech Corp"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Avatar URL
                  </label>
                  <input
                    type="url"
                    value={formData.image || ''}
                    onChange={(e) => 
                      setFormData({...formData, image: e.target.value})
                    }
                    placeholder="https://example.com/avater.jpg"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  {formData.image && (
                    <div className="mt-2 flex items-center gap-2">
                      <img 
                        src={formData.image} 
                        alt="Preview" 
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-neutral-700"
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400">Preview</span>
                    </div>
                  )}
                </div>

                {/* Testimonial Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Testimonial Content * 
                    <span className="text-xs text-gray-500 ml-1">
                      ({(formData.message || '').length} characters, min 10)
                    </span>
                  </label>
                  <textarea
                    value={formData.message || ''}
                    onChange={(e) => 
                      setFormData({...formData, message: e.target.value})
                    }
                    placeholder="Write the testimonial here..."
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rating *
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setFormData({...formData, rating: rating as 1 | 2 | 3 | 4 | 5})}
                        className="p-2 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            rating <= (formData.rating || 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300 dark:text-neutral-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                
                {/* Status Toggles */}
                <div className="space-y-3 p-4 bg-gray-50 dark:bg-neutral-800/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Verified/Approved
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Show this testimonial to clients
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, approved: !formData.approved})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.approved ? 'bg-green-600' : 'bg-gray-300 dark:bg-neutral-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.approved ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-neutral-800">
                <button
                  onClick={() => {
                    resetForm();
                    setMode('view');
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={mode === 'create' ? handleCreate : handleUpdate}
                  disabled={saving || !isFormValid() || !isAuthenticated}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saving ? 'Saving...' : mode === 'create' ? 'Create' : 'Save'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};