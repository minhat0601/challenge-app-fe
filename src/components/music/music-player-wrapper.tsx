'use client';

import React, { useEffect } from 'react';
import { MusicPlayerFloat } from './music-player-float';
import { useMusic } from '@/contexts/music-context';

export function MusicPlayerWrapper() {
  const { showFloatingPlayer } = useMusic();
  
  // Hiển thị floating player khi component được mount
  useEffect(() => {
    console.log('MusicPlayerWrapper mounted');
    showFloatingPlayer();
  }, [showFloatingPlayer]);
  
  return <MusicPlayerFloat />;
}
