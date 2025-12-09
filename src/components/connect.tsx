import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { motion } from 'framer-motion';
import { Send, Phone, MapPin, Clock } from 'lucide-react';
import { useContactData } from '@/hooks/use-contact-data';
import { 
  IconBrandFacebook, 
  IconBrandInstagram, 
  IconBrandLinkedin, 
  IconBrandX 
} from '@tabler/icons-react';

// ==================== TYPE DEFINITIONS ====================

/**
 * Form data structure
 */
interface FormData {
  name: string;
  email: string;
  message: string;
}

/**
 * Form validation errors
 */
interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

/**
 * Social media link configuration
 */
interface SocialLinkConfig {
  href: string | undefined;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

// ==================== COMPONENT ====================

export function Connect(): React.JSX.Element {
  const { contact } = useContactData();
  const [state, handleSubmit] = useForm("xgvgnezz");
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});

  // ==================== VALIDATION ====================

  /**
   * Validates all form fields
   * @returns {boolean} True if form is valid, false otherwise
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.error("Please fix the errors below");
      return;
    }
    
    await handleSubmit(e);
    
    // Reset form after successful submission
    if (state.succeeded) {
      setFormData({ name: "", email: "", message: "" });
      setErrors({});
      console.log('Successfully Sent');
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  
  const socialLinks: SocialLinkConfig[] = [
    { href: contact?.socialLinks.facebook, icon: IconBrandFacebook, label: 'Facebook' },
    { href: contact?.socialLinks.instagram, icon: IconBrandInstagram, label: 'Instagram' },
    { href: contact?.socialLinks.linkedin, icon: IconBrandLinkedin, label: 'LinkedIn' },
    { href: contact?.socialLinks.twitter, icon: IconBrandX, label: 'Twitter' },
  ];

  const footerSocialLinks: SocialLinkConfig[] = [
    { href: contact?.socialLinks.instagram, icon: IconBrandInstagram, label: 'Instagram' },
    { href: contact?.socialLinks.twitter, icon: IconBrandX, label: 'Twitter' },
    { href: contact?.socialLinks.linkedin, icon: IconBrandLinkedin, label: 'LinkedIn' },
    { href: contact?.socialLinks.facebook, icon: IconBrandFacebook, label: 'Facebook' },
  ];

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen bg-white dark:bg-black rounded-2xl transition-colors duration-300">
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            {/* Left Side - Info */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col justify-center"
            >
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 dark:text-white mb-8"
              >
                CONTACT
                <br />
                <span className="relative">
                  ME
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '120px' }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="absolute bottom-0 left-0 h-1 bg-gray-900 dark:bg-white"
                  />
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-md"
              >
                Have a question or want to work together? Feel free to reach out. 
                I'll get back to you as soon as possible!
              </motion.p>
            </motion.div>

            {/* Right Side - Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-gray-50 dark:bg-neutral-900 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-neutral-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Let's Stay in Touch
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
                  We want to hear your questions, suggestions, or concerns.
                </p>

                {/* Success Message */}
                {state.succeeded && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                  >
                    <p className="text-green-800 dark:text-green-200 font-medium">
                      ✓ Message sent successfully! We'll get back to you soon.
                    </p>
                  </motion.div>
                )}

                {/* Formspree Error Message */}
                {state.errors && Array.isArray(state.errors) && state.errors.length > 0 && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-800 dark:text-red-200 font-medium">
                      There was an error submitting the form. Please try again.
                    </p>
                  </div>
                )}

                <form onSubmit={handleFormSubmit}>
                  <div className="space-y-6">
                    {/* Name Input */}
                    <div>
                      <label 
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Name"
                        aria-required="true"
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? "name-error" : undefined}
                        className={`w-full px-4 py-3 bg-transparent border-b-2 ${
                          errors.name 
                            ? 'border-red-500' 
                            : 'border-gray-300 dark:border-neutral-700'
                        } focus:border-gray-900 dark:focus:border-white outline-none transition-colors text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600`}
                      />
                      {errors.name && (
                        <p id="name-error" className="mt-1 text-sm text-red-500" role="alert">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Email Input */}
                    <div>
                      <label 
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email"
                        aria-required="true"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                        className={`w-full px-4 py-3 bg-transparent border-b-2 ${
                          errors.email 
                            ? 'border-red-500' 
                            : 'border-gray-300 dark:border-neutral-700'
                        } focus:border-gray-900 dark:focus:border-white outline-none transition-colors text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600`}
                      />
                      {errors.email && (
                        <p id="email-error" className="mt-1 text-sm text-red-500" role="alert">
                          {errors.email}
                        </p>
                      )}
                      <ValidationError 
                        prefix="Email" 
                        field="email"
                        errors={state.errors}
                        className="mt-1 text-sm text-red-500"
                      />
                    </div>

                    {/* Message Input */}
                    <div>
                      <label 
                        htmlFor="message"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Message"
                        rows={4}
                        aria-required="true"
                        aria-invalid={!!errors.message}
                        aria-describedby={errors.message ? "message-error" : undefined}
                        className={`w-full px-4 py-3 bg-transparent border-b-2 ${
                          errors.message 
                            ? 'border-red-500' 
                            : 'border-gray-300 dark:border-neutral-700'
                        } focus:border-gray-900 dark:focus:border-white outline-none transition-colors text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 resize-none`}
                      />
                      {errors.message && (
                        <p id="message-error" className="mt-1 text-sm text-red-500" role="alert">
                          {errors.message}
                        </p>
                      )}
                      <ValidationError 
                        prefix="Message" 
                        field="message"
                        errors={state.errors}
                        className="mt-1 text-sm text-red-500"
                      />
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={state.submitting}
                      aria-busy={state.submitting}
                      className="w-full py-4 bg-white dark:bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {state.submitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : state.succeeded ? (
                        <>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          >
                            ✓
                          </motion.div>
                          Sent Successfully!
                        </>
                      ) : (
                        <>
                          Send
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-200 rounded-2xl dark:bg-black text-gray-900 dark:text-white py-12 px-6 border-t border-gray-300 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {/* Opening Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <Clock className="w-5 h-5" />
              Available Hours
            </h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>{contact?.availableHours.weekdays || 'Mon - Fri: 9:00 AM - 6:00 PM'}</p>
              <p>{contact?.availableHours.weekends || 'Sat - Sun: 10:00 AM - 4:00 PM'}</p>
            </div>
          </motion.div>

          {/* Hotline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <Phone className="w-5 h-5" />
              Hotline
            </h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p
                className="hover:text-gray-900 py-2 dark:hover:text-white transition-colors"
              >
                {contact?.hotline.phone || '+234-8099-775345'}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {contact?.hotline.location || 'African, Nigeria'}
              </p>
            </div>
          </motion.div>

          {/* Follow Us */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Follow Me</h3>
            <div className="flex gap-4">
              {footerSocialLinks.map(({ href, icon: Icon, label }: SocialLinkConfig) => (
                <motion.a
                  key={label}
                  href={href || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-10 h-10 bg-gray-300 dark:bg-neutral-800 hover:bg-gray-400 dark:hover:bg-neutral-700 rounded-full flex items-center justify-center transition-colors text-gray-900 dark:text-white"
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </footer>

      {/* Fixed Social Icons (Right Side) */}
      <div className="fixed right-0 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block">
        <div className="bg-white dark:bg-neutral-900 rounded-l-2xl shadow-xl border border-gray-200 dark:border-neutral-800 py-4 px-2 space-y-4">
          {socialLinks.map(({ href, icon: Icon, label }: SocialLinkConfig, index: number) => (
            <motion.a
              key={label}
              href={href || '#'}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + (index * 0.1) }}
              whileHover={{ scale: 1.2, x: -5 }}
              className="block p-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
            >
              <Icon className="w-5 h-5" />
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
}