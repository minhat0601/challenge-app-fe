'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getElapsedTime, getTimeBetween, isDeadlineExpired } from '@/utils/date';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { PlusCircle, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import ChallengeTable from './challenge-table';
import { Challenge } from '@/types/challenge';
import { CreateChallengeSheet } from './create-challenge-sheet';

type ViewMode = 'grid' | 'table';

interface ChallengeListProps {
  viewMode: ViewMode;
  challenges: Challenge[];
  loading?: boolean;
  onRefresh?: () => Promise<void>;
}

export default function ChallengeList({ viewMode, challenges, loading = false, onRefresh }: ChallengeListProps) {
  const router = useRouter();
  const [elapsedTimes, setElapsedTimes] = useState<Record<string, string>>({});
  const [createSheetOpen, setCreateSheetOpen] = useState(false);



  const handleCreateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setCreateSheetOpen(true);
  };

  const handleCreateSuccess = async () => {
    // Thêm toast thông báo đang cập nhật danh sách với ID
    toast.loading('Đang cập nhật danh sách thử thách...', {
      id: 'updating-challenges',
      duration: 10000, // Tối đa 10 giây
    });

    // Gọi hàm onRefresh để lấy dữ liệu mới từ API
    if (onRefresh) {
      try {
        await onRefresh();
        // Đóng toast loading và hiển thị toast success
        toast.dismiss('updating-challenges');
        toast.success('Danh sách thử thách đã được cập nhật!', {
          id: 'update-success',
        });
      } catch (error) {
        console.error('Failed to refresh challenges:', error);
        // Đóng toast loading và hiển thị toast error
        toast.dismiss('updating-challenges');
        toast.error('Không thể cập nhật danh sách thử thách. Vui lòng tải lại trang.', {
          id: 'update-error',
        });
      }
    } else {
      // Fallback nếu không có onRefresh
      router.refresh();
      // Đóng toast loading và hiển thị toast info
      toast.dismiss('updating-challenges');
      toast.info('Danh sách thử thách đã được cập nhật!', {
        id: 'update-info',
      });
    }
  };

  // Cập nhật thời gian đã học mỗi giây
  useEffect(() => {
    if (challenges.length === 0 || loading) return;

    // Cập nhật ban đầu
    const initialTimes: Record<string, string> = {};
    challenges.forEach(challenge => {
      if (challenge.createdAt && !challenge.completed) {
        initialTimes[challenge.id] = getElapsedTime(challenge.createdAt);
      }
    });
    setElapsedTimes(initialTimes);

    // Cập nhật mỗi giây
    const interval = setInterval(() => {
      setElapsedTimes(prev => {
        const newTimes = { ...prev };
        challenges.forEach(challenge => {
          if (challenge.createdAt && !challenge.completed) {
            newTimes[challenge.id] = getElapsedTime(challenge.createdAt);
          }
        });
        return newTimes;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [challenges, loading]);


  if (viewMode === 'table') {
    return <ChallengeTable challenges={challenges} loading={loading} onRefresh={onRefresh} />;
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(6).fill(0).map((_, i) => (
          <Card key={i} className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-3/4 mb-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-1/3" />
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-1" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                <div className="relative">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-4 absolute right-2 top-1" />
                </div>
                <Skeleton className="h-8 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {challenges.map((challenge) => (
        <Card
          key={challenge.id}
          className={`relative overflow-hidden ${challenge.completed ? 'completed-card' : ''}`}
        >
          <CardHeader className="pb-2 relative">
            <CardTitle className="text-xl relative z-10">{challenge.title}</CardTitle>
            {challenge.completed && (
              <div className="absolute bottom-0 right-0 opacity-40">
                <div className="relative w-24 h-16 rotate-[-20deg] flex items-center justify-center mr-2 mb-2">
                  <div className="absolute inset-0 border-2 border-green-600 dark:border-green-500 rounded-md"></div>
                  <div className="absolute inset-[2px] border border-green-600/50 dark:border-green-500/50 rounded-md"></div>
                  <div className="absolute inset-[4px] border border-dashed border-green-600/30 dark:border-green-500/30"></div>

                  <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-green-600 dark:border-green-500"></div>
                  <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-green-600 dark:border-green-500"></div>
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-green-600 dark:border-green-500"></div>
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-green-600 dark:border-green-500"></div>

                  <div className="text-green-600 dark:text-green-500 text-center font-bold text-sm tracking-wider">
                    Đã hoàn thành
                  </div>
                </div>
              </div>
            )}
            {challenge.failed && (
              <div className="absolute bottom-0 right-0 opacity-40">
                <div className="relative w-24 h-16 rotate-[-20deg] flex items-center justify-center mr-2 mb-2">
                  <div className="absolute inset-0 border-2 border-red-600 dark:border-red-500 rounded-md"></div>
                  <div className="absolute inset-[2px] border border-red-600/50 dark:border-red-500/50 rounded-md"></div>
                  <div className="absolute inset-[4px] border border-dashed border-red-600/30 dark:border-red-500/30"></div>

                  <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-red-600 dark:border-red-500"></div>
                  <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-red-600 dark:border-red-500"></div>
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-red-600 dark:border-red-500"></div>
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-red-600 dark:border-red-500"></div>

                  <div className="text-red-600 dark:text-red-500 text-center font-bold text-sm tracking-wider">
                    Không hoàn thành
                  </div>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground relative z-10">{challenge.description}</p>
              <div className="flex items-center justify-between relative z-10">
                <span className="text-sm">Thời gian: {challenge.estimatedDays} ngày</span>
                {challenge.daysRemaining !== undefined && (
                  <span className="text-sm text-blue-600 dark:text-blue-400">
                    Còn: {challenge.timeRemainingText || (challenge.daysRemaining && challenge.daysRemaining > 0 ? `${challenge.daysRemaining} ngày` : 'Hết hạn')}
                  </span>
                )}
              </div>
              {!challenge.completed && !challenge.failed ? (
                <div className="w-full bg-secondary h-3 rounded-full relative z-10">
                  <div
                    className={`h-3 rounded-full transition-all ${challenge.completed ? 'bg-green-500' : challenge.deadline && isDeadlineExpired(challenge.deadline) ? 'bg-blue-500 road-track-expired' : 'bg-blue-500 road-track'}`}
                    style={{ width: `${challenge.progress}%` }}
                  />
                  {/* Car icon on progress bar */}
                  <div
                    className="absolute top-1/2 transform -translate-y-1/2 -mt-1 z-20 group car-animation"
                    style={{ left: `calc(${challenge.progress}% - 8px)` }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-500 drop-shadow-md">
                      <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25zM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875h.375a3 3 0 116 0h3a.75.75 0 00.75-.75V15z" />
                      <path d="M8.25 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0zM15.75 6.75a.75.75 0 00-.75.75v11.25c0 .087.015.17.042.248a3 3 0 015.958.464c.853-.175 1.522-.935 1.464-1.883a18.659 18.659 0 00-3.732-10.104 1.837 1.837 0 00-1.47-.725H15.75z" />
                      <path d="M19.5 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z" />
                    </svg>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[9999] whitespace-nowrap tooltip-content text-center">
                      {challenge.completed || (challenge.deadline && isDeadlineExpired(challenge.deadline)) ? (
                        <>Tổng thời gian: {getTimeBetween(challenge.createdAt || '', challenge.deadline || new Date())}</>
                      ) : (
                        <>{elapsedTimes[challenge.id] || getElapsedTime(challenge.createdAt || '')}</>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
              <div className="flex flex-wrap gap-1 mb-2 relative z-10">
                {challenge.tag && (
                  <Badge
                    variant="default"
                    className="text-[10px] py-0 px-2"
                  >
                    {challenge.tag}
                  </Badge>
                )}
              </div>
              <Button variant="outline" className="w-full relative z-10">
                <Eye className="h-4 w-4 mr-2" />
                Xem chi tiết
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Card tạo thử thách mới */}
      <Card
        className="flex flex-col items-center justify-center h-full min-h-[250px] cursor-pointer border-dashed hover:border-primary hover:bg-primary/5 transition-colors"
        onClick={handleCreateClick}
      >
        <CardContent className="flex flex-col items-center justify-center p-6 text-center h-full">
          <PlusCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <CardTitle className="text-xl font-medium text-muted-foreground">Tạo thử thách mới</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">Thêm một thử thách tự học mới</p>
        </CardContent>
      </Card>

      {/* Sheet tạo thử thách mới */}
      <CreateChallengeSheet
        open={createSheetOpen}
        onOpenChange={setCreateSheetOpen}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}