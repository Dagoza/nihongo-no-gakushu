'use client';

import React from 'react';
import { AppProvider, useApp } from '../lib/AppContext';
import Header from './Header';
import NavigationTabs from './NavigationTabs';
import AudioPlayerBar from './AudioPlayerBar';
import AuthModal from './AuthModal';
import UIModal from './UIModal';
import ProductTour from './ProductTour';
import PracticePadModal from './PracticePadModal';
import DictionaryModal from './DictionaryModal';
import SettingsModal from './SettingsModal';

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
    setIsSettingsModalOpen
  } = useApp();

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
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onAuthSuccess={handleAuthSuccess} 
      />

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
      <ProductTour 
        isOpen={isTourOpen}
        initialStep={tourInitialStep}
        onClose={closeTour}
        onSkip={handleSkipTour}
        onComplete={handleCompleteTour}
        onNavigate={navigate}
      />

      {/* Cuaderno de Caligrafía, Cuadrículas y Práctica de Trazos */}
      <PracticePadModal 
        isOpen={practicePadState?.isOpen}
        onClose={closePracticePad}
        initialText={practicePadState?.text}
        initialKana={practicePadState?.kana}
        initialTitle={practicePadState?.title}
        initialSource={practicePadState?.source}
        initialChar={practicePadState?.initialChar}
        initialGhostOpacity={practicePadState?.ghostOpacity}
        initialTab={practicePadState?.initialTab}
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
      />

      {/* Diccionario Rápido y Desarticulador Morfológico */}
      <DictionaryModal 
        isOpen={dictionaryState?.isOpen}
        onClose={closeDictionary}
        initialSearch={dictionaryState?.search}
      />

      {/* Configuración Global del Sistema (Voz TTS, velocidad, etc.) */}
      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
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
