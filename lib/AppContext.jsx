'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { loadSavedState, saveState, getInitialState } from './storage';
import { 
  isSupabaseConfigured, 
  executeFullSync, 
  getAuthUser, 
  signOutUser, 
  subscribeToAuthChanges,
  extractUserProfile 
} from './supabaseSync';

export const AppContext = createContext(null);

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export function AppProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [appState, setAppState] = useState(getInitialState());
  const [mounted, setMounted] = useState(false);
  const [activeStoryId, setActiveStoryId] = useState('story_1');

  // Supabase Auth and Sync State
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
        saveState(res.mergedState, false); // Guardar en localStorage sin loop
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

    // Initial auth check
    getAuthUser().then((user) => {
      if (user) {
        const profile = extractUserProfile(user);
        setAuthUser(profile);
      }
    });

    // Initial sync
    if (isSupabaseConfigured()) {
      handleTriggerSync(saved);
    } else {
      setSyncStatus('unconfigured');
      setSyncInfo('Modo local');
    }

    // Subscribe to auth state changes
    const { data: { subscription } } = subscribeToAuthChanges(async (event, session) => {
      const profile = session?.user ? extractUserProfile(session.user) : null;
      setAuthUser(profile);
      if (profile && profile.provider === 'google') {
        setAppState(prev => ({ ...prev, googleAccount: profile }));
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        handleTriggerSync();
      } else if (event === 'SIGNED_OUT') {
        setSyncStatus('unconfigured');
        setSyncInfo('Modo local (Sesión cerrada)');
      }
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isSupabaseConfigured()) {
        handleTriggerSync();
      }
    };

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

  const handleUpdateState = useCallback((newState) => {
    setAppState(newState);
    saveState(newState, true);
  }, []);

  const handleToggleTheme = useCallback(() => {
    setAppState(prev => {
      const nextTheme = prev.theme === 'dark' ? 'light' : 'dark';
      document.body.setAttribute('data-theme', nextTheme);
      const updated = { ...prev, theme: nextTheme };
      saveState(updated, true);
      return updated;
    });
  }, []);

  const handleSignOut = useCallback(async () => {
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
  }, []);

  const handleAuthSuccess = useCallback((user) => {
    setAuthUser(user);
    handleTriggerSync();
  }, [handleTriggerSync]);

  // Unified router navigation helper
  const navigate = useCallback((tabOrPath, extraParam = null) => {
    let target = tabOrPath;
    if (target === 'particles') target = 'grammar';
    if (!target.startsWith('/')) {
      target = '/' + target;
    }
    if (extraParam) {
      if (target === '/story') {
        target += `?id=${encodeURIComponent(extraParam)}`;
      } else if (target === '/curriculum') {
        target += `?step=${encodeURIComponent(extraParam)}`;
      } else if (target === '/kanji') {
        target += `?draw=${encodeURIComponent(extraParam)}`;
      }
    }
    router.push(target);
  }, [router]);

  // Determine current active tab ID from current pathname
  const currentTab = (() => {
    if (!pathname) return 'curriculum';
    if (pathname.startsWith('/story')) return 'story';
    if (pathname.startsWith('/nhk')) return 'nhk';
    if (pathname.startsWith('/youtube')) return 'youtube';
    if (pathname.startsWith('/vocab')) return 'vocab';
    if (pathname.startsWith('/grammar') || pathname.startsWith('/particles')) return 'particles';
    if (pathname.startsWith('/kanji')) return 'kanji';
    if (pathname.startsWith('/pdf')) return 'pdf';
    if (pathname.startsWith('/saved')) return 'saved';
    if (pathname.startsWith('/progress')) return 'progress';
    if (pathname.startsWith('/curriculum')) return 'curriculum';
    return 'curriculum';
  })();

  const savedCount = (appState?.savedWords?.length || 0) + (appState?.savedPhrases?.length || 0);

  const contextValue = {
    appState,
    handleUpdateState,
    onUpdateState: handleUpdateState,
    userState: appState,
    theme: appState.theme || 'light',
    onToggleTheme: handleToggleTheme,
    currentTab,
    navigate,
    onNavigate: navigate,
    activeStoryId,
    setActiveStoryId,
    authUser,
    isAuthModalOpen,
    setIsAuthModalOpen,
    syncStatus,
    syncInfo,
    handleTriggerSync,
    onTriggerSync: handleTriggerSync,
    handleSignOut,
    onSignOut: handleSignOut,
    handleAuthSuccess,
    savedCount,
    mounted
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}
