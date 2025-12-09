import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTestimonialsFetcher } from '@/hooks/use-testiomonial-fetcher';
import { FullTestimonialView } from './full-testimonial-view';
import type { Testimonial } from '@/types';
import { TestimonialCard } from './testimonial-card';



interface StatItem {
  label: string;
  value: string;
  icon: string;
}

// Stats data
const statsData: StatItem[] = [
  { label: "Happy Clients", value: "250+", icon: "😊" },
  { label: "Projects Completed", value: "500+", icon: "✅" },
  { label: "5-Star Reviews", value: "98%", icon: "⭐" },
  { label: "Countries Served", value: "30+", icon: "🌍" }
];


// Main Testimonials Component
export function Testimonials(): React.JSX.Element {
  const { testimonials } = useTestimonialsFetcher(true)
  console.log(testimonials);
  
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  useEffect(() => {
    if (selectedTestimonial) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedTestimonial]);

  const handleSelectTestimonial = (testimonial: Testimonial): void => {
    setSelectedTestimonial(testimonial);
  };

  const handleBackToGrid = (): void => {
    setSelectedTestimonial(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl dark:from-neutral-950 dark:to-neutral-900 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {!selectedTestimonial ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="inline-block mb-4"
                >
                  <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-semibold">
                    ⭐ Client Success Stories
                  </div>
                </motion.div>
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
                  What Our Clients Say
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Don't just take our word for it. Here's what our amazing clients have to say about working with us.
                </p>
              </motion.div>

              {/* Testimonials Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {testimonials.map((testimonial, index) => (
            
                  <TestimonialCard
                    key={testimonial.id}
                    testimonial={testimonial}

                    onClick={() => handleSelectTestimonial(testimonial)}
                    delay={index * 0.1}
                  />
                ))}
              </div>

              {/* Stats Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
              >
                {statsData.map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="text-center p-6 bg-white dark:bg-neutral-900 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="text-4xl mb-2">{stat.icon}</div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          ) : (
            <FullTestimonialView
              key="full"
              testimonial={selectedTestimonial}
              onBack={handleBackToGrid}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}