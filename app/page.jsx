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
import AuthModal from '../components/AuthModal';

import { loadSavedState, saveState, getInitialState } from '../lib/storage';
import { 
  isSupabaseConfigured, 
  executeFullSync, 
  getAuthUser, 
  signOutUser, 
  subscribeToAuthChanges 
} from '../lib/supabaseSync';

export default function Home() {
  const [currentTab, setCurrentTab] = useState('curriculum');
  const [activeStoryId, setActiveStoryId] = useState('story_1');
  const [appState, setAppState] = useState(getInitialState());
  const [mounted, setMounted] = useState(false);

  // Estados de sesión de usuario y sincronización
  const [authUser, setAuthUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
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
        setSyncInfo(res.message || `Sincronizado a las ${now.toLocaleTimeString()}`);
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

    // Obtener usuario autenticado inicial
    getAuthUser().then((user) => {
      if (user) {
        setAuthUser(user);
      }
    });

    // Inicializar sincronización inicial
    if (isSupabaseConfigured()) {
      handleTriggerSync(saved);
    } else {
      setSyncStatus('unconfigured');
      setSyncInfo('Modo local');
    }

    // Escuchar cambios de estado en Supabase Auth
    const { data: { subscription } } = subscribeToAuthChanges(async (event, session) => {
      const user = session?.user || null;
      setAuthUser(user);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        handleTriggerSync();
      } else if (event === 'SIGNED_OUT') {
        setSyncStatus('unconfigured');
        setSyncInfo('Modo local (Sesión cerrada)');
      }
    });

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
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }
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

  const handleSignOut = async () => {
    if (confirm('¿Deseas cerrar la sesión en este dispositivo? Tus datos se conservarán en tu cuenta en la nube.')) {
      try {
        await signOutUser();
        setAuthUser(null);
        setSyncStatus('unconfigured');
        setSyncInfo('Modo local (Sesión cerrada)');
      } catch (err) {
        console.error('Error al cerrar sesión:', err);
      }
    }
  };

  const handleAuthSuccess = (user) => {
    setAuthUser(user);
    handleTriggerSync();
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
        authUser={authUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Modern Navigation Tab Bar with Categories, Mega-Menu & Overflow Controls */}
      <NavigationTabs 
        currentTab={currentTab} 
        onTabChange={(tabId) => setCurrentTab(tabId)} 
      />

      {/* Main Container */}
      <main className="main-container">
        {currentTab === 'curriculum' && (
          <CurriculumTab 
            appState={appState} 
            userState={appState}
            onUpdateState={handleUpdateState} 
            onNavigate={(tabId, storyId) => {
              if (storyId) setActiveStoryId(storyId);
              setCurrentTab(tabId);
            }} 
          />
        )}

        {currentTab === 'story' && (
          <StoryTab 
            appState={appState} 
            onUpdateState={handleUpdateState} 
            activeStoryId={activeStoryId}
            onSelectStory={(storyId) => setActiveStoryId(storyId)}
            onNavigate={(tabId, storyId) => {
              if (storyId) setActiveStoryId(storyId);
              setCurrentTab(tabId);
            }}
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
            authUser={authUser}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onSignOut={handleSignOut}
          />
        )}
      </main>

      {/* Persistent Audio Player Bar with Pause, Skip, Rewind, Click & Selection Speech */}
      <AudioPlayerBar 
        appState={appState}
        onUpdateState={handleUpdateState}
        onNavigate={(tabId) => setCurrentTab(tabId)}
      />

      {/* Modal de Autenticación de Usuario Seguro */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onAuthSuccess={handleAuthSuccess} 
      />
    </>
  );
}
