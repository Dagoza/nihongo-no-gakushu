'use client';

import React from 'react';
import TextSelectionPopup from './TextSelectionPopup';
import FloatingMiniPlayer from './FloatingMiniPlayer';

/**
 * Modern Audio Experience:
 * Replaces the old invasive bottom bar with:
 * 1. TextSelectionPopup: Contextual floating menu upon selecting text (Play, Dictionary, Save, Notebook, Copy, Analyze).
 * 2. FloatingMiniPlayer: Ultra-compact, draggable, minimizable floating audio player with 5s skip, restart, play/pause, speed controls.
 */
export default function AudioPlayerBar({ appState, onUpdateState, onNavigate }) {
  return (
    <>
      <TextSelectionPopup />
      <FloatingMiniPlayer />
    </>
  );
}

export { TextSelectionPopup, FloatingMiniPlayer };
