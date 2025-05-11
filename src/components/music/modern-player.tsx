'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

import {
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX,
  Heart, Share2, ListMusic, MoreHorizontal, Repeat, Shuffle
} from 'lucide-react';

interface Song {
  id: number;
  title: string;
  artist: string;
  duration: number;
  coverUrl: string;
  votes: number;
  votedBy: string[];
}

interface ModernPlayerProps {
  currentSong: Song;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  onPlayPause: () => void;
  onSkipNext: () => void;
  onSkipPrevious: () => void;
  onSeek: (value: number[]) => void;
  onVolumeChange: (value: number[]) => void;
  onMuteToggle: () => void;
  className?: string;
  listeners?: number;
}

// Hàm chuyển đổi giây thành định dạng mm:ss
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function ModernPlayer({
  currentSong,
  isPlaying,
  currentTime,
  volume,
  isMuted,
  onPlayPause,
  onSkipNext,
  onSkipPrevious,
  onSeek,
  onVolumeChange,
  onMuteToggle,
  className,
  listeners = 0
}: ModernPlayerProps) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <Card className={cn(
      "overflow-hidden border-none shadow-xl bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-md",
      "relative before:absolute before:-inset-0.5 before:bg-gradient-to-r before:from-primary/20 before:via-primary/40 before:to-secondary/20 before:rounded-[inherit] before:z-[-1] before:animate-pulse-slow",
      "after:absolute after:-inset-1 after:bg-gradient-to-br after:from-primary/10 after:via-transparent after:to-secondary/10 after:rounded-[inherit] after:z-[-2] after:blur-md",
      className
    )}>
      <CardContent className="p-6">
        <div className="relative">
          {/* Thông tin bài hát và nút play/pause */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <div className="flex items-center gap-1.5 bg-red-500/90 text-white px-2 py-0.5 rounded-md text-xs font-semibold animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-white animate-ping-slow inline-block"></span>
                  <span>LIVE</span>
                </div>
                <p className="text-sm text-muted-foreground">Đang phát trực tiếp • {listeners} người đang nghe</p>
              </div>
              <h2 className="text-2xl font-bold truncate">{currentSong.title}</h2>
              <p className="text-muted-foreground truncate">{currentSong.artist}</p>
            </div>

            <Button
              variant="default"
              size="icon"
              className="h-14 w-14 rounded-full shadow-lg ml-4 flex-shrink-0"
              onClick={onPlayPause}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-1" />
              )}
            </Button>
          </div>

          {/* Thanh tiến trình */}
          <div className="space-y-2 mb-6">
            <Slider
              value={[currentTime]}
              max={currentSong.duration}
              step={1}
              onValueChange={onSeek}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(currentSong.duration)}</span>
            </div>
          </div>

          {/* Các nút điều khiển */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
              >
                <Shuffle className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onSkipPrevious}
                className="text-foreground"
              >
                <SkipBack className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onSkipNext}
                className="text-foreground"
              >
                <SkipForward className="h-6 w-6" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "transition-colors",
                  isLiked ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className="h-5 w-5" fill={isLiked ? "currentColor" : "none"} />
              </Button>
            </div>
          </div>

          {/* Điều khiển âm lượng và các tính năng khác */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/20">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground text-xs gap-1 px-2"
            >
              <Repeat className="h-4 w-4" />
              <span>Lặp lại</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onMuteToggle}
                className="text-muted-foreground hover:text-foreground h-8 w-8"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={100}
                step={1}
                onValueChange={onVolumeChange}
                className="w-full max-w-[100px]"
              />
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground text-xs gap-1 px-2"
            >
              <Share2 className="h-4 w-4" />
              <span>Chia sẻ</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
