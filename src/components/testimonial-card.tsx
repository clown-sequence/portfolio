import { formatJoinedDate } from "@/lib/utils";
import type { Testimonial } from "@/types";
import { Briefcase, CheckCircle, Quote, Star } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface TestimonialCardProps {
  testimonial: Testimonial;
  onClick: () => void;
  delay?: number;
}
export const TestimonialCard: React.FC<TestimonialCardProps> = ({ 
  testimonial, 
  onClick, 
  delay = 0 
}) => {
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={onClick}
      className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-lg hover:shadow-2xl cursor-pointer border border-gray-100 dark:border-neutral-800 relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: imageLoaded ? 1 : 0.8 }}
              className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-blue-500/20"
            >
              <img
                src={testimonial.image}
                alt={testimonial.clientName}
                className="w-full h-full object-cover"
                onLoad={() => setImageLoaded(true)}
              />
            </motion.div>
            {testimonial.approved && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1"
              >
                <CheckCircle className="w-4 h-4 text-white" />
              </motion.div>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
              {testimonial.clientName}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {testimonial.role}
            </p>
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              {testimonial.company}
            </p>
          </div>
          
          <div className="flex gap-0.5">
            {[...Array(testimonial.rating)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative">
          <Quote className="absolute -top-2 -left-2 w-8 h-8 text-blue-500/20" />
          <p className="text-gray-700 dark:text-gray-300 line-clamp-3 pl-4">
            {testimonial.message}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <Briefcase className="w-4 h-4" />
            <span className="truncate max-w-[200px]">{testimonial.project}</span>
          </div>
          <span className="text-gray-400 dark:text-gray-500 text-xs">
            {formatJoinedDate(testimonial?.createdAt)}
          </span>
        </div>

        <div className="mt-3 text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
          Read full review
          <motion.span
            animate={{ x: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            →
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
};