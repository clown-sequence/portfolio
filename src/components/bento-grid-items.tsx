import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { X } from "lucide-react";

interface BentoGridItemsProps {
  className?: string;
  title: string;
  description: string;
  header: React.ReactNode;
  content?: React.ReactNode;
  index?: number; // For staggered animations
}

type KeyboardEventHandler = (event: KeyboardEvent) => void;
type MouseEventHandler = (e: React.MouseEvent<HTMLDivElement>) => void;

export const BentoGridItems = ({ 
  className = "", 
  title, 
  description, 
  header, 
  content,
  index = 0 
}: BentoGridItemsProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [hasAnimated, setHasAnimated] = useState<boolean>(false);
  
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleOpen = (): void => {
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  const handleOutsideClick: MouseEventHandler = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      handleClose();
    }
  };

  useEffect(() => {
    const onKeyDown: KeyboardEventHandler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [open]);

  // Mark as animated after first render
  useEffect(() => {
    const timer = setTimeout(() => setHasAnimated(true), (index * 100) + 500);
    return () => clearTimeout(timer);
  }, [index]);

  // Card Entry Animation Variants
  const cardVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9,
      rotateX: -15
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94] as const
      }
    }
  };

  // Header Animation Variants
  const headerVariants: Variants = {
    hidden: { 
      opacity: 0,
      scale: 0.8,
      y: 20
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: (index * 0.1) + 0.2,
        ease: "easeOut"
      }
    }
  };

  // Text Content Animation Variants
  const textVariants: Variants = {
    hidden: { 
      opacity: 0,
      x: -20
    },
    visible: { 
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        delay: (index * 0.1) + 0.3,
        ease: "easeOut"
      }
    }
  };

  // Modal Entry Animations
  const modalBackdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  const modalContentVariants: Variants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 100,
      rotateX: -30
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.5,
        ease: [0.34, 1.56, 0.64, 1] as const
      }
    }
  };

  const modalTitleVariants: Variants = {
    hidden: { 
      opacity: 0,
      y: 20
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: 0.2,
        ease: "easeOut"
      }
    }
  };

  const modalDescriptionVariants: Variants = {
    hidden: { 
      opacity: 0,
      y: 20
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: 0.3,
        ease: "easeOut"
      }
    }
  };

  const modalContentBodyVariants: Variants = {
    hidden: { 
      opacity: 0,
      y: 30
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.4,
        ease: "easeOut"
      }
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <div 
            className="fixed inset-0 z-50 h-screen overflow-auto" 
            onClick={handleOutsideClick}
          >
            <motion.div
              variants={modalBackdropVariants}
              initial="hidden"
              animate="visible"
              className="fixed inset-0 h-full w-full bg-black/80 backdrop-blur-lg"
            />
            <motion.div
              variants={modalContentVariants}
              initial="hidden"
              animate="visible"
              ref={containerRef}
              className="relative z-[60] mx-auto my-10 h-fit max-w-5xl rounded-3xl bg-white p-4 font-sans md:p-10 dark:bg-black/30 shadow-2xl"
              style={{ perspective: 1000 }}
            >
              <motion.button
                initial={{ opacity: 0, rotate: -180, scale: 0 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2, ease: "backOut" }}
                className="sticky top-4 right-0 ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-black hover:bg-neutral-800 transition-colors dark:bg-white dark:hover:bg-neutral-200"
                onClick={handleClose}
                aria-label="Close modal"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-6 w-6 text-neutral-100 dark:text-neutral-900" />
              </motion.button>
              
              <motion.h2
                variants={modalTitleVariants}
                initial="hidden"
                animate="visible"
                layoutId={title}
                className="mt-4 text-2xl font-semibold capitalize text-neutral-700 md:text-4xl dark:text-white"
              >
                {title}
              </motion.h2>
              
              <motion.p
                variants={modalDescriptionVariants}
                initial="hidden"
                animate="visible"
                className="mt-2 text-base text-neutral-600 dark:text-neutral-400"
              >
                {description}
              </motion.p>
              
              <motion.div 
                variants={modalContentBodyVariants}
                initial="hidden"
                animate="visible"
                className="py-10"
              >
                {content || (
                  <div className="space-y-4">
                    <p className="text-neutral-700 dark:text-neutral-300">
                      This is where your expanded content goes. You can add images, detailed descriptions, 
                      code snippets, or any other content you'd like to display when the card is expanded.
                    </p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.div
        onClick={handleOpen}
        className={`row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 dark:bg-black dark:border-white/[0.2] bg-white border border-transparent justify-between flex flex-col space-y-4 cursor-pointer ${className}`}
        variants={cardVariants}
        initial="hidden"
        animate={hasAnimated ? "visible" : "visible"}
        whileHover={{ 
          scale: 1.03,
          y: -5,
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          transition: { duration: 0.3, ease: "easeOut" }
        }}
        whileTap={{ scale: 0.98 }}
        style={{ perspective: 1000 }}
      >
        <motion.div
          variants={headerVariants}
          initial="hidden"
          animate="visible"
        >
          {header}
        </motion.div>
        
        <motion.div 
          className="group-hover/bento:translate-x-2 transition duration-200"
          variants={textVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="font-bold font-roboto capitalize text-neutral-600 dark:text-neutral-200 mb-2 mt-2"
            whileHover={{ x: 5, transition: { duration: 0.2 } }}
          >
            {title}
          </motion.div>
          <motion.div 
            className="font-sans font-normal text-neutral-600 text-xs dark:text-neutral-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: (index * 0.1) + 0.4, duration: 0.4 }}
          >
            {description}
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
};

// Example usage component
export const BentoGridDemo = () => {
  const items = [
    {
      title: "Project Alpha",
      description: "A revolutionary web application built with React and TypeScript",
      header: (
        <div className="flex h-full min-h-[6rem] w-full items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-purple-600">
          <span className="text-4xl">🚀</span>
        </div>
      ),
      content: (
        <div className="space-y-4">
          <p className="text-neutral-700 dark:text-neutral-300">
            Detailed information about Project Alpha goes here. You can include images, 
            code snippets, and extensive documentation.
          </p>
        </div>
      )
    },
    {
      title: "Design System",
      description: "Comprehensive UI component library with dark mode support",
      header: (
        <div className="flex h-full min-h-[6rem] w-full items-center justify-center rounded-md bg-gradient-to-br from-pink-500 to-orange-500">
          <span className="text-4xl">🎨</span>
        </div>
      )
    },
    {
      title: "API Integration",
      description: "RESTful API with authentication and real-time updates",
      header: (
        <div className="flex h-full min-h-[6rem] w-full items-center justify-center rounded-md bg-gradient-to-br from-green-500 to-teal-600">
          <span className="text-4xl">⚡</span>
        </div>
      )
    },
    {
      title: "Mobile App",
      description: "Cross-platform mobile application built with React Native",
      header: (
        <div className="flex h-full min-h-[6rem] w-full items-center justify-center rounded-md bg-gradient-to-br from-yellow-500 to-red-500">
          <span className="text-4xl">📱</span>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <motion.h1 
          className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          Animated Bento Grid
        </motion.h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <BentoGridItems
              key={index}
              index={index}
              title={item.title}
              description={item.description}
              header={item.header}
              content={item.content}
              className={index === 0 ? "md:col-span-2" : ""}
            />
          ))}
        </div>
      </div>
    </div>
  );
};