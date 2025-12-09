import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  MapPin, 
  Clock, 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin,
  Edit,
  Save,
  X,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useAuthenticatedContactManager } from '@/hooks/use-authenticated-connect-manager';
import type { ContactData } from '@/types';

interface ConnectTabProps {
  mode: 'view' | 'create' | 'edit';
  setMode: (mode: 'view' | 'create' | 'edit') => void;
}

const defaultData: ContactData = {
  availableHours: {
    weekdays: "",
    weekends: ""
  },
  hotline: {
    phone: "",
    location: ""
  },
  socialLinks: {
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: ""
  }
};

export const ConnectTab: React.FC<ConnectTabProps> = ({ mode, setMode }) => {
  const {
    contact,
    loading,
    error,
    isAuthenticated,
    isOnline,
    authChecking,
    createContact,
    updateContact,
    deleteContact,
  } = useAuthenticatedContactManager();

  const [editData, setEditData] = useState<ContactData>(defaultData);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync contact data to editData when it changes
  useEffect(() => {
    if (contact) {
      setEditData({
        availableHours: contact.availableHours,
        hotline: contact.hotline,
        socialLinks: contact.socialLinks,
      });
    }
  }, [contact]);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSuccessMessage(null);
      
      if (contact) {
        // Update existing contact
        await updateContact(contact.id, editData);
        setSuccessMessage('Contact information updated successfully!');
      } else {
        // Create new contact
        await createContact(editData);
        setSuccessMessage('Contact information created successfully!');
      }
      
      setMode('view');
    } catch (err) {
      console.error('Error saving contact:', err);
      // Error is already set in the hook
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original data
    if (contact) {
      setEditData({
        availableHours: contact.availableHours,
        hotline: contact.hotline,
        socialLinks: contact.socialLinks,
      });
    } else {
      setEditData(defaultData);
    }
    setMode('view');
    setSuccessMessage(null);
  };

  const handleEdit = () => {
    setMode('edit');
    setSuccessMessage(null);
  };

  const handleDelete = async () => {
    if (!contact) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to delete all contact information? This action cannot be undone.'
    );
    
    if (confirmed) {
      try {
        setIsSaving(true);
        await deleteContact(contact.id);
        setSuccessMessage('Contact information deleted successfully!');
        setMode('view');
      } catch (err) {
        console.error('Error deleting contact:', err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Show loading state
  if (loading || authChecking) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {authChecking ? 'Checking authentication...' : 'Loading contact information...'}
          </p>
        </div>
      </div>
    );
  }

  // Get display data based on mode
  const displayData = mode === 'view' ? (contact || defaultData) : editData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Connection Status Banner */}
      {!isOnline && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 flex items-center gap-3">
          <WifiOff className="w-5 h-5 text-red-600 dark:text-red-400" />
          <div>
            <p className="font-medium text-red-800 dark:text-red-200">No Internet Connection</p>
            <p className="text-sm text-red-600 dark:text-red-400">
              You're currently offline. Changes will not be saved.
            </p>
          </div>
        </div>
      )}

      {/* Authentication Warning */}
      {!isAuthenticated && !authChecking && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          <div>
            <p className="font-medium text-yellow-800 dark:text-yellow-200">Authentication Required</p>
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              You must be signed in to create or edit contact information.
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <div className="flex-1">
            <p className="font-medium text-red-800 dark:text-red-200">Error</p>
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6 flex items-center gap-3"
        >
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          <p className="text-green-800 dark:text-green-200">{successMessage}</p>
        </motion.div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Connect Information
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage your contact details and social media links
            </p>
            
            {/* Status Indicators */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2 text-xs">
                {isOnline ? (
                  <>
                    <Wifi className="w-3 h-3 text-green-600" />
                    <span className="text-green-600">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-red-600" />
                    <span className="text-red-600">Offline</span>
                  </>
                )}
              </div>
              
              {contact && (
                <div className="text-xs text-gray-500">
                  Last updated: {contact.updatedAt ? 
                    new Date(contact.updatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Never'
                  }
                </div>
              )}
            </div>
          </div>
          
          {mode === 'view' ? (
            <div className="flex gap-2">
              {contact && isAuthenticated && (
                <button
                  onClick={handleDelete}
                  disabled={!isOnline || isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4" />
                  Delete
                </button>
              )}
              <button
                onClick={handleEdit}
                disabled={!isAuthenticated || !isOnline}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Edit className="w-4 h-4" />
                {contact ? 'Edit Content' : 'Create Content'}
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700 text-gray-900 dark:text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !isOnline}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Footer Information */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Available Hours */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Available Hours
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Weekdays
                </label>
                {mode === 'edit' ? (
                  <input
                    type="text"
                    value={editData.availableHours.weekdays}
                    onChange={(e) => setEditData({
                      ...editData, 
                      availableHours: {...editData.availableHours, weekdays: e.target.value}
                    })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g., Mon - Sat 9:30 AM - 7:30 PM"
                  />
                ) : (
                  <p className="px-4 py-2 bg-gray-50 dark:bg-neutral-800 rounded-lg text-gray-900 dark:text-white">
                    {displayData.availableHours.weekdays || 'Not set'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Weekends
                </label>
                {mode === 'edit' ? (
                  <input
                    type="text"
                    value={editData.availableHours.weekends}
                    onChange={(e) => setEditData({
                      ...editData, 
                      availableHours: {...editData.availableHours, weekends: e.target.value}
                    })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g., Sun 9 AM - 5:30 PM"
                  />
                ) : (
                  <p className="px-4 py-2 bg-gray-50 dark:bg-neutral-800 rounded-lg text-gray-900 dark:text-white">
                    {displayData.availableHours.weekends || 'Not set'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Hotline */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Hotline
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                {mode === 'edit' ? (
                  <input
                    type="text"
                    value={editData.hotline.phone}
                    onChange={(e) => setEditData({
                      ...editData, 
                      hotline: {...editData.hotline, phone: e.target.value}
                    })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g., +23 456 7890"
                  />
                ) : (
                  <p className="px-4 py-2 bg-gray-50 dark:bg-neutral-800 rounded-lg text-gray-900 dark:text-white">
                    {displayData.hotline.phone || 'Not set'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </label>
                {mode === 'edit' ? (
                  <input
                    type="text"
                    value={editData.hotline.location}
                    onChange={(e) => setEditData({
                      ...editData, 
                      hotline: {...editData.hotline, location: e.target.value}
                    })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g., African, Nigeria"
                  />
                ) : (
                  <p className="px-4 py-2 bg-gray-50 dark:bg-neutral-800 rounded-lg text-gray-900 dark:text-white">
                    {displayData.hotline.location || 'Not set'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Social Media Links
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* Facebook */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Facebook className="w-4 h-4" />
                Facebook
              </label>
              {mode === 'edit' ? (
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    value={editData.socialLinks.facebook}
                    onChange={(e) => setEditData({
                      ...editData, 
                      socialLinks: {...editData.socialLinks, facebook: e.target.value}
                    })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="https://facebook.com/username"
                  />
                </div>
              ) : (
                displayData.socialLinks.facebook ? (
                  <a 
                    href={displayData.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 bg-gray-50 dark:bg-neutral-800 rounded-lg text-blue-600 dark:text-blue-400 hover:underline truncate"
                  >
                    {displayData.socialLinks.facebook}
                  </a>
                ) : (
                  <p className="px-4 py-2 bg-gray-50 dark:bg-neutral-800 rounded-lg text-gray-500 dark:text-gray-400">
                    Not set
                  </p>
                )
              )}
            </div>

            {/* Instagram */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Instagram className="w-4 h-4" />
                Instagram
              </label>
              {mode === 'edit' ? (
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    value={editData.socialLinks.instagram}
                    onChange={(e) => setEditData({
                      ...editData, 
                      socialLinks: {...editData.socialLinks, instagram: e.target.value}
                    })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="https://instagram.com/username"
                  />
                </div>
              ) : (
                displayData.socialLinks.instagram ? (
                  <a 
                    href={displayData.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 bg-gray-50 dark:bg-neutral-800 rounded-lg text-blue-600 dark:text-blue-400 hover:underline truncate"
                  >
                    {displayData.socialLinks.instagram}
                  </a>
                ) : (
                  <p className="px-4 py-2 bg-gray-50 dark:bg-neutral-800 rounded-lg text-gray-500 dark:text-gray-400">
                    Not set
                  </p>
                )
              )}
            </div>

            {/* Twitter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Twitter className="w-4 h-4" />
                Twitter
              </label>
              {mode === 'edit' ? (
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    value={editData.socialLinks.twitter}
                    onChange={(e) => setEditData({
                      ...editData, 
                      socialLinks: {...editData.socialLinks, twitter: e.target.value}
                    })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="https://twitter.com/username"
                  />
                </div>
              ) : (
                displayData.socialLinks.twitter ? (
                  <a 
                    href={displayData.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 bg-gray-50 dark:bg-neutral-800 rounded-lg text-blue-600 dark:text-blue-400 hover:underline truncate"
                  >
                    {displayData.socialLinks.twitter}
                  </a>
                ) : (
                  <p className="px-4 py-2 bg-gray-50 dark:bg-neutral-800 rounded-lg text-gray-500 dark:text-gray-400">
                    Not set
                  </p>
                )
              )}
            </div>

            {/* LinkedIn */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </label>
              {mode === 'edit' ? (
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    value={editData.socialLinks.linkedin}
                    onChange={(e) => setEditData({
                      ...editData, 
                      socialLinks: {...editData.socialLinks, linkedin: e.target.value}
                    })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              ) : (
                displayData.socialLinks.linkedin ? (
                  <a 
                    href={displayData.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 bg-gray-50 dark:bg-neutral-800 rounded-lg text-blue-600 dark:text-blue-400 hover:underline truncate"
                  >
                    {displayData.socialLinks.linkedin}
                  </a>
                ) : (
                  <p className="px-4 py-2 bg-gray-50 dark:bg-neutral-800 rounded-lg text-gray-500 dark:text-gray-400">
                    Not set
                  </p>
                )
              )}
            </div>
          </div>
        </div>

        {/* Empty State */}
        {!contact && mode === 'view' && (
          <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-neutral-700 p-12 text-center">
            <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Contact Information Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Get started by adding your contact details and social media links.
            </p>
            <button
              onClick={handleEdit}
              disabled={!isAuthenticated || !isOnline}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Edit className="w-4 h-4" />
              Create Contact Information
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};