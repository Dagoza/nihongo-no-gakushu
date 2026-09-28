'use client';

import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  BookOpen, 
  Layers, 
  Target, 
  Languages, 
  MessageSquare, 
  FileText, 
  BarChart3,
  Tv
} from 'lucide-react';

import Header from '../components/Header';
import AudioPlayerBar from '../components/AudioPlayerBar';
import CurriculumTab from '../components/CurriculumTab';
import StoryTab from '../components/StoryTab';
import VocabTab from '../components/VocabTab';
import GrammarTab from '../components/GrammarTab';
import KanjiTab from '../components/KanjiTab';
import ConversationTab from '../components/ConversationTab';
import MaterialLibraryTab from '../components/MaterialLibraryTab';
import ProgressTab from '../components/ProgressTab';
import YouTubeImmersionTab from '../components/YouTubeImmersionTab';

import { loadSavedState, saveState, getInitialState } from '../lib/storage';

export default function Home() {
  const [currentTab, setCurrentTab] = useState('curriculum');
  const [appState, setAppState] = useState(getInitialState());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = loadSavedState();
    setAppState(saved);
    if (saved.theme) {
      document.body.setAttribute('data-theme', saved.theme);
    }
    setMounted(true);
  }, []);

  const handleUpdateState = (newState) => {
    setAppState(newState);
    saveState(newState);
  };

  const handleToggleTheme = () => {
    const nextTheme = appState.theme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', nextTheme);
    const updated = { ...appState, theme: nextTheme };
    handleUpdateState(updated);
  };

  const tabs = [
    { id: 'curriculum', label: 'Ruta de Aprendizaje', icon: Compass },
    { id: 'story', label: 'Historia Interactiva', icon: BookOpen },
    { id: 'vocab', label: 'Vocabulario', icon: Layers },
    { id: 'particles', label: 'Partículas & Gramática', icon: Target },
    { id: 'kanji', label: 'Biblioteca Kanji', icon: Languages },
    { id: 'nhk', label: 'Conversación NHK', icon: MessageSquare },
    { id: 'youtube', label: 'Inmersión YouTube', icon: Tv },
    { id: 'pdf', label: 'Biblioteca de PDFs', icon: FileText },
    { id: 'progress', label: 'Mi Progreso', icon: BarChart3 },
  ];

  return (
    <>
      {/* Top Header */}
      <Header 
        stats={{
          streak: appState.streak || 1,
          xp: appState.xp || 0,
          level: Math.floor((appState.xp || 0) / 100) + 1
        }}
        theme={appState.theme || 'light'}
        onToggleTheme={handleToggleTheme}
      />

      {/* Navigation Tab Bar */}
      <nav className="nav-tabs-wrapper">
        <div className="nav-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                className={`nav-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setCurrentTab(tab.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Container */}
      <main className="main-container">
        {currentTab === 'curriculum' && (
          <CurriculumTab 
            appState={appState} 
            onUpdateState={handleUpdateState} 
            onNavigateTab={(tabId) => setCurrentTab(tabId)} 
          />
        )}

        {currentTab === 'story' && (
          <StoryTab 
            appState={appState} 
            onUpdateState={handleUpdateState} 
          />
        )}

        {currentTab === 'vocab' && (
          <VocabTab 
            appState={appState} 
            onUpdateState={handleUpdateState} 
          />
        )}

        {currentTab === 'particles' && (
          <GrammarTab 
            appState={appState} 
            onUpdateState={handleUpdateState} 
          />
        )}

        {currentTab === 'kanji' && (
          <KanjiTab 
            appState={appState} 
            onUpdateState={handleUpdateState} 
          />
        )}

        {currentTab === 'nhk' && (
          <ConversationTab 
            appState={appState} 
            onUpdateState={handleUpdateState} 
          />
        )}

        {currentTab === 'youtube' && (
          <YouTubeImmersionTab 
            appState={appState} 
            onUpdateState={handleUpdateState} 
          />
        )}

        {currentTab === 'pdf' && (
          <MaterialLibraryTab />
        )}

        {currentTab === 'progress' && (
          <ProgressTab 
            appState={appState} 
            onUpdateState={handleUpdateState} 
          />
        )}
      </main>

      {/* Persistent Audio Player Bar with Pause, Skip, Rewind, Click & Selection Speech */}
      <AudioPlayerBar />
    </>
  );
}
