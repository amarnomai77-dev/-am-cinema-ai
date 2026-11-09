/**
 * @license
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
  Cpu,
  Activity,
} from 'lucide-react';

export default function App() {
  const [projects, setProjects] = useState<CinemaProject[]>(() => loadProjectsFromStorage());
  const [currentProjectId, setCurrentProjectId] = useState<string>(() => getActiveProjectId());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [isSaving, setIsSaving] = useState(false);
  const [showSmartDirector, setShowSmartDirector] = useState(false);

  // Active Cinema Project
  const currentProject =
    projects.find((p) => p.id === currentProjectId) || projects[0] || STARTER_PROJECT;

  // Debounced auto-save
  useEffect(() => {
    setIsSaving(true);
    const timer = setTimeout(() => {
      saveProjectsToStorage(projects);
      setIsSaving(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [projects]);

  // Handle active project selection
  const handleSelectProject = (id: string) => {
    setCurrentProjectId(id);
    setActiveProjectId(id);
  };

  // Handle updates to the active project
  const handleUpdateCurrentProject = (updated: CinemaProject) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  // Handle create new project
  const handleCreateProject = (newProj: CinemaProject) => {
    setProjects((prev) => [newProj, ...prev]);
    setCurrentProjectId(newProj.id);
    setActiveProjectId(newProj.id);
    setActiveTab('auto_director');
  };

  // Handle duplicate project
  const handleDuplicateProject = (id: string) => {
    const target = projects.find((p) => p.id === id);
    if (!target) return;
    const duplicated: CinemaProject = {
      ...target,
      id: `proj_${Date.now()}`,
      title: `${target.title} (Copy)`,
      titleAr: `${target.titleAr || target.title} (نسخة)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setProjects((prev) => [duplicated, ...prev]);
  };

  // Handle delete project
  const handleDeleteProject = (id: string) => {
    if (projects.length <= 1) return;
    const filtered = projects.filter((p) => p.id !== id);
    setProjects(filtered);
    if (currentProjectId === id) {
      setCurrentProjectId(filtered[0].id);
      setActiveProjectId(filtered[0].id);
    }
  };

  // Handle import project
  const handleImportProject = (imported: CinemaProject) => {
    setProjects((prev) => [imported, ...prev]);
    setCurrentProjectId(imported.id);
    setActiveProjectId(imported.id);
  };

  const isAr = lang === 'ar';

  return (
    <div className="min-h-screen bg-[#070709] text-stone-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Global Navigation Header */}
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

      {/* Main Studio Viewport */}
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

      {/* Smart Director Modal */}
      {showSmartDirector && (
        <SmartDirectorModal
          project={currentProject}
          onUpdateProject={handleUpdateCurrentProject}
          onClose={() => setShowSmartDirector(false)}
          lang={lang}
        />
      )}

      {/* Mobile Touch Bar for Android */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070709]/95 backdrop-blur-md border-t border-stone-800 py-1.5 px-2 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 text-[10px] ${
            activeTab === 'dashboard' ? 'text-amber-400 font-bold' : 'text-stone-400'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>{isAr ? 'المشاريع' : 'Films'}</span>
        </button>

        <button
          onClick={() => setActiveTab('auto_director')}
          className={`flex flex-col items-center gap-0.5 text-[10px] ${
            activeTab === 'auto_director' ? 'text-amber-400 font-bold' : 'text-stone-400'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{isAr ? 'المخرج' : 'Director'}</span>
        </button>

        <button
          onClick={() => setActiveTab('manual_studio')}
          className={`flex flex-col items-center gap-0.5 text-[10px] ${
            activeTab === 'manual_studio' ? 'text-amber-400 font-bold' : 'text-stone-400'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{isAr ? 'اللقطات' : 'Studio'}</span>
        </button>

        <button
          onClick={() => setActiveTab('characters')}
          className={`flex flex-col items-center gap-0.5 text-[10px] ${
            activeTab === 'characters' ? 'text-amber-400 font-bold' : 'text-stone-400'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{isAr ? 'الشخصيات' : 'Cast'}</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex flex-col items-center gap-0.5 text-[10px] ${
            activeTab === 'timeline' ? 'text-amber-400 font-bold' : 'text-stone-400'
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
            {isAr ? 'المطور الرئيسي والمالك:' : 'Lead Creator & Developer:'}{' '}
            <span className="text-amber-400 font-semibold">AMMAR ALNAMI — عمار النمي</span>
            {' '}| AI Assistant: ChatGPT (GT Assistant)
          </p>
        </div>
      </footer>
    </div>
  );
}
