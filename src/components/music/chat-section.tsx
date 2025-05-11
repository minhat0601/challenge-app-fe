'use client';

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AvatarFrame } from '@/components/ui/avatar-frame';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, Send, Clock } from 'lucide-react';

interface User {
  id: string;
  name: string;
  avatar?: string;
  rank: 'default' | 'bronze' | 'silver' | 'gold' | 'diamond';
}

interface Comment {
  id: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  userRank: 'default' | 'bronze' | 'silver' | 'gold' | 'diamond';
  content: string;
  timestamp: Date;
}

interface ChatSectionProps {
  comments: Comment[];
  onlineUsers: User[];
  newComment: string;
  onNewCommentChange: (value: string) => void;
  onSendComment: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  className?: string;
}

export function ChatSection({
  comments,
  onlineUsers,
  newComment,
  onNewCommentChange,
  onSendComment,
  onKeyPress,
  className
}: ChatSectionProps) {
  const commentContainerRef = useRef<HTMLDivElement>(null);

  // Cuộn xuống bình luận mới nhất
  useEffect(() => {
    if (commentContainerRef.current) {
      commentContainerRef.current.scrollTop = commentContainerRef.current.scrollHeight;
    }
  }, [comments]);

  // Định dạng thời gian
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Tính thời gian tương đối
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);

    if (diffSec < 60) return 'vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHour < 24) return `${diffHour} giờ trước`;
    return formatTime(date);
  };

  return (
    <Card className={cn(
      "border-none shadow-lg bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-md",
      "relative before:absolute before:-inset-0.5 before:bg-gradient-to-r before:from-secondary/10 before:via-primary/10 before:to-secondary/10 before:rounded-[inherit] before:z-[-1]",
      className
    )}>
      <Tabs defaultValue="comments">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Bình luận</CardTitle>
            <TabsList className="bg-background/40 backdrop-blur-sm">
              <TabsTrigger value="comments" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>Bình luận</span>
                  <Badge variant="secondary" className="ml-1 bg-primary/10 text-primary">{comments.length}</Badge>
                </div>
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>Người nghe</span>
                  <Badge variant="secondary" className="ml-1 bg-primary/10 text-primary">{onlineUsers.length}</Badge>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <TabsContent value="comments" className="m-0">
            <div className="flex flex-col h-[400px]">
              {/* Khu vực hiển thị bình luận */}
              <div
                ref={commentContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-background/20"
              >
                {comments.map(comment => (
                  <div key={comment.id} className="flex gap-3 group hover:bg-background/40 p-3 rounded-xl transition-colors">
                    <AvatarFrame
                      src={comment.userAvatar}
                      fallback={comment.userName.charAt(0)}
                      rank={comment.userRank}
                      size="sm"
                      showFrame={false}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{comment.userName}</span>
                        <span className="text-xs text-muted-foreground">
                          {getRelativeTime(comment.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm break-words mt-1">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Khu vực nhập bình luận */}
              <div className="p-4 border-t border-border/10 bg-background/30">
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Nhập bình luận của bạn..."
                    value={newComment}
                    onChange={(e) => onNewCommentChange(e.target.value)}
                    onKeyDown={onKeyPress}
                    className="bg-background/50 rounded-full"
                  />
                  <Button onClick={onSendComment} variant="default" size="icon" className="rounded-full h-9 w-9 flex-shrink-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users" className="m-0">
            <div className="h-[400px] overflow-y-auto p-4 bg-background/20">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {onlineUsers.map(user => (
                  <div key={user.id} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-background/40 transition-colors">
                    <AvatarFrame
                      src={user.avatar}
                      fallback={user.name.charAt(0)}
                      rank={user.rank}
                      size="md"
                      showFrame={false}
                    />
                    <span className="text-sm font-medium text-center truncate w-full">{user.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
