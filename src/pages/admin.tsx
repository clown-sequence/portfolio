import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import {  FolderOpen, User, MessageSquare
} from "lucide-react";
import { ProjectsTab } from "@/components/admin/projects-tab";
import { AboutMeTab } from "@/components/admin/about-me-tab";
import { TestimonialsTab } from "@/components/admin/testimonials-tab";
import type {
  TabType,
  FormMode,
  Tab,
} from "@/types/index";
import { useAuth } from "@/context/auth-context";
import { useAuthenticatedProjectManager } from "@/hooks/use-authenticated-project-manager";
import { useAuthenticatedAboutMeManager } from "@/hooks/use-authenticated-about-me-manager ";
import { useAuthenticatedTestimonialManager } from "@/hooks/use-authenticated-testimonial-manager";
import { IconCloudDataConnection } from "@tabler/icons-react";
import { ConnectTab } from "@/components/admin/connect-tab";


const tabs: Tab[] = [
  { id: 'projects', label: 'Projects', icon: FolderOpen, count: 0 },
  { id: 'about', label: 'About Me', icon: User, count: 0 },
  { id: 'testimonials', label: 'Testimonials', icon: MessageSquare, count: 0 },
  { id: 'connect', label: 'Connect', icon: IconCloudDataConnection, count: 0 }
];

export function AdminDashboard() {
  const { user, loading, logout } = useAuth();
  const { projects } = useAuthenticatedProjectManager();
  const { aboutMe } = useAuthenticatedAboutMeManager();
  const { testimonials } = useAuthenticatedTestimonialManager();
  const [activeTab, setActiveTab] = useState<TabType>('projects');
  const [projectMode, setProjectMode] = useState<FormMode>('view');
  const [testimonialMode, setTestimonialMode] = useState<FormMode>('view');
  const [connectMode, setConnectMode] = useState<FormMode>('view');
  const [aboutMeMode, setAboutMeMode] = useState<FormMode>('view');
  const tabsWithCount: Tab[] = tabs.map(tab => ({
    ...tab,
    count: tab.id === 'projects' 
      ? projects.length 
      : tab.id === 'testimonials' 
      ? testimonials.length 
      : aboutMe ? 1 : 0
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                Manage your portfolio content
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="h-2 w-2 rounded-full bg-green-600"></span>
                <span>Signed in as {user?.email || 'User'}</span>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6 overflow-x-auto">
            {tabsWithCount.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  <span className={`
                    px-2 py-0.5 rounded-full text-xs font-semibold
                    ${isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-gray-200 dark:bg-neutral-700 text-gray-700 dark:text-gray-300'
                    }
                  `}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'projects' && (
            <ProjectsTab
              key="projects"
              mode={projectMode}
              setMode={setProjectMode}
            />
          )}
          {activeTab === 'about' && (
            <AboutMeTab
              key="about"
              mode={aboutMeMode}
              setMode={setAboutMeMode}
            />
          )}
          {activeTab === 'testimonials' && (
            <TestimonialsTab
              key="testimonials"
              mode={testimonialMode}
              setMode={setTestimonialMode}
            />
          )}

          {activeTab === 'connect' && (
            <ConnectTab
              key="connect"
              mode={connectMode}
              setMode={setConnectMode}
            />
          )}
        </AnimatePresence>
      </main>     
    </div>
  );
}