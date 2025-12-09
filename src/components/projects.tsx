import { useProjectsFetcher } from "@/hooks/use-projects-fetcher";
import type { Project } from "@/types";
import { IconArrowLeft, IconArrowRight, IconExternalLink, IconBrandGithub } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";

// Generate random rotation for animations
const generateRotation = (): number => {
  return Math.floor(Math.random() * 21) - 10;
};

// Default media configuration
const defaultMedia: { type: 'image' | 'video'; src: string } = {
  type: 'image',
  src: 'https://images.unsplash.com/photo-1572177812156-58036aae439c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
};

// Hardcoded projects data
// const projectsData: Project[] = [
//   {
//     id: 1,
//     name: "EvoBots: Mobile Arena",
//     status: true,
//     category: "Mobile (Java/Kotlin)",
//     description: "A 2D/light 3D mobile adaptation of the engine. Users train and evolve AI bots in simplified arenas on their devices, with offline genetic simulation and a clean Material Design UI.",
//     technologies: ["Java/Kotlin", "Android SDK", "LibGDX/OpenGL ES", "SQLite"],
//     livePreview: 'https://example.com/evobots-demo',
//     github: 'https://github.com/example/evobots-mobile',
//     keyFeature: "Train in pocket – genetic evolution runs as a background service",
//     inspiredBy: ["Genetic Algorithm", "Autonomous Agents"],
//     rotation: generateRotation()
//   },
//   {
//     id: 2,
//     name: "Genetic Command Center",
//     status: false,
//     category: "Java",
//     description: "A desktop/server-side application that acts as a distributed controller for heavy-duty AI bot evolution simulations. Manages populations and runs batch simulations on remote workers.",
//     technologies: ["Java SE", "JavaFX/Swing", "Multithreading", "Apache Kafka/Netty", "PostgreSQL"],
//     livePreview: '',
//     github: 'https://github.com/example/genetic-command',
//     keyFeature: "Fleet management for thousands of bot genomes across simulation nodes",
//     inspiredBy: ["Core Simulation", "Data Management"],
//     rotation: generateRotation()
//   },
//   {
//     id: 3,
//     name: "NeuroEvolution Sandbox",
//     status: true,
//     category: "Python (AI)",
//     description: "Extension of the engine replacing GA with NeuroEvolution (NEAT/HyperNEAT). Bots have evolving neural networks enabling complex behaviors like cooperation and memory.",
//     technologies: ["Python", "PyOpenGL", "NumPy", "neat-python", "Enhanced core/engine.py"],
//     livePreview: 'https://example.com/neuroevolution',
//     github: '',
//     keyFeature: "Visual real-time rendering of evolving neural network structures",
//     inspiredBy: ["AI Agents", "3D Simulation"],
//     rotation: generateRotation()
//   },
//   {
//     id: 4,
//     name: "Ecosystem Simulator & Data Pipeline",
//     status: false,
//     category: "Python (Data/Backend)",
//     description: "Applies simulation logic to model real-world systems (traffic, markets). Focuses on data generation, logging, and analytics dashboards.",
//     technologies: ["Python", "Pandas", "Matplotlib/Plotly", "FastAPI", "InfluxDB/PostgreSQL"],
//     livePreview: '',
//     github: '',
//     keyFeature: "Massive-scale simulation data export for AI training sets",
//     inspiredBy: ["Simulation Logic", "Config-driven Design"],
//     rotation: generateRotation()
//   },
//   {
//     id: 5,
//     name: "AI Engine Web Dashboard",
//     status: true,
//     category: "Web (Full-Stack)",
//     description: "Web-based control panel and visualization suite for the existing Python engine. Displays real-time stats, genome trees, and leaderboards.",
//     technologies: ["React", "Node.js/Express", "Python/FastAPI", "Socket.io", "Chart.js", "Tailwind CSS"],
//     livePreview: 'https://example.com/ai-dashboard',
//     github: 'https://github.com/example/ai-dashboard',
//     keyFeature: "Remote real-time monitoring and intervention in genetic evolution",
//     inspiredBy: ["Real-time Graphics", "System Management"],
//     rotation: generateRotation()
//   },
//   {
//     id: 6,
//     name: "Genome Visualizer & Interactive Lineage Explorer",
//     status: true,
//     category: "React (Frontend)",
//     description: "Standalone React application visualizing engine output. Provides interactive charts, phylogenetic trees, and a gene editor.",
//     technologies: ["React", "TypeScript", "D3.js", "Recharts", "Vite"],
//     livePreview: 'https://example.com/genome-viz',
//     github: 'https://github.com/example/genome-visualizer',
//     keyFeature: "Interactive phylogenetic tree showing inheritance and mutation across generations",
//     inspiredBy: ["Genetic Algorithm", "Data Output"],
//     rotation: generateRotation()
//   },
//   {
//     id: 7,
//     name: "RL Coach for Evolved Bots",
//     status: false,
//     category: "AI (Machine Learning)",
//     description: "Hybrid AI system using evolved bots as starting population for Reinforcement Learning (RL) training. Creates synergy between evolution and learning.",
//     technologies: ["Python", "PyTorch/TensorFlow", "RLlib/Stable-Baselines3", "core/engine.py integration"],
//     livePreview: '',
//     github: 'https://github.com/example/rl-coach',
//     keyFeature: "Seamless pipeline from genetic evolution to fine-tuned reinforcement learning",
//     inspiredBy: ["AI Learning", "Adaptation"],
//     rotation: generateRotation()
//   },
//   {
//     id: 8,
//     name: "Vision-Based AI Arena & Natural Language Commander",
//     status: true,
//     category: "AI (CV/LLM)",
//     description: "Bots perceive through simulated vision (CNN) and follow commands from an LLM that interprets natural language instructions.",
//     technologies: ["Python", "OpenCV/PyTorch Vision", "Transformers library", "LangChain", "Llama.cpp"],
//     livePreview: 'https://example.com/vision-arena',
//     github: '',
//     keyFeature: "Give AI army natural language orders and watch them strategize via evolved instincts",
//     inspiredBy: ["AI Integration", "Dynamic World"],
//     rotation: generateRotation()
//   }
// ];

export const Projects: React.FC = () => {
  const { projects } = useProjectsFetcher()
  console.log(projects);
  
  const [active, setActive] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());
  const getRotation = (project: Project): number => {
    return project.rotation || generateRotation();
  };

  const handleNext = (): void => {
    setActive((prev: number) => (prev + 1) % projects.length);
  };

  const handlePrev = (): void => {
    setActive((prev: number) => (prev - 1 + projects.length) % projects.length);
  };

  const isActive = (index: number): boolean => {
    return index === active;
  };

  const getMediaSrc = (project: Project): string => {
    return project.media?.src || defaultMedia.src;
  };

  const getMediaType = (project: Project): 'image' | 'video' => {
    return project.media?.type || defaultMedia.type;
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string): void => {
    if (!url) {
      e.preventDefault();
    }
  };

  // Video playback control
  useEffect(() => {
    const activeProject: Project = projects[active];
    const activeVideo: HTMLVideoElement | undefined = videoRefs.current.get(active);

    if (activeVideo && activeProject.media?.type === 'video') {
      if (isHovered) {
        activeVideo.play().catch((err: Error) => console.log('Video play failed:', err));
      } else {
        activeVideo.pause();
        activeVideo.currentTime = 0;
      }
    }

    // Pause all other videos
    videoRefs.current.forEach((video: HTMLVideoElement, index: number) => {
      if (index !== active) {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [isHovered, active, projects]);

  return (
    <div className="mx-auto max-w-sm px-4 py-20 font-sans antialiased md:max-w-6xl md:px-8 lg:px-12">
      <div className="relative grid grid-cols-1 gap-20 md:grid-cols-2">
        {/* Media Section - Sticky on desktop */}
        <div
          className="md:sticky md:top-8 md:self-start"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative h-80 w-full">
            <AnimatePresence mode="wait">
              {projects.map((project: Project, index: number) => (
                <motion.div
                  key={project.id}
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                    z: -100,
                    rotate: getRotation(project),
                  }}
                  animate={{
                    opacity: isActive(index) ? 1 : 0.7,
                    scale: isActive(index) ? 1 : 0.95,
                    z: isActive(index) ? 0 : -100,
                    rotate: isActive(index) ? 0 : getRotation(project),
                    zIndex: isActive(index)
                      ? 40
                      : projects.length + 2 - index,
                    y: isActive(index) ? [0, -80, 0] : 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    z: 100,
                    rotate: getRotation(project),
                  }}
                  transition={{
                    duration: 0.4,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 origin-bottom"
                >
                  {getMediaType(project) === 'video' ? (
                    <div className="relative h-full w-full rounded-3xl overflow-hidden bg-black">
                      <video
                        ref={(el: HTMLVideoElement | null) => {
                          if (el) videoRefs.current.set(index, el);
                        }}
                        src={getMediaSrc(project)}
                        loop
                        muted
                        playsInline
                        className="h-full w-full object-cover object-center"
                      />
                      {!isHovered && isActive(index) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="rounded-full bg-white/90 p-4">
                            <svg
                              className="h-8 w-8 text-black"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <img
                      src={getMediaSrc(project)}
                      alt={project.name}
                      draggable={false}
                      className="h-full w-full rounded-3xl object-cover object-center"
                    />
                  )}
                  
                  {/* Category Badge with Status */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <div className="rounded-full bg-black/50 backdrop-blur-sm px-4 py-2">
                      <span className="text-sm font-semibold text-white">
                        {project.category}
                      </span>
                    </div>
                    {project.status && (
                      <div className="rounded-full bg-green-500/90 backdrop-blur-sm px-3 py-2">
                        <span className="text-xs font-bold text-white">LIVE</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          {/* Navigation */}
          <div className="flex mt-15 items-center justify-between pt-12 md:pt-0">
            <div className="flex gap-4">
              <button
                onClick={handlePrev}
                className="group/button flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors"
                aria-label="Previous project"
              >
                <IconArrowLeft className="h-5 w-5 text-black transition-transform duration-300 group-hover/button:rotate-12 dark:text-neutral-400" />
              </button>
              <button
                onClick={handleNext}
                className="group/button flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors"
                aria-label="Next project"
              >
                <IconArrowRight className="h-5 w-5 text-black transition-transform duration-300 group-hover/button:-rotate-12 dark:text-neutral-400" />
              </button>
            </div>
            
            {/* Progress Indicator */}
            <div className="text-sm text-gray-500 dark:text-neutral-500">
              {active + 1} / {projects.length}
            </div>
          </div>
        </div>

        {/* Content Section - Scrollable */}
        <div className="flex flex-col space-y-8">
          {projects.map((project: Project, idx: number) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              onClick={() => setActive(idx)}
              className={`cursor-pointer rounded-2xl border-2 transition-all duration-300 ${
                active === idx
                  ? 'border-blue-500 bg-blue-50/50 dark:border-blue-400 dark:bg-blue-950/30 shadow-lg'
                  : 'border-transparent bg-white dark:bg-neutral-900 hover:border-gray-300 dark:hover:border-neutral-700'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-black dark:text-white">
                        {project.name}
                      </h3>
                      {project.status && (
                        <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs font-semibold text-green-800 dark:text-green-300">
                          Live
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-neutral-500">
                      {project.category}
                    </p>
                  </div>
                  {active === idx && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500"
                    >
                      <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </div>

                <p className="text-sm text-gray-600 dark:text-neutral-400 mb-4">
                  {project.description}
                </p>

                {/* Key Feature */}
                <div className="mb-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-3">
                  <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">
                    ⚡ Key Feature
                  </p>
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    {project.keyFeature}
                  </p>
                </div>

                {/* Technologies */}
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-2">
                    Technologies
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologies.map((tech: string, techIdx: number) => (
                      <span
                        key={techIdx}
                        className="rounded-full bg-gray-100 dark:bg-neutral-800 px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-neutral-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Inspired By */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-2">
                    Inspired By
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.inspiredBy.map((inspiration: string, insIdx: number) => (
                      <span
                        key={insIdx}
                        className="rounded-full bg-purple-100 dark:bg-purple-900/30 px-2.5 py-1 text-xs font-medium text-purple-700 dark:text-purple-300"
                      >
                        {inspiration}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Links */}
                <div className="flex gap-3 pt-3 border-t border-gray-200 dark:border-neutral-700">
                  {project.livePreview && (
                    <a
                      href={project.livePreview}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => handleLinkClick(e, project.livePreview)}
                      className="flex items-center gap-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition-colors"
                    >
                      <IconExternalLink className="h-4 w-4" />
                      Live Preview
                    </a>
                  )}
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => handleLinkClick(e, project.github)}
                      className="flex items-center gap-1.5 rounded-lg bg-gray-800 hover:bg-gray-900 dark:bg-neutral-700 dark:hover:bg-neutral-600 px-3 py-2 text-xs font-semibold text-white transition-colors"
                    >
                      <IconBrandGithub className="h-4 w-4" />
                      GitHub
                    </a>
                  )}
                  {!project.livePreview && !project.github && (
                    <span className="text-xs text-gray-500 dark:text-neutral-500 italic py-2">
                      Coming soon...
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};