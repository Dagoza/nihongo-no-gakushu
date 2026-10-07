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
import { checkAllScheduledActivities } from './notificationManager';

export const AppContext = createContext(null);

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export const useAppContext = useApp;

export function AppProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [appState, setAppState] = useState(getInitialState());
  const [mounted, setMounted] = useState(false);
  const [activeStoryId, setActiveStoryId] = useState('story_1');

  // Supabase Auth and Sync State
  const [authUser, setAuthUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState('local'); // 'local' | 'synced' | 'syncing' | 'error'
  const [syncInfo, setSyncInfo] = useState('Modo local (Sin cuenta)');

  const authUserRef = useRef(authUser);
  authUserRef.current = authUser;

  // Onboarding Tour / Product Tour
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [tourInitialStep, setTourInitialStep] = useState(null);

  const openTour = useCallback((targetStep = null) => {
    setTourInitialStep(targetStep || null);
    setIsTourOpen(true);
  }, []);

  const openTourRef = useRef(openTour);
  openTourRef.current = openTour;

  const closeTour = useCallback(() => {
    setIsTourOpen(false);
    setTourInitialStep(null);
  }, []);

  const handleSkipTour = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('nihongo_tour_seen_v1', 'true');
        localStorage.setItem('nihongo_tour_seen_v2', 'true');
        const user = authUserRef.current;
        if (user?.id || user?.email) {
          localStorage.setItem(`nihongo_tour_seen_${user.id || user.email}_v2`, 'true');
        }
      } catch {}
    }
    setIsTourOpen(false);
  }, []);

  const handleCompleteTour = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('nihongo_tour_seen_v1', 'true');
        localStorage.setItem('nihongo_tour_seen_v2', 'true');
        const user = authUserRef.current;
        if (user?.id || user?.email) {
          localStorage.setItem(`nihongo_tour_seen_${user.id || user.email}_v2`, 'true');
        }
      } catch {}
    }
    setIsTourOpen(false);
  }, []);

  const triggerAutoTourIfNeeded = useCallback((profile = null) => {
    if (typeof window === 'undefined') return;
    try {
      const userKey = (profile?.id || profile?.email)
        ? `nihongo_tour_seen_${profile.id || profile.email}_v2`
        : null;
      
      const userSeen = userKey ? (localStorage.getItem(userKey) === 'true') : false;
      const globalSeen = localStorage.getItem('nihongo_tour_seen_v2') === 'true';

      const shouldShow = userKey ? !userSeen : !globalSeen;
      if (shouldShow) {
        setIsTourOpen(true);
      }
    } catch {}
  }, []);
  
  // Cuaderno de Práctica & Caligrafía (Notepad / Cuadrícula de Trazos)
  const [practicePadState, setPracticePadState] = useState({
    isOpen: false,
    text: '',
    kana: '',
    title: '',
    source: 'custom',
    initialChar: '',
    ghostOpacity: undefined,
    initialTab: 'canvas'
  });

  const openPracticePad = useCallback(({ text = '', kana = '', title = '', source = 'custom', initialChar = '', ghostOpacity = undefined, initialTab = 'canvas' } = {}) => {
    setPracticePadState({
      isOpen: true,
      text,
      kana,
      title: title || (text ? `Práctica: ${text}` : (source === 'free' ? 'Cuaderno Libre' : 'Cuaderno de Caligrafía')),
      source,
      initialChar,
      ghostOpacity: ghostOpacity !== undefined ? ghostOpacity : (source === 'free' ? 0 : 35),
      initialTab
    });
  }, []);

  const closePracticePad = useCallback(() => {
    setPracticePadState(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Diccionario Rápido & Análisis Morfológico
  const [dictionaryState, setDictionaryState] = useState({
    isOpen: false,
    search: ''
  });

  const openDictionary = useCallback((initialSearch = '') => {
    setDictionaryState({
      isOpen: true,
      search: typeof initialSearch === 'string' ? initialSearch : ''
    });
  }, []);

  const closeDictionary = useCallback(() => {
    setDictionaryState(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Modal de Configuración Global (Voz TTS, velocidad, motor)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Modal de Meta Diaria / Reto Diario (Daily Goal Challenge)
  const [isDailyGoalModalOpen, setIsDailyGoalModalOpen] = useState(false);

  const openDailyGoalModal = useCallback(() => {
    setIsDailyGoalModalOpen(true);
  }, []);

  const closeDailyGoalModal = useCallback(() => {
    setIsDailyGoalModalOpen(false);
  }, []);

  // Modal de Recordatorios y Notificaciones del Día
  const [isNotificationSettingsOpen, setIsNotificationSettingsOpen] = useState(false);

  const openNotificationSettings = useCallback(() => {
    setIsNotificationSettingsOpen(true);
  }, []);

  const closeNotificationSettings = useCallback(() => {
    setIsNotificationSettingsOpen(false);
  }, []);

  // Manejar parámetro URL ?daily_goal=1 y eventos de Service Worker para notificaciones móviles
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('daily_goal') === '1') {
        setIsDailyGoalModalOpen(true);
      }
    } catch {}

    if ('serviceWorker' in navigator) {
      const handleSwMessage = (event) => {
        if (event.data?.type === 'OPEN_DAILY_GOAL') {
          setIsDailyGoalModalOpen(true);
        } else if (event.data?.type === 'NAVIGATE_URL' && event.data?.url) {
          router.push(event.data.url);
        } else if (event.data?.type === 'TRIGGER_NOTIFICATION_CHECK') {
          checkAllScheduledActivities(appStateRef.current);
        }
      };
      navigator.serviceWorker.addEventListener('message', handleSwMessage);
      return () => navigator.serviceWorker.removeEventListener('message', handleSwMessage);
    }
  }, [router]);

  // Verificar y programar recordatorios de estudio a lo largo del día en móvil y escritorio
  useEffect(() => {
    if (!mounted) return;

    // Comprobación inicial al montar
    checkAllScheduledActivities(appStateRef.current);

    // Revisar cada 60 segundos si alguna actividad cumple su hora programada
    const intervalId = setInterval(() => {
      checkAllScheduledActivities(appStateRef.current);
    }, 60000);

    const handleFocusOrVisible = () => {
      if (document.visibilityState === 'visible') {
        checkAllScheduledActivities(appStateRef.current);
      }
    };

    document.addEventListener('visibilitychange', handleFocusOrVisible);
    window.addEventListener('focus', handleFocusOrVisible);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleFocusOrVisible);
      window.removeEventListener('focus', handleFocusOrVisible);
    };
  }, [mounted]);


  // Modal amigable para alertas, avisos y confirmaciones (Reemplazo total de alert() y confirm())
  const [uiModal, setUiModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: 'Entendido',
    cancelText: null,
    isDestructive: false,
    actionLabel: null,
    onAction: null,
    resolve: null
  });

  const closeUiModal = useCallback((result = false) => {
    setUiModal(prev => {
      if (prev.resolve) {
        prev.resolve(result);
      }
      return { ...prev, isOpen: false, resolve: null };
    });
  }, []);

  const showAlert = useCallback((optionsOrMsg) => {
    return new Promise((resolve) => {
      const config = typeof optionsOrMsg === 'string'
        ? { message: optionsOrMsg }
        : (optionsOrMsg || {});
      setUiModal({
        isOpen: true,
        title: config.title || (config.type === 'lock' ? 'Acceso con Sesión' : config.type === 'error' ? 'Error' : config.type === 'success' ? '¡Éxito!' : config.type === 'warning' ? 'Atención' : 'Aviso'),
        message: config.message || '',
        type: config.type || 'info',
        confirmText: config.confirmText || 'Entendido',
        cancelText: null,
        isDestructive: false,
        actionLabel: config.actionLabel || null,
        onAction: config.onAction || null,
        resolve: () => resolve(true)
      });
    });
  }, []);

  const showConfirm = useCallback((optionsOrMsg) => {
    return new Promise((resolve) => {
      const config = typeof optionsOrMsg === 'string'
        ? { message: optionsOrMsg }
        : (optionsOrMsg || {});
      setUiModal({
        isOpen: true,
        title: config.title || '¿Estás seguro?',
        message: config.message || '',
        type: config.type || 'confirm',
        confirmText: config.confirmText || 'Confirmar',
        cancelText: config.cancelText || 'Cancelar',
        isDestructive: config.isDestructive ?? true,
        actionLabel: config.actionLabel || null,
        onAction: config.onAction || null,
        resolve: (val) => resolve(Boolean(val))
      });
    });
  }, []);

  const appStateRef = useRef(appState);
  appStateRef.current = appState;

  const handleTriggerSync = useCallback(async (stateToSync = null) => {
    if (!isSupabaseConfigured()) {
      setSyncStatus('local');
      setSyncInfo('Modo local');
      return;
    }

    // Si el usuario no ha iniciado sesión, mostrar solo datos locales y no llamar a la BD
    const user = await getAuthUser();
    if (!user) {
      setSyncStatus('local');
      setSyncInfo('Modo local (Sin cuenta)');
      return;
    }

    setSyncStatus('syncing');
    setSyncInfo('Sincronizando con la nube...');

    try {
      const baseState = stateToSync || appStateRef.current;
      const res = await executeFullSync(baseState);

      if (res.success) {
        setAppState(res.mergedState);
        saveState(res.mergedState, false); // Guardar en localStorage sin loop
        if (Array.isArray(res.mergedState.savedPracticeSheets) && res.mergedState.savedPracticeSheets.length > 0) {
          try {
            localStorage.setItem('nihongo_saved_sheets_v2', JSON.stringify(res.mergedState.savedPracticeSheets));
          } catch {}
        }
        setSyncStatus('synced');
        const now = new Date();
        setSyncInfo(res.message || `Sincronizado a las ${now.toLocaleTimeString()}`);
      } else if (res.reason === 'unauthenticated') {
        setSyncStatus('local');
        setSyncInfo('Modo local (Inicia sesión para sincronizar)');
      } else {
        setSyncStatus('error');
        setSyncInfo(res.message || 'Error al sincronizar');
      }
    } catch {
      setSyncStatus('error');
      setSyncInfo('Fallo de conexión al sincronizar');
    }
  }, []);

  useEffect(() => {
    const saved = loadSavedState();
    try {
      const localSheetsRaw = localStorage.getItem('nihongo_saved_sheets_v2');
      if (localSheetsRaw) {
        const localSheets = JSON.parse(localSheetsRaw);
        if (Array.isArray(localSheets) && localSheets.length > 0) {
          const map = new Map();
          [...(saved.savedPracticeSheets || []), ...localSheets].forEach((s) => {
            if (s && s.id && !map.has(s.id)) map.set(s.id, s);
          });
          saved.savedPracticeSheets = Array.from(map.values());
        }
      }
    } catch {}

    setAppState(saved);
    if (saved.theme) {
      document.body.setAttribute('data-theme', saved.theme);
    }
    setMounted(true);

    // Global manual tour triggers (fallback for any child component or event)
    const handleCustomOpenTour = (e) => {
      const step = e?.detail?.step || null;
      if (openTourRef.current) {
        openTourRef.current(step);
      } else {
        setTourInitialStep(step);
        setIsTourOpen(true);
      }
    };
    if (typeof window !== 'undefined') {
      window.__nihongoOpenTour = (step = null) => {
        if (openTourRef.current) {
          openTourRef.current(step);
        } else {
          setTourInitialStep(step || null);
          setIsTourOpen(true);
        }
      };
      window.addEventListener('nihongo-open-tour', handleCustomOpenTour);
      window.__nihongoOpenPracticePad = openPracticePad;
      window.__nihongoOpenDailyGoal = openDailyGoalModal;
      window.__nihongoOpenNotifications = openNotificationSettings;
      window.__nihongoOpenDictionary = openDictionary;
      window.__nihongoOpenSettings = () => setIsSettingsModalOpen(true);
      window.__nihongoOpenAuth = () => setIsAuthModalOpen(true);
      window.__nihongoShowAlert = showAlert;
      window.__nihongoShowConfirm = showConfirm;
    }

    let tourTimer = null;

    // Initial auth check
    getAuthUser().then((user) => {
      if (user) {
        const profile = extractUserProfile(user);
        setAuthUser(profile);
        handleTriggerSync(saved);
        tourTimer = setTimeout(() => {
          triggerAutoTourIfNeeded(profile);
        }, 1000);
      } else {
        setSyncStatus('local');
        setSyncInfo('Modo local (Sin cuenta)');
        tourTimer = setTimeout(() => {
          triggerAutoTourIfNeeded(null);
        }, 1000);
      }
    }).catch(() => {
      tourTimer = setTimeout(() => {
        triggerAutoTourIfNeeded(null);
      }, 1000);
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = subscribeToAuthChanges(async (event, session) => {
      const profile = session?.user ? extractUserProfile(session.user) : null;
      setAuthUser(profile);
      if (profile && profile.provider === 'google') {
        setAppState(prev => ({ ...prev, googleAccount: profile }));
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        handleTriggerSync();
        if (event === 'SIGNED_IN' && profile) {
          setTimeout(() => {
            triggerAutoTourIfNeeded(profile);
          }, 1200);
        }
      } else if (event === 'SIGNED_OUT') {
        setSyncStatus('local');
        setSyncInfo('Modo local (Sesión cerrada)');
      }
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        getAuthUser().then((user) => {
          if (user) handleTriggerSync();
        });
      }
    };

    const handleOnline = () => {
      getAuthUser().then((user) => {
        if (user) handleTriggerSync();
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    return () => {
      if (tourTimer) clearTimeout(tourTimer);
      if (typeof window !== 'undefined') {
        window.removeEventListener('nihongo-open-tour', handleCustomOpenTour);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, [handleTriggerSync, triggerAutoTourIfNeeded]);

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
    const ok = await showConfirm({
      title: '¿Cerrar Sesión?',
      message: '¿Deseas cerrar la sesión en este dispositivo? Tus datos se conservarán seguros en tu cuenta en la nube.',
      confirmText: 'Cerrar Sesión',
      cancelText: 'Cancelar',
      isDestructive: false
    });
    if (ok) {
      try {
        await signOutUser();
        setAuthUser(null);
        setSyncStatus('local');
        setSyncInfo('Modo local (Sesión cerrada)');
      } catch (err) {
        console.error('Error al cerrar sesión:', err);
      }
    }
  }, [showConfirm]);

  const handleAuthSuccess = useCallback((user) => {
    setAuthUser(user);
    handleTriggerSync();
  }, [handleTriggerSync]);

  // Unified router navigation helper
  const navigate = useCallback((tabOrPath, extraParam = null) => {
    let target = tabOrPath;
    if (target === 'particles') target = 'grammar';
    if (target === 'stories') target = 'story';
    if (!target.startsWith('/')) {
      target = '/' + target;
    }
    if (extraParam) {
      if (target === '/story') {
        target += `?id=${encodeURIComponent(extraParam)}`;
      } else if (target === '/curriculum') {
        const paramStr = String(extraParam);
        if (paramStr.includes('#')) {
          const [stepPart, hashPart] = paramStr.split('#');
          target += `?step=${encodeURIComponent(stepPart)}#${hashPart}`;
        } else {
          target += `?step=${encodeURIComponent(paramStr)}`;
        }
      } else if (target === '/kanji') {
        target += `?draw=${encodeURIComponent(extraParam)}`;
      } else if (target === '/nhk') {
        target += `?lesson=${encodeURIComponent(extraParam)}&tab=practice`;
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
    mounted,
    // Onboarding Tour / Product Tour
    isTourOpen,
    setIsTourOpen,
    tourInitialStep,
    openTour,
    closeTour,
    handleSkipTour,
    handleCompleteTour,
    // Sistema global de alertas y confirmaciones amigables
    showAlert,
    showConfirm,
    uiModal,
    closeUiModal,
    // Cuaderno de Práctica & Caligrafía
    practicePadState,
    openPracticePad,
    closePracticePad,
    // Diccionario Rápido & Análisis Morfológico
    dictionaryState,
    openDictionary,
    closeDictionary,
    // Modal de Configuración Global
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    // Modal de Meta Diaria / Reto Diario
    isDailyGoalModalOpen,
    openDailyGoalModal,
    closeDailyGoalModal,
    // Modal de Recordatorios y Notificaciones del Día
    isNotificationSettingsOpen,
    setIsNotificationSettingsOpen,
    openNotificationSettings,
    closeNotificationSettings
  };


  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}
