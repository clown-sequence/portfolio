import React, { useState } from 'react';
import { MapPin, Calendar, ExternalLink } from 'lucide-react';
import { useAboutMeFetcher } from '@/hooks/use-about-me-fetcher';
import { formatJoinedDate } from '@/lib/utils';
import { motion } from 'motion/react';

// ==================== TYPE DEFINITIONS ====================

/**
 * Individual skill interface
 */
interface Skill {
  id: string;
  name: string;
}

/**
 * Skill category containing multiple skills
 */
interface SkillCategory {
  id: string;
  title: string;
  skills: Skill[];
}

/**
 * Interest/hobby item interface
 */
interface Interest {
  icon: string;
  title: string;
  desc: string;
}

// ==================== COMPONENT ====================

export const AboutMe = (): React.JSX.Element => {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const { aboutMe, loading, error } = useAboutMeFetcher();
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  
  const interests: Interest[] = [
    { icon: '💻', title: 'Clean Code', desc: 'Writing maintainable & scalable solutions' },
    { icon: '🎨', title: 'UI/UX Design', desc: 'Creating intuitive user experiences' },
    { icon: '🚀', title: 'Innovation', desc: 'Exploring cutting-edge technologies' },
    { icon: '🎮', title: '3D Web', desc: 'Building immersive web experiences' },
    { icon: '📱', title: 'Mobile First', desc: 'Responsive design principles' },
    { icon: '⚡', title: 'Performance', desc: 'Optimizing for speed & efficiency' }
  ];

  // ==================== LOADING STATE ====================

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black p-4 md:p-8 flex items-center justify-center rounded-2xl">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-900 dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  // ==================== ERROR STATE ====================

  if (error || !aboutMe) {
    return (
      <div className="min-h-screen bg-white dark:bg-black p-4 md:p-8 flex items-center justify-center rounded-2xl">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Failed to load profile'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ==================== MAIN RENDER ====================

  return (
    <div className="min-h-screen bg-white dark:bg-black p-4 md:p-8 transition-colors rounded-2xl duration-500">
      <div className="max-w-6xl mx-auto">
        
        {/* Main Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          
          {/* Card 1: Hero Section with Name & Title */}
          <div 
            className="md:col-span-2 lg:col-span-3 bg-gray-50 dark:bg-neutral-900 rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200 dark:border-neutral-800 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
          >
            <div className="flex flex-col h-full justify-center">
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="h-1 w-12 bg-gray-900 dark:bg-white rounded-full transition-all duration-700"></div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">WELCOME TO MY PORTFOLIO</span>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 transition-colors duration-500">
                {aboutMe.name}
              </h1>
              
              <h2 className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-4 transition-colors duration-500">
                {aboutMe.title}
              </h2>
              
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed transition-colors duration-500">
                {aboutMe.bio}
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-gray-900 dark:text-white" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{aboutMe.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-gray-700 dark:text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400 text-sm">
                    Joined {formatJoinedDate(aboutMe.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Profile Image */}
          <div 
            className="bg-gray-900 dark:bg-white rounded-2xl p-1 shadow-lg transition-all duration-500 hover:shadow-2xl hover:scale-105 group overflow-hidden relative"
          >
            <div className="bg-gray-50 dark:bg-neutral-900 rounded-xl h-full flex flex-col items-center justify-center p-6 relative z-10 border border-gray-200 dark:border-neutral-800">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: imageLoaded ? 1 : 0.8 }}
                className="w-45 h-45 rounded-full overflow-hidden ring-4 ring-gray-900 dark:ring-white"
              >
                <img
                  src={aboutMe.userImg}
                  alt={aboutMe.name}
                  className="w-full h-full object-cover"
                  onLoad={() => setImageLoaded(true)}
                />
              </motion.div>
              <a 
                href={aboutMe.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 px-6 py-2 text-xs bg-gray-900 dark:bg-white text-white dark:text-black rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                View Resume
                <ExternalLink size={16} />
              </a>
            </div>
            <div className="absolute inset-0 bg-gray-800 dark:bg-gray-200 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
          </div>

          {/* Card 3: Dynamic Skills Section */}
          {aboutMe.skillCategories.map((category: SkillCategory, categoryIndex: number) => (
            <div 
              key={category.id}
              className="bg-gray-50 dark:bg-neutral-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-neutral-800 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
              style={{
                animationDelay: `${categoryIndex * 100}ms`
              }}
            >
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200 dark:border-neutral-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white transition-colors duration-500">
                  {category.title}
                </h3>
                <div className="w-2 h-2 rounded-full bg-gray-900 dark:bg-white animate-pulse"></div>
              </div>
              
              <div className="space-y-3">
                {category.skills.map((skill: Skill, skillIndex: number) => (
                  <div
                    key={skill.id}
                    onMouseEnter={() => setHoveredSkill(skill.id)}
                    onMouseLeave={() => setHoveredSkill(null)}
                    className={`
                      group relative overflow-hidden
                      bg-white dark:bg-neutral-800
                      rounded-xl p-4 cursor-pointer
                      border border-gray-200 dark:border-neutral-700
                      transition-all duration-300
                      ${hoveredSkill === skill.id ? 'scale-105 shadow-lg border-gray-900 dark:border-white' : 'hover:scale-102'}
                    `}
                    style={{
                      animationDelay: `${(categoryIndex * 100) + (skillIndex * 50)}ms`
                    }}
                  >
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="font-medium text-gray-900 dark:text-white transition-colors duration-500">
                        {skill.name}
                      </span>
                      <div className={`
                        w-2 h-2 rounded-full 
                        transition-all duration-300
                        ${hoveredSkill === skill.id ? 'bg-gray-900 dark:bg-white scale-150' : 'bg-gray-400 dark:bg-gray-600'}
                      `}></div>
                    </div>
                    
                    {/* Animated background on hover */}
                    <div 
                      className={`
                        absolute inset-0 bg-gray-900 dark:bg-white opacity-0 
                        transition-opacity duration-300
                        ${hoveredSkill === skill.id ? 'opacity-5' : ''}
                      `}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Card 4: About & Interests */}
          <div className="md:col-span-2 bg-gray-50 dark:bg-neutral-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-neutral-800 transition-all duration-500 hover:shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-neutral-800 transition-colors duration-500">
              What I Love
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {interests.map((item: Interest, index: number) => (
                <div 
                  key={index}
                  className="group p-4 rounded-xl transition-all duration-300 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 hover:border-gray-900 dark:hover:border-white hover:scale-105 cursor-pointer"
                >
                  <div className="text-3xl mb-2 transition-transform duration-300 group-hover:scale-110">
                    {item.icon}
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1 transition-colors duration-500">
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-500">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};