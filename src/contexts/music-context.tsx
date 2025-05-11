'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Định nghĩa kiểu dữ liệu cho bài hát
export interface Song {
  id: number;
  title: string;
  artist: string;
  duration: number;
  coverUrl: string;
  votes: number;
  votedBy: string[];
}

// Định nghĩa kiểu dữ liệu cho vị trí player
interface PlayerPosition {
  x: number;
  y: number;
  corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null;
}

// Định nghĩa kiểu dữ liệu cho context
interface MusicContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  listeners: number;
  isFloatingPlayerVisible: boolean;
  playerPosition: PlayerPosition;
  setCurrentSong: (song: Song) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setVolume: (volume: number) => void;
  setIsMuted: (isMuted: boolean) => void;
  setListeners: (count: number) => void;
  toggleFloatingPlayer: () => void;
  showFloatingPlayer: () => void;
  hideFloatingPlayer: () => void;
  setPlayerPosition: (position: PlayerPosition) => void;
}

// Tạo context với giá trị mặc định
const MusicContext = createContext<MusicContextType | undefined>(undefined);

// Dữ liệu mẫu cho bài hát mặc định
const DEFAULT_SONG: Song = {
  id: 1,
  title: 'Hà Nội Mùa Vắng Những Cơn Mưa',
  artist: 'Phan Mạnh Quỳnh',
  duration: 289,
  coverUrl: 'https://i.ytimg.com/vi/EPLgMdq1NBI/maxresdefault.jpg',
  votes: 24,
  votedBy: []
};

// Provider component
export function MusicProvider({ children }: { children: ReactNode }) {
  console.log('MusicProvider initialized');
  const [currentSong, setCurrentSong] = useState<Song>(DEFAULT_SONG);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [listeners, setListeners] = useState(0);
  const [isFloatingPlayerVisible, setIsFloatingPlayerVisible] = useState(true);
  const [playerPosition, setPlayerPosition] = useState<PlayerPosition>(() => {
    // Mặc định ở góc dưới bên phải
    if (typeof window !== 'undefined') {
      return {
        x: window.innerWidth - 300,
        y: window.innerHeight - 200,
        corner: 'bottom-right'
      };
    }
    return {
      x: 0,
      y: 0,
      corner: 'bottom-right'
    };
  });

  // Cập nhật thời gian phát khi đang phát
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        if (prev >= currentSong.duration) {
          // Khi bài hát kết thúc, quay về đầu
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, currentSong]);

  // Lưu trạng thái vào localStorage
  useEffect(() => {
    const saveState = () => {
      const state = {
        volume,
        isMuted,
        isFloatingPlayerVisible,
        playerPosition
      };
      localStorage.setItem('musicPlayerState', JSON.stringify(state));
    };

    saveState();
  }, [volume, isMuted, isFloatingPlayerVisible, playerPosition]);

  // Khôi phục trạng thái từ localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('musicPlayerState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        setVolume(state.volume || 80);
        setIsMuted(state.isMuted || false);
        setIsFloatingPlayerVisible(state.isFloatingPlayerVisible || false);

        // Khôi phục vị trí player
        if (state.playerPosition) {
          setPlayerPosition(state.playerPosition);
        }
      } catch (error) {
        console.error('Error parsing saved music state:', error);
      }
    }
  }, []);

  // Các hàm điều khiển floating player
  const toggleFloatingPlayer = () => {
    console.log('toggleFloatingPlayer called');
    setIsFloatingPlayerVisible(prev => !prev);
  };

  const showFloatingPlayer = () => {
    console.log('showFloatingPlayer called');
    setIsFloatingPlayerVisible(true);
  };

  const hideFloatingPlayer = () => {
    console.log('hideFloatingPlayer called');
    setIsFloatingPlayerVisible(false);
  };

  // Giá trị context
  const value = {
    currentSong,
    isPlaying,
    currentTime,
    volume,
    isMuted,
    listeners,
    isFloatingPlayerVisible,
    playerPosition,
    setCurrentSong,
    setIsPlaying,
    setCurrentTime,
    setVolume,
    setIsMuted,
    setListeners,
    toggleFloatingPlayer,
    showFloatingPlayer,
    hideFloatingPlayer,
    setPlayerPosition
  };

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}

// Hook để sử dụng context
export function useMusic() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
}
