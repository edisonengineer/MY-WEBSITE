import React, { useState, useEffect, useMemo } from 'react';
import { 
  Discipline, 
  SubCategory, 
  GraphicSubCategory, 
  EngineeringSubCategory, 
  Project, 
  UserProfile 
} from './types/portfolio';
import { INITIAL_PROJECTS, INITIAL_USER_PROFILE } from './data/initialProjects';
import { EngineeringBlueprintCard } from './components/EngineeringBlueprintCard';
import { GraphicDesignCard } from './components/GraphicDesignCard';
import { InteractiveCadCanvas } from './components/InteractiveCadCanvas';
import { UploadProjectModal } from './components/UploadProjectModal';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { GitHubExportModal } from './components/GitHubExportModal';
import { ProfileEditModal } from './components/ProfileEditModal';
import { 
  Plus, 
  Upload, 
  Github, 
  Search, 
  Compass, 
  Sparkles, 
  Box, 
  SlidersHorizontal, 
  Layers, 
  FileCode, 
  Mail, 
  ExternalLink,
  ChevronRight,
  User,
  ArrowUpRight,
  Cpu,
  CheckCircle2
} from 'lucide-react';

export default function App() {
  // --- Persistent Storage State ---
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('vektor_portfolio_projects');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading projects from localStorage', e);
    }
    return INITIAL_PROJECTS;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('vektor_user_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading profile from localStorage', e);
    }
    return INITIAL_USER_PROFILE;
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('vektor_portfolio_projects', JSON.stringify(projects));
    } catch (e) {
      console.error('Error saving projects to localStorage', e);
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem('vektor_user_profile', JSON.stringify(userProfile));
    } catch (e) {
      console.error('Error saving profile to localStorage', e);
    }
  }, [userProfile]);

  // --- Navigation & Filter States ---
  // Primary Tabs: 'engineering' | 'graphic-design' | 'all'
  const [activeMainTab, setActiveMainTab] = useState<'engineering' | 'graphic-design' | 'all'>('engineering');
  
  // Sub-tabs under each
  const [engineeringSubTab, setEngineeringSubTab] = useState<EngineeringSubCategory>('all');
  const [graphicSubTab, setGraphicSubTab] = useState<GraphicSubCategory>('all');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedToolFilter, setSelectedToolFilter] = useState<string>('all');

  // --- Modals State ---
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadDefaultDiscipline, setUploadDefaultDiscipline] = useState<Discipline>('engineering');
  const [uploadDefaultSubCategory, setUploadDefaultSubCategory] = useState<SubCategory>('all');

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Add project handler
  const handleAddProject = (newProject: Project) => {
    setProjects((prev) => [newProject, ...prev]);
    showToast(`"${newProject.title}" uploaded successfully to ${newProject.discipline === 'engineering' ? 'Engineering' : 'Graphic Design'}!`);
  };

  // Delete project handler
  const handleDeleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    showToast('Project removed from portfolio.');
  };

  // Import projects handler
  const handleImportProjects = (imported: Project[]) => {
    setProjects(imported);
    showToast(`Imported ${imported.length} projects successfully.`);
  };

  // Reset projects to default handler
  const handleResetProjects = () => {
    setProjects(INITIAL_PROJECTS);
    setUserProfile(INITIAL_USER_PROFILE);
    showToast('Portfolio reset to initial demo projects.');
  };

  // Trigger Upload from specific sub-tab
  const openUploadForCurrentTab = () => {
    if (activeMainTab === 'graphic-design') {
      setUploadDefaultDiscipline('graphic-design');
      setUploadDefaultSubCategory(graphicSubTab);
    } else {
      setUploadDefaultDiscipline('engineering');
      setUploadDefaultSubCategory(engineeringSubTab);
    }
    setIsUploadModalOpen(true);
  };

  // Extract all unique tools for the filter pill list
  const allUniqueTools = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => p.tools.forEach((t) => set.add(t)));
    return Array.from(set).slice(0, 10);
  }, [projects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Main tab match
      if (activeMainTab !== 'all' && project.discipline !== activeMainTab) {
        return false;
      }

      // Sub-tab match
      if (project.discipline === 'engineering' && engineeringSubTab !== 'all') {
        if (project.subCategory !== engineeringSubTab) return false;
      }
      if (project.discipline === 'graphic-design' && graphicSubTab !== 'all') {
        if (project.subCategory !== graphicSubTab) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = project.title.toLowerCase().includes(q);
        const matchesDesc = project.description.toLowerCase().includes(q);
        const matchesTools = project.tools.some((t) => t.toLowerCase().includes(q));
        const matchesClient = project.clientOrContext.toLowerCase().includes(q);
        const matchesTag = project.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesTools && !matchesClient && !matchesTag) {
          return false;
        }
      }

      // Tool filter
      if (selectedToolFilter !== 'all') {
        if (!project.tools.includes(selectedToolFilter)) return false;
      }

      return true;
    });
  }, [projects, activeMainTab, engineeringSubTab, graphicSubTab, searchQuery, selectedToolFilter]);

  // Counts for tabs
  const engineeringCount = projects.filter((p) => p.discipline === 'engineering').length;
  const graphicCount = projects.filter((p) => p.discipline === 'graphic-design').length;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-amber-400 selection:text-neutral-950 bg-blueprint-grid">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-neutral-900 border border-neutral-700 text-white rounded-xl shadow-2xl text-xs font-mono animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          TOP NAVIGATION BAR (Strict Section 2 Contract: 1 row, 3 zones)
          Zone 1: Brand title (single text element)
          Zone 2: 4-6 text nav links
          Zone 3: 1-2 primary actions
         ========================================================================= */}
      <header className="sticky top-0 z-40 w-full bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/80 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#"
            className="text-base font-bold tracking-tight text-white hover:text-amber-400 transition-colors whitespace-nowrap font-['Syne',sans-serif]"
          >
            {userProfile.name.toUpperCase()}
          </a>

          {/* Zone 2: Clean text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-mono uppercase tracking-wider text-neutral-400">
            <button
              onClick={() => setActiveMainTab('engineering')}
              className={`hover:text-cyan-400 transition-colors ${
                activeMainTab === 'engineering' ? 'text-cyan-400 font-semibold underline underline-offset-8' : ''
              }`}
            >
              Mechanical Design ({engineeringCount})
            </button>
            <button
              onClick={() => setActiveMainTab('graphic-design')}
              className={`hover:text-amber-400 transition-colors ${
                activeMainTab === 'graphic-design' ? 'text-amber-400 font-semibold underline underline-offset-8' : ''
              }`}
            >
              Graphic Design ({graphicCount})
            </button>
            <button
              onClick={() => setActiveMainTab('all')}
              className={`hover:text-white transition-colors ${
                activeMainTab === 'all' ? 'text-white font-semibold underline underline-offset-8' : ''
              }`}
            >
              All Works ({projects.length})
            </button>
            <button
              onClick={() => setIsGitHubModalOpen(true)}
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub Sync</span>
            </button>
            <a
              href="#about-section"
              className="hover:text-white transition-colors"
            >
              Credentials & Specs
            </a>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={openUploadForCurrentTab}
              className="px-3.5 py-1.5 text-xs font-medium bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-lg transition-colors flex items-center gap-1.5 font-mono font-semibold whitespace-nowrap shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Past Project</span>
            </button>

            <a
              href={`mailto:${userProfile.email}?subject=Project%20Inquiry%20from%20Portfolio`}
              className="hidden sm:inline-flex px-3 py-1.5 text-xs font-mono text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors whitespace-nowrap"
            >
              Hire Me
            </a>
          </div>

        </div>
      </header>

      {/* =========================================================================
          HERO SECTION: DUAL-DISCIPLINE SPLIT & 3D INTERACTIVE SPOTLIGHT
         ========================================================================= */}
      <section className="relative border-b border-neutral-800/80 bg-gradient-to-b from-neutral-900/40 via-neutral-950 to-neutral-950 px-6 pt-12 pb-14">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Dual Identity & Narrative */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
              <span className="text-cyan-400">CAD & Mechanical Systems</span>
              <span aria-hidden="true">/</span>
              <span className="text-amber-400">Swiss Brand Identity</span>
              <span aria-hidden="true">·</span>
              <span>GitHub-Ready Portfolio</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight font-['Syne',sans-serif]">
              Precision Engineering Meets High-Discipline Visual Design.
            </h1>

            <p className="text-base text-neutral-400 max-w-2xl leading-relaxed">
              {userProfile.bio}
            </p>

            {/* Quick Primary Tab Switcher Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setActiveMainTab('engineering');
                  setEngineeringSubTab('all');
                }}
                className={`px-4 py-2.5 rounded-xl border text-xs font-mono transition-all flex items-center gap-2 ${
                  activeMainTab === 'engineering'
                    ? 'border-cyan-500 bg-cyan-950/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)] font-semibold'
                    : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white'
                }`}
              >
                <Box className="w-4 h-4 text-cyan-400" />
                <span>Mechanical Design Tab</span>
                <span className="text-[11px] text-neutral-500 font-normal">({engineeringCount})</span>
              </button>

              <button
                onClick={() => {
                  setActiveMainTab('graphic-design');
                  setGraphicSubTab('all');
                }}
                className={`px-4 py-2.5 rounded-xl border text-xs font-mono transition-all flex items-center gap-2 ${
                  activeMainTab === 'graphic-design'
                    ? 'border-amber-400 bg-amber-950/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)] font-semibold'
                    : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Graphic Design Tab</span>
                <span className="text-[11px] text-neutral-500 font-normal">({graphicCount})</span>
              </button>

              <button
                onClick={() => setActiveMainTab('all')}
                className={`px-3 py-2.5 rounded-xl border text-xs font-mono transition-all ${
                  activeMainTab === 'all'
                    ? 'border-neutral-600 bg-neutral-800 text-white font-semibold'
                    : 'border-neutral-800 bg-neutral-900/40 text-neutral-500 hover:text-neutral-300'
                }`}
              >
                All Works
              </button>
            </div>

            {/* Quick Metadata Bar (Zero-Pill discipline) */}
            <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono text-neutral-500">
              <span>{userProfile.location}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400">Available for Contract & Full-time</span>
              <span aria-hidden="true">·</span>
              <button 
                onClick={() => setIsProfileModalOpen(true)}
                className="text-amber-400 hover:underline inline-flex items-center gap-1"
              >
                <User className="w-3 h-3" /> Edit Profile
              </button>
            </div>
          </div>

          {/* Right Column: Interactive 3D CAD & Blueprint Simulation Frame */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-2 shadow-2xl relative">
              <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800 text-xs font-mono text-neutral-400 mb-2">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Compass className="w-3.5 h-3.5" />
                  <span>3D Parametric CAD Viewport</span>
                </span>
                <span className="text-[10px] text-neutral-500">
                  Real-time Orbit & Blueprint
                </span>
              </div>
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800/80">
                <InteractiveCadCanvas
                  modelType={activeMainTab === 'graphic-design' ? 'swiss-poster' : 'gear'}
                  interactive={true}
                  showBlueprintControls={true}
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SUB-TABS & PROJECT MANAGEMENT CONTROLS
          The exact requirement from user:
          "TABS LIKE GRAPHIC DESIGN, ENGINERRING THEN UNDER EACH THEY HAVE SUB TBS TO UPLOAD PAST PROJECTS"
         ========================================================================= */}
      <section className="sticky top-[57px] z-30 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800 px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Sub-Tabs Selector based on activeMainTab */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {activeMainTab === 'engineering' && (
              <>
                {[
                  { id: 'all', label: 'All Mechanical' },
                  { id: 'cad-modeling', label: 'CAD & Parametric' },
                  { id: 'mechanisms-robotics', label: 'Robotics & Mechanisms' },
                  { id: 'fea-thermal', label: 'FEA & Structural' },
                  { id: 'prototyping-dfm', label: 'Prototyping & DFM' },
                ].map((sub) => {
                  const count = sub.id === 'all' 
                    ? engineeringCount 
                    : projects.filter((p) => p.discipline === 'engineering' && p.subCategory === sub.id).length;

                  return (
                    <button
                      key={sub.id}
                      onClick={() => setEngineeringSubTab(sub.id as EngineeringSubCategory)}
                      className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                        engineeringSubTab === sub.id
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-medium'
                          : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border border-transparent'
                      }`}
                    >
                      <span>{sub.label}</span>
                      <span className="text-[10px] text-neutral-500 font-normal">({count})</span>
                    </button>
                  );
                })}
              </>
            )}

            {activeMainTab === 'graphic-design' && (
              <>
                {[
                  { id: 'all', label: 'All Graphic Works' },
                  { id: 'brand-identity', label: 'Brand Identity' },
                  { id: 'ui-ux', label: 'UI/UX & Digital' },
                  { id: 'typography-print', label: 'Typography & Print' },
                  { id: 'packaging-3d', label: 'Packaging & 3D' },
                ].map((sub) => {
                  const count = sub.id === 'all' 
                    ? graphicCount 
                    : projects.filter((p) => p.discipline === 'graphic-design' && p.subCategory === sub.id).length;

                  return (
                    <button
                      key={sub.id}
                      onClick={() => setGraphicSubTab(sub.id as GraphicSubCategory)}
                      className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                        graphicSubTab === sub.id
                          ? 'bg-amber-950 text-amber-300 border border-amber-700/60 font-medium'
                          : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border border-transparent'
                      }`}
                    >
                      <span>{sub.label}</span>
                      <span className="text-[10px] text-neutral-500 font-normal">({count})</span>
                    </button>
                  );
                })}
              </>
            )}

            {activeMainTab === 'all' && (
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                <span className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-200">
                  Showing All {projects.length} Multidisciplinary Projects
                </span>
              </div>
            )}
          </div>

          {/* Sub-Tab Action: "+ Upload Past Project to this Tab" */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={openUploadForCurrentTab}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg border flex items-center gap-1.5 transition-colors ${
                activeMainTab === 'engineering'
                  ? 'border-cyan-600/60 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/40'
                  : 'border-amber-600/60 bg-amber-950/40 text-amber-300 hover:bg-amber-900/40'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>
                {activeMainTab === 'engineering' 
                  ? '+ Upload to Mechanical' 
                  : activeMainTab === 'graphic-design'
                  ? '+ Upload to Graphic'
                  : '+ Upload Project'}
              </span>
            </button>

            {/* GitHub Sync Button */}
            <button
              onClick={() => setIsGitHubModalOpen(true)}
              title="Export project data or push to GitHub"
              className="p-1.5 text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <Github className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SEARCH & SOFTWARE FILTER BAR
         ========================================================================= */}
      <section className="px-6 py-4 border-b border-neutral-800/60 bg-neutral-950/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, CAD tools, specs..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-amber-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Quick Tool Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none text-[11px] font-mono">
            <span className="text-neutral-500 mr-1 hidden lg:inline">Filter by Tool:</span>
            <button
              onClick={() => setSelectedToolFilter('all')}
              className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                selectedToolFilter === 'all'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              All Tools
            </button>
            {allUniqueTools.map((tool) => (
              <button
                key={tool}
                onClick={() => setSelectedToolFilter(tool === selectedToolFilter ? 'all' : tool)}
                className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                  selectedToolFilter === tool
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                    : 'text-neutral-400 hover:text-neutral-200 bg-neutral-900 border border-neutral-800'
                }`}
              >
                {tool}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          MAIN PROJECT SHOWCASE GRID
         ========================================================================= */}
      <main className="max-w-7xl mx-auto px-6 py-10 flex-1 w-full">
        
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-neutral-800/80">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold tracking-tight text-white font-['Syne',sans-serif]">
              {activeMainTab === 'engineering' 
                ? 'Mechanical Engineering Projects' 
                : activeMainTab === 'graphic-design'
                ? 'Graphic Design & Visual Systems'
                : 'Complete Portfolio Works'}
            </h2>
            <span className="text-xs font-mono text-neutral-500">
              ({filteredProjects.length} case {filteredProjects.length === 1 ? 'study' : 'studies'})
            </span>
          </div>

          <div className="text-xs font-mono text-neutral-500 hidden sm:block">
            Click any tile to inspect CAD specs & blueprints
          </div>
        </div>

        {/* Project Grid */}
        {filteredProjects.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/30">
            <Box className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-neutral-300">No projects found matching criteria</h3>
            <p className="text-xs text-neutral-500 font-mono mt-1 max-w-sm mx-auto">
              Try resetting your search query or upload a new past project to this tab.
            </p>
            <button
              onClick={openUploadForCurrentTab}
              className="mt-4 px-4 py-2 text-xs font-mono bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" /> Upload Past Project Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
            {filteredProjects.map((project) => (
              project.discipline === 'engineering' ? (
                <EngineeringBlueprintCard
                  key={project.id}
                  project={project}
                  onSelect={(p) => setSelectedProject(p)}
                />
              ) : (
                <GraphicDesignCard
                  key={project.id}
                  project={project}
                  onSelect={(p) => setSelectedProject(p)}
                />
              )
            ))}
          </div>
        )}

        {/* Add Project Floating CTA card */}
        <div className="mt-8 p-6 rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-white">Have more past projects to showcase?</h4>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">
              Upload CAD models, robotics projects, packaging dielines, or brand identity guidelines directly.
            </p>
          </div>
          <button
            onClick={openUploadForCurrentTab}
            className="px-4 py-2 text-xs font-mono font-medium text-neutral-200 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-colors border border-neutral-700 flex items-center gap-2 whitespace-nowrap"
          >
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span>Upload Past Project</span>
          </button>
        </div>

      </main>

      {/* =========================================================================
          ENGINEERING & DESIGN CREDENTIALS / SPECS SECTION
         ========================================================================= */}
      <section id="about-section" className="border-t border-neutral-800 bg-neutral-900/40 px-6 py-14">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-neutral-800">
            <div>
              <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">
                Technical Stack & Capabilities
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1 font-['Syne',sans-serif]">
                Dual-Discipline Engineering Matrix
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="px-3.5 py-1.5 text-xs font-mono bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors border border-neutral-700 flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-neutral-400" />
                <span>Edit Profile Info</span>
              </button>
              <button
                onClick={() => setIsGitHubModalOpen(true)}
                className="px-3.5 py-1.5 text-xs font-mono bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors border border-neutral-700 flex items-center gap-1.5"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub Deployment Guide</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Column 1: Mechanical Engineering Competencies */}
            <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-950/70 space-y-4">
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider font-semibold">
                <Box className="w-4 h-4" />
                <span>Mechanical Design & CAD Capabilities</span>
              </div>
              <ul className="space-y-3 text-sm text-neutral-300">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-mono text-xs mt-1">01.</span>
                  <div>
                    <strong className="text-white">Parametric CAD & Complex Surfacing:</strong> SolidWorks, Autodesk Fusion 360, PTC Creo, Onshape. Master assemblies, skeleton modeling, and multi-body sheet metal.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-mono text-xs mt-1">02.</span>
                  <div>
                    <strong className="text-white">FEA & Thermal Simulation:</strong> ANSYS Workbench, OptiStruct. Linear/nonlinear static structural analysis, modal vibration, and topology optimization.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-mono text-xs mt-1">03.</span>
                  <div>
                    <strong className="text-white">Kinematics & Mechanism Synthesis:</strong> Cycloidal reducers, epicyclic planetary gearing, robotic arm joint actuation, four-bar linkages.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-mono text-xs mt-1">04.</span>
                  <div>
                    <strong className="text-white">DFM & CNC Tooling:</strong> Design for CNC 3/5-axis milling, injection molding draft & parting lines, sheet metal bend deductions, FDM/SLA/SLS 3D printing.
                  </div>
                </li>
              </ul>
            </div>

            {/* Column 2: Graphic Design Competencies */}
            <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-950/70 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>Graphic Design & Visual Systems</span>
              </div>
              <ul className="space-y-3 text-sm text-neutral-300">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-mono text-xs mt-1">01.</span>
                  <div>
                    <strong className="text-white">Brand Architecture & Systems:</strong> Modular logomarks, comprehensive design guidelines, responsive vector identity frameworks.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-mono text-xs mt-1">02.</span>
                  <div>
                    <strong className="text-white">UI/UX & Design Systems:</strong> Figma, design tokens, high-density industrial telemetry dashboards, WCAG AAA accessible typography.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-mono text-xs mt-1">03.</span>
                  <div>
                    <strong className="text-white">Swiss Typography & Print Editorial:</strong> Mathematical grid structures (12-column modular), large format monographs, silkscreen poster series.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-mono text-xs mt-1">04.</span>
                  <div>
                    <strong className="text-white">Structural Packaging & 3D Renders:</strong> Dieline engineering, zero-glue interlocking mechanisms, Cinema 4D and KeyShot photorealistic lighting.
                  </div>
                </li>
              </ul>
            </div>

          </div>

          {/* Contact / Hire Me CTA */}
          <div className="p-8 rounded-2xl border border-neutral-800 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-white font-['Syne',sans-serif]">
                Ready to collaborate on engineering or design?
              </h3>
              <p className="text-xs text-neutral-400 font-mono">
                Currently open for mechanical engineering consultations, CAD modeling, and graphic brand systems.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={`mailto:${userProfile.email}?subject=Project%20Inquiry`}
                className="px-5 py-2.5 text-xs font-mono font-semibold bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xl transition-colors flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>Contact {userProfile.name.split(' ')[0]}</span>
              </a>
              <a
                href={userProfile.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-colors border border-neutral-700"
                title="View GitHub Profile"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          FOOTER (Quiet copyright and status)
         ========================================================================= */}
      <footer className="border-t border-neutral-800/80 px-6 py-8 text-xs font-mono text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © {new Date().getFullYear()} {userProfile.name} · Graphic Designer & Mechanical Design Engineer
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsGitHubModalOpen(true)}
              className="hover:text-neutral-300 transition-colors"
            >
              Export JSON for GitHub
            </button>
            <span>·</span>
            <button
              onClick={openUploadForCurrentTab}
              className="text-amber-400 hover:underline"
            >
              Upload Past Project
            </button>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          MODALS
         ========================================================================= */}
      
      {/* 1. Upload Past Project Modal */}
      <UploadProjectModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onAddProject={handleAddProject}
        defaultDiscipline={uploadDefaultDiscipline}
        defaultSubCategory={uploadDefaultSubCategory}
      />

      {/* 2. Project Case Study / Detail Lightbox Modal */}
      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onDeleteProject={handleDeleteProject}
      />

      {/* 3. GitHub Export & Deployment Guide Modal */}
      <GitHubExportModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
        projects={projects}
        userProfile={userProfile}
        onImportProjects={handleImportProjects}
        onResetProjects={handleResetProjects}
      />

      {/* 4. Profile & Info Customizer Modal */}
      <ProfileEditModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={userProfile}
        onSaveProfile={(updated) => {
          setUserProfile(updated);
          showToast('Profile updated successfully.');
        }}
      />

    </div>
  );
}
