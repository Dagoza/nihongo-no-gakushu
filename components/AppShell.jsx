'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { AppProvider, useApp } from '../lib/AppContext';
import Header from './Header';
import NavigationTabs from './NavigationTabs';
import AudioPlayerBar from './AudioPlayerBar';
import UIModal from './UIModal';

// Lazy loading con code-splitting para componentes de alto peso e impacto
const AuthModal = dynamic(() => import('./AuthModal'), { ssr: false });
const ProductTour = dynamic(() => import('./ProductTour'), { ssr: false });
const PracticePadModal = dynamic(() => import('./PracticePadModal'), { ssr: false });
const DictionaryModal = dynamic(() => import('./DictionaryModal'), { ssr: false });
const SettingsModal = dynamic(() => import('./SettingsModal'), { ssr: false });
const DailyGoalModal = dynamic(() => import('./DailyGoalModal'), { ssr: false });
const NotificationSettingsModal = dynamic(() => import('./NotificationSettingsModal'), { ssr: false });


function AppShellContent({ children }) {
  const {
    appState,
    handleUpdateState,
    theme,
    onToggleTheme,
    currentTab,
    navigate,
    authUser,
    isAuthModalOpen,
    setIsAuthModalOpen,
    syncStatus,
    syncInfo,
    handleAuthSuccess,
    handleSignOut,
    handleTriggerSync,
    savedCount,
    uiModal,
    closeUiModal,
    isTourOpen,
    tourInitialStep,
    openTour,
    closeTour,
    handleSkipTour,
    handleCompleteTour,
    practicePadState,
    closePracticePad,
    dictionaryState,
    closeDictionary,
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    isDailyGoalModalOpen,
    closeDailyGoalModal,
    isNotificationSettingsOpen,
    closeNotificationSettings
  } = useApp();


  // Ensure horizontal scroll position is strictly locked to 0 on mobile/desktop tab navigation
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.scrollX !== 0) {
      window.scrollTo({ left: 0 });
    }
  }, [currentTab]);

  return (
    <>
      {/* Top Header */}
      <Header 
        stats={{
          streak: appState.streak || 1,
          xp: appState.xp || 0,
          level: Math.floor((appState.xp || 0) / 100) + 1,
          particles: Object.values(appState.masteredParticles || {}).filter(Boolean).length,
          totalParticles: 99,
          vocab: Object.values(appState.masteredVocab || {}).filter(Boolean).length
        }}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onNavigate={navigate}
        syncStatus={syncStatus}
        syncInfo={syncInfo}
        authUser={authUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        onTriggerSync={handleTriggerSync}
        userState={appState}
        onOpenTour={openTour}
      />

      {/* Modern Navigation Tab Bar with Categories, Mega-Menu & Overflow Controls */}
      <NavigationTabs 
        currentTab={currentTab} 
        savedCount={savedCount}
      />

      {/* Main Container */}
      <main className="main-container">
        {children}
      </main>

      {/* Persistent Audio Player Bar with Pause, Skip, Rewind, Click & Selection Speech */}
      <AudioPlayerBar 
        appState={appState}
        onUpdateState={handleUpdateState}
        onNavigate={navigate}
      />

      {/* Modal de Autenticación de Usuario Seguro */}
      {isAuthModalOpen && (
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          onAuthSuccess={handleAuthSuccess} 
        />
      )}

      {/* Modal Global Amigable para Avisos y Confirmaciones (Cero alerts) */}
      <UIModal 
        isOpen={uiModal?.isOpen}
        onClose={closeUiModal}
        title={uiModal?.title}
        message={uiModal?.message}
        type={uiModal?.type}
        confirmText={uiModal?.confirmText}
        cancelText={uiModal?.cancelText}
        isDestructive={uiModal?.isDestructive}
        actionLabel={uiModal?.actionLabel}
        onAction={uiModal?.onAction}
      />

      {/* Onboarding Tour / Product Tour Interactivo y Animado */}
      {isTourOpen && (
        <ProductTour 
          isOpen={isTourOpen}
          initialStep={tourInitialStep}
          onClose={closeTour}
          onSkip={handleSkipTour}
          onComplete={handleCompleteTour}
          onNavigate={navigate}
        />
      )}

      {/* Cuaderno de Caligrafía, Cuadrículas y Práctica de Trazos */}
      {practicePadState?.isOpen && (
        <PracticePadModal 
          isOpen={practicePadState.isOpen}
          onClose={closePracticePad}
          initialText={practicePadState.text}
          initialKana={practicePadState.kana}
          initialTitle={practicePadState.title}
          initialSource={practicePadState.source}
          initialChar={practicePadState.initialChar}
          initialGhostOpacity={practicePadState.ghostOpacity}
          initialTab={practicePadState.initialTab}
          cloudSavedSheets={appState?.savedPracticeSheets}
          onSaveToCloud={(sheet) => {
            if (appState && handleUpdateState) {
              const currentList = appState.savedPracticeSheets || [];
              const nextList = [sheet, ...currentList.filter(s => s.id !== sheet.id)];
              handleUpdateState({
                ...appState,
                savedPracticeSheets: nextList
              });
            }
          }}
          onDeleteFromCloud={(sheetId) => {
            if (appState && handleUpdateState) {
              const currentList = appState.savedPracticeSheets || [];
              const nextList = currentList.filter(s => s.id !== sheetId);
              handleUpdateState({
                ...appState,
                savedPracticeSheets: nextList
              });
            }
          }}
        />
      )}

      {/* Diccionario Rápido y Desarticulador Morfológico */}
      {dictionaryState?.isOpen && (
        <DictionaryModal 
          isOpen={dictionaryState.isOpen}
          onClose={closeDictionary}
          initialSearch={dictionaryState.search}
        />
      )}

      {/* Configuración Global del Sistema (Voz TTS, velocidad, etc.) */}
      {isSettingsModalOpen && (
        <SettingsModal 
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
        />
      )}

      {/* Modal de Meta Diaria / Reto Diario (Daily Goal Challenge) */}
      {isDailyGoalModalOpen && (
        <DailyGoalModal 
          isOpen={isDailyGoalModalOpen}
          onClose={closeDailyGoalModal}
        />
      )}

      {/* Modal de Recordatorios y Notificaciones del Día */}
      {isNotificationSettingsOpen && (
        <NotificationSettingsModal 
          isOpen={isNotificationSettingsOpen}
          onClose={closeNotificationSettings}
        />
      )}
    </>

  );
}

export default function AppShell({ children }) {
  return (
    <AppProvider>
      <AppShellContent>
        {children}
      </AppShellContent>
    </AppProvider>
  );
}
