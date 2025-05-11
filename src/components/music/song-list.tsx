'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, Music, Clock, MoreHorizontal } from 'lucide-react';

interface Song {
  id: number;
  title: string;
  artist: string;
  duration: number;
  coverUrl: string;
  votes: number;
  votedBy: string[];
}

interface SongListProps {
  songs: Song[];
  currentSongId: number;
  onVote: (songId: number) => void;
  userId?: string;
  className?: string;
}

// Hàm chuyển đổi giây thành định dạng mm:ss
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function SongList({
  songs,
  currentSongId,
  onVote,
  userId,
  className
}: SongListProps) {
  // Sắp xếp bài hát theo số vote (trừ bài đang phát)
  const sortedSongs = [...songs]
    .filter(song => song.id !== currentSongId)
    .sort((a, b) => b.votes - a.votes);

  return (
    <Card className={cn(
      "border-none shadow-lg bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-md",
      "relative before:absolute before:-inset-0.5 before:bg-gradient-to-r before:from-secondary/10 before:via-secondary/20 before:to-primary/10 before:rounded-[inherit] before:z-[-1]",
      className
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span>Bình chọn bài hát</span>
          <Badge variant="outline" className="ml-auto">
            {sortedSongs.length} bài
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[400px] overflow-y-auto scrollbar-thin">
          {sortedSongs.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              Không có bài hát nào trong danh sách chờ
            </div>
          ) : (
            <div className="divide-y divide-border/10">
              {sortedSongs.map((song, index) => (
                <div
                  key={song.id}
                  className={cn(
                    "flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors",
                    index === 0 && "bg-primary/5"
                  )}
                >
                  {/* Thứ tự và ảnh bìa */}
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 text-center font-medium text-sm">
                      {index === 0 ? (
                        <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                          {index + 1}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">{index + 1}</span>
                      )}
                    </div>

                    {/* Ảnh bìa */}
                    <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 relative group">
                      <img
                        src={song.coverUrl}
                        alt={song.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Thông tin bài hát */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate text-sm">{song.title}</h3>
                    <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                  </div>

                  {/* Vote và thời lượng */}
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 text-xs text-muted-foreground">
                      {formatTime(song.duration)}
                    </div>

                    <div className="flex items-center gap-1 bg-muted/30 px-2 py-1 rounded-full">
                      <ThumbsUp className="h-3 w-3 text-primary" />
                      <span className="text-xs font-medium">{song.votes}</span>
                    </div>

                    <Button
                      variant={song.votedBy.includes(userId || '') ? "secondary" : "ghost"}
                      size="sm"
                      className="h-8 rounded-full px-3 text-xs"
                      onClick={() => onVote(song.id)}
                      disabled={!userId || song.votedBy.includes(userId)}
                    >
                      {song.votedBy.includes(userId || '') ? "Bỏ phiếu" : "Bình chọn"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
