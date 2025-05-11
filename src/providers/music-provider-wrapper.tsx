'use client';

import React from 'react';
import { MusicProvider } from '@/contexts/music-context';
import { MusicPlayerWrapper } from '@/components/music/music-player-wrapper';


export function MusicProviderWrapper({ children }: { children: React.ReactNode }) {
  console.log('MusicProviderWrapper rendered');
  return (
    <MusicProvider>
      {children}
      <MusicPlayerWrapper />
    </MusicProvider>
  );
}
