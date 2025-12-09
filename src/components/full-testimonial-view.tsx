import { formatJoinedDate } from "@/lib/utils";
import type { Testimonial } from "@/types";
import { ArrowLeft, Briefcase, Calendar, CheckCircle, Grid3x3, Quote, Star } from "lucide-react";
import { motion } from "motion/react";

interface FullTestimonialViewProps {
  testimonial: Testimonial;
  onBack: () => void;
}

export const FullTestimonialView: React.FC<FullTestimonialViewProps> = ({ 
  testimonial, 
  onBack 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
      className="w-full"
    >
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        onClick={onBack}
        className="mb-8 flex items-center gap-2 px-6 py-3 bg-white dark:bg-neutral-800 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-neutral-700 group"
      >
        <ArrowLeft className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:-translate-x-1 transition-transform" />
        <span className="font-semibold text-gray-700 dark:text-gray-300">Back to all reviews</span>
      </motion.button>

      {/* Full Testimonial Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-neutral-800"
      >
        {/* Hero Header with Gradient */}
        <div className="relative h-64 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-8">
          <div className="absolute inset-0 bg-black/20" />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="relative z-10 flex items-center gap-6 h-full"
          >
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-32 h-32 rounded-full overflow-hidden ring-8 ring-white/50 shadow-2xl"
            >
              <img
                src={testimonial.image}
                alt={testimonial.clientName}
                className="w-full h-full object-cover"
              />
            </motion.div>
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="text-4xl font-bold text-white mb-2"
              >
                {testimonial.clientName}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="text-xl text-white/90 mb-1"
              >
                {testimonial.role}
              </motion.p>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="text-lg text-white/80"
              >
                {testimonial.company}
              </motion.p>
            </div>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-10">
          {/* Rating */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="flex gap-1">
              {[...Array(testimonial.rating)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0, rotate: -180 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
                >
                  <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                </motion.div>
              ))}
            </div>
            <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">
              {testimonial.rating}.0
            </span>
            <span className="text-gray-500 dark:text-gray-400">out of 5</span>
          </motion.div>

          {/* Quote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="relative mb-10"
          >
            <Quote className="absolute -top-6 -left-4 w-16 h-16 text-blue-500/20" />
            <p className="text-2xl text-gray-800 dark:text-gray-200 leading-relaxed pl-10 font-light">
              "{testimonial.message}"
            </p>
          </motion.div>

          {/* Project Details Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          >
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-2xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-blue-500/20 rounded-xl">
                  <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Project</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {testimonial.project}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 rounded-2xl border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-purple-500/20 rounded-xl">
                  <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">Date Completed</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatJoinedDate(testimonial.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Verified Badge */}
          {testimonial.approved && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, type: "spring" }}
              className="flex items-center gap-3 p-6 bg-green-50 dark:bg-green-950/30 border-2 border-green-200 dark:border-green-800 rounded-2xl"
            >
              <div className="p-3 bg-green-500/20 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-bold text-green-700 dark:text-green-400 text-lg">
                  Verified Client Review
                </p>
                <p className="text-sm text-green-600 dark:text-green-500">
                  This testimonial has been verified and authenticated
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Navigation to other testimonials */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mt-8 text-center"
      >
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          <Grid3x3 className="w-5 h-5" />
          View All Testimonials
        </button>
      </motion.div>
    </motion.div>
  );
};