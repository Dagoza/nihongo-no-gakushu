'use client';

import React from 'react';
import { AppProvider, useApp } from '../lib/AppContext';
import Header from './Header';
import NavigationTabs from './NavigationTabs';
import AudioPlayerBar from './AudioPlayerBar';
import AuthModal from './AuthModal';

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
    savedCount
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
      />

      {/* Modern Navigation Tab Bar with Categories, Mega-Menu & Overflow Controls */}
      <NavigationTabs 
        currentTab={currentTab} 
        onTabChange={(tabId) => navigate(tabId)} 
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
