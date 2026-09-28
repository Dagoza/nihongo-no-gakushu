'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

import Header from '../components/Header';
import NavigationTabs from '../components/NavigationTabs';
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
import SavedTab from '../components/SavedTab';

import { loadSavedState, saveState, getInitialState } from '../lib/storage';
import { isSupabaseConfigured, executeFullSync } from '../lib/supabaseSync';

export default function Home() {
  const [currentTab, setCurrentTab] = useState('curriculum');
  const [activeStoryId, setActiveStoryId] = useState('story_1');
  const [appState, setAppState] = useState(getInitialState());
  const [mounted, setMounted] = useState(false);

  // Estados de sincronización en la nube
  const [syncStatus, setSyncStatus] = useState('unconfigured'); // 'unconfigured' | 'synced' | 'syncing' | 'error'
  const [syncInfo, setSyncInfo] = useState('');
  const appStateRef = useRef(appState);
  appStateRef.current = appState;

  const handleTriggerSync = useCallback(async (stateToSync = null, targetCode = null) => {
    if (!isSupabaseConfigured()) {
      setSyncStatus('unconfigured');
      setSyncInfo('Modo Local (Supabase sin configurar)');
      return;
    }

    setSyncStatus('syncing');
    setSyncInfo('Sincronizando con la nube...');

    try {
      const baseState = stateToSync || appStateRef.current;
      const res = await executeFullSync(baseState, targetCode);

      if (res.success) {
        setAppState(res.mergedState);
        saveState(res.mergedState, false); // Guardar en localStorage sin disparar loop de subida
        setSyncStatus('synced');
        const now = new Date();
        setSyncInfo(`Sincronizado a las ${now.toLocaleTimeString()}`);
      } else {
        setSyncStatus('error');
        setSyncInfo(res.message || 'Error al sincronizar');
      }
    } catch (e) {
      setSyncStatus('error');
      setSyncInfo('Fallo de conexión al sincronizar');
    }
  }, []);

  useEffect(() => {
    const saved = loadSavedState();
    setAppState(saved);
    if (saved.theme) {
      document.body.setAttribute('data-theme', saved.theme);
    }
    setMounted(true);

    // Inicializar sincronización si está configurado
    if (isSupabaseConfigured()) {
      handleTriggerSync(saved);
    } else {
      setSyncStatus('unconfigured');
      setSyncInfo('Modo local');
    }

    // Auto-sincronizar al volver a la pestaña (cambio de dispositivo o ventana)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isSupabaseConfigured()) {
        handleTriggerSync();
      }
    };

    // Auto-sincronizar al reconectarse a internet
    const handleOnline = () => {
      if (isSupabaseConfigured()) {
        handleTriggerSync();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [handleTriggerSync]);

  const handleUpdateState = (newState) => {
    setAppState(newState);
    saveState(newState, true); // Guarda en localStorage y programa sync debounced
  };

  const handleToggleTheme = () => {
    const nextTheme = appState.theme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', nextTheme);
    const updated = { ...appState, theme: nextTheme };
    handleUpdateState(updated);
  };

  return (
    <>
      {/* Top Header */}
      <Header 
        stats={{
          streak: appState.streak || 1,
          xp: appState.xp || 0,
          level: Math.floor((appState.xp || 0) / 100) + 1,
          particles: Object.values(appState.masteredParticles || {}).filter(Boolean).length,
          vocab: Object.values(appState.masteredVocab || {}).filter(Boolean).length
        }}
        theme={appState.theme || 'light'}
        onToggleTheme={handleToggleTheme}
        onNavigate={(tab) => setCurrentTab(tab)}
        syncStatus={syncStatus}
        syncInfo={syncInfo}
      />

      {/* Modern Navigation Tab Bar with Categories, Mega-Menu & Overflow Controls */}
      <NavigationTabs 
        currentTab={currentTab} 
        onTabChange={(tabId) => setCurrentTab(tabId)} 
        savedCount={(appState.savedCustomVocab?.length || 0) + (appState.savedPhrases?.length || 0)}
      />

      {/* Main Container */}
      <main className="main-container">
        {currentTab === 'curriculum' && (
          <CurriculumTab 
            appState={appState} 
            userState={appState}
            onUpdateState={handleUpdateState} 
            onNavigate={(tabId) => setCurrentTab(tabId)} 
          />
        )}

        {currentTab === 'story' && (
          <StoryTab 
            appState={appState} 
            onUpdateState={handleUpdateState} 
            activeStoryId={activeStoryId}
            onSelectStory={(id) => setActiveStoryId(id)}
            onNavigate={(tabId) => setCurrentTab(tabId)}
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

        {currentTab === 'saved' && (
          <SavedTab 
            appState={appState} 
            onUpdateState={handleUpdateState}
            onNavigate={(tabId, storyId) => {
              if (storyId) setActiveStoryId(storyId);
              setCurrentTab(tabId);
            }}
          />
        )}

        {currentTab === 'progress' && (
          <ProgressTab 
            appState={appState} 
            onUpdateState={handleUpdateState}
            syncStatus={syncStatus}
            syncInfo={syncInfo}
            onTriggerSync={handleTriggerSync}
          />
        )}
      </main>

      {/* Persistent Audio Player Bar with Pause, Skip, Rewind, Click & Selection Speech */}
      <AudioPlayerBar 
        appState={appState}
        onUpdateState={handleUpdateState}
        onNavigate={(tabId) => setCurrentTab(tabId)}
      />
    </>
  );
}
