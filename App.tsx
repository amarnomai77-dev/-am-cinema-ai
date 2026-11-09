
/*
 * SPDX-License-Identifier: Apache-2.0
 * AM CINEMA AI — Master Application
 * Lead Developer: AMMAR ALNAMI (عمار النمي)
 * AI Development Assistant: ChatGPT (GT Assistant)
 * Tagline: Create. Direct. Inspire.
 */

import React, { useState, useEffect } from 'react';

import {
  loadProjectsFromStorage,
  saveProjectsToStorage,
  getActiveProjectId,
  setActiveProjectId,
  STARTER_PROJECT,
} from './utils/storage';

import { CinemaProject } from './types/cinema';

import { Header, ActiveTab } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { AutoDirectorView } from './components/AutoDirectorView';
import { ManualStudioView } from './components/ManualStudioView';
import { CharacterCastView } from './components/CharacterCastView';
import { TimelineEditorView } from './components/TimelineEditorView';
import { EnginesHubView } from './components/EnginesHubView';
import { DiagnosticsView } from './components/DiagnosticsView';
import { SmartDirectorModal } from './components/SmartDirectorModal';

import {
  Film,
  Sparkles,
  Sliders,
  Users,
  Layers,
} from 'lucide-react';

// Unique project ID
const createProjectId = () =>
  `am-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// Safe initial projects
const loadInitialProjects = (): CinemaProject[] => {
  try {
    const saved = loadProjectsFromStorage();

    if (Array.isArray(saved) && saved.length > 0) {
      return saved;
    }
  } catch (error) {
    console.error('Project loading failed:', error);
  }

  return [STARTER_PROJECT];
};

export default function App() {
  const [projects, setProjects] = useState<CinemaProject[]>(
    loadInitialProjects
  );

  const [currentProjectId, setCurrentProjectId] = useState<string>(() => {
    try {
      return getActiveProjectId() || STARTER_PROJECT.id;
    } catch {
      return STARTER_PROJECT.id;
    }
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  const [lang, setLang] = useState<'ar' | 'en'>('ar');

  const [isSaving, setIsSaving] = useState(false);

  const [showSmartDirector, setShowSmartDirector] = useState(false);

  const isAr = lang === 'ar';

  // Current active project
  const currentProject =
    projects.find((p) => p.id === currentProjectId) ||
    projects[0] ||
    STARTER_PROJECT;

  // Automatic project saving
  useEffect(() => {
    try {
      setIsSaving(true);
      saveProjectsToStorage(projects);
      setActiveProjectId(currentProjectId);
    } catch (error) {
      console.error('Project saving failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [projects, currentProjectId]);

  // Select project
  const handleSelectProject = (id: string) => {
    const exists = projects.some((p) => p.id === id);

    if (!exists) return;

    setCurrentProjectId(id);
    setActiveProjectId(id);
  };

  // Create project
  const handleCreateProject = () => {
    const now = Date.now();

    const newProject: CinemaProject = {
      ...STARTER_PROJECT,
      id: createProjectId(),
      createdAt: now,
      updatedAt: now,
    };

    setProjects((prev) => [newProject, ...prev]);
    setCurrentProjectId(newProject.id);
    setActiveProjectId(newProject.id);
    setActiveTab('dashboard');
  };

  // Update current project
  const handleUpdateCurrentProject = (updatedProject: CinemaProject) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === currentProjectId
          ? {
              ...updatedProject,
              updatedAt: Date.now(),
            }
          : project
      )
    );
  };

  // Duplicate project
  const handleDuplicateProject = (id: string) => {
    const source = projects.find((p) => p.id === id);

    if (!source) return;

    const now = Date.now();

    const duplicated: CinemaProject = {
      ...source,
      id: createProjectId(),
      createdAt: now,
      updatedAt: now,
    };

    setProjects((prev) => [duplicated, ...prev]);
    setCurrentProjectId(duplicated.id);
    setActiveProjectId(duplicated.id);
  };

  // Delete project
  const handleDeleteProject = (id: string) => {
    if (projects.length <= 1) return;

    const filtered = projects.filter((p) => p.id !== id);

    if (filtered.length === projects.length) return;

    setProjects(filtered);

    if (currentProjectId === id) {
      const nextProject = filtered[0];

      setCurrentProjectId(nextProject.id);
      setActiveProjectId(nextProject.id);
    }
  };

  // Import project
  const handleImportProject = (imported: CinemaProject) => {
    if (!imported) return;

    const now = Date.now();

    const importedProject: CinemaProject = {
      ...imported,
      id: projects.some((p) => p.id === imported.id)
        ? createProjectId()
        : imported.id,
      updatedAt: now,
    };

    setProjects((prev) => [importedProject, ...prev]);
    setCurrentProjectId(importedProject.id);
    setActiveProjectId(importedProject.id);
  };

  return (
    <div className="min-h-screen bg-[#070709] text-stone-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">

      {/* Global Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        project={currentProject}
        onOpenSmartDirector={() => setShowSmartDirector(true)}
        smartDirectorScore={94}
        isSaving={isSaving}
      />

      {/* Main Studio */}
      <main className="flex-1 pb-20 sm:pb-12">

        {activeTab === 'dashboard' && (
          <DashboardView
            projects={projects}
            currentProjectId={currentProjectId}
            onSelectProject={handleSelectProject}
            onCreateProject={handleCreateProject}
            onDuplicateProject={handleDuplicateProject}
            onDeleteProject={handleDeleteProject}
            onImportProject={handleImportProject}
            onNavigateTab={setActiveTab}
            lang={lang}
          />
        )}

        {activeTab === 'auto_director' && (
          <AutoDirectorView
            project={currentProject}
            onUpdateProject={handleUpdateCurrentProject}
            onNavigateTab={setActiveTab}
            lang={lang}
          />
        )}

        {activeTab === 'manual_studio' && (
          <ManualStudioView
            project={currentProject}
            onUpdateProject={handleUpdateCurrentProject}
            lang={lang}
          />
        )}

        {activeTab === 'characters' && (
          <CharacterCastView
            project={currentProject}
            onUpdateProject={handleUpdateCurrentProject}
            lang={lang}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineEditorView
            project={currentProject}
            onUpdateProject={handleUpdateCurrentProject}
            lang={lang}
          />
        )}

        {activeTab === 'engines' && (
          <EnginesHubView
            project={currentProject}
            lang={lang}
          />
        )}

        {activeTab === 'diagnostics' && (
          <DiagnosticsView lang={lang} />
        )}

      </main>

      {/* Smart Director */}
      {showSmartDirector && (
        <SmartDirectorModal
          project={currentProject}
          onUpdateProject={handleUpdateCurrentProject}
          onClose={() => setShowSmartDirector(false)}
          lang={lang}
        />
      )}

      {/* Android Mobile Navigation */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070709]/95 backdrop-blur-md border-t border-stone-800 py-1.5 px-2 flex items-center justify-around">

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 text-[10px] ${
            activeTab === 'dashboard'
              ? 'text-amber-400 font-bold'
              : 'text-stone-400'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>{isAr ? 'المشاريع' : 'Films'}</span>
        </button>

        <button
          onClick={() => setActiveTab('auto_director')}
          className={`flex flex-col items-center gap-0.5 text-[10px] ${
            activeTab === 'auto_director'
              ? 'text-amber-400 font-bold'
              : 'text-stone-400'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{isAr ? 'المخرج' : 'Director'}</span>
        </button>

        <button
          onClick={() => setActiveTab('manual_studio')}
          className={`flex flex-col items-center gap-0.5 text-[10px] ${
            activeTab === 'manual_studio'
              ? 'text-amber-400 font-bold'
              : 'text-stone-400'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{isAr ? 'اللقطات' : 'Studio'}</span>
        </button>

        <button
          onClick={() => setActiveTab('characters')}
          className={`flex flex-col items-center gap-0.5 text-[10px] ${
            activeTab === 'characters'
              ? 'text-amber-400 font-bold'
              : 'text-stone-400'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{isAr ? 'الشخصيات' : 'Cast'}</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex flex-col items-center gap-0.5 text-[10px] ${
            activeTab === 'timeline'
              ? 'text-amber-400 font-bold'
              : 'text-stone-400'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{isAr ? 'المونتاج' : 'Timeline'}</span>
        </button>

      </div>

      {/* Luxury Footer */}
      <footer className="border-t border-stone-900 bg-[#050507] py-4 text-center text-xs text-stone-500">

        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">

          <p className="font-cinematic text-stone-400">
            AM CINEMA AI — Create. Direct. Inspire.
          </p>

          <p>
            {isAr
              ? 'المطور الرئيسي والمالك:'
              : 'Lead Creator & Developer:'}{' '}

            <span className="text-amber-400 font-semibold">
              AMMAR ALNAMI — عمار النمي
            </span>

            {' '}| AI Assistant: ChatGPT (GT Assistant)
          </p>

        </div>
      </footer>

    </div>
  );
}
