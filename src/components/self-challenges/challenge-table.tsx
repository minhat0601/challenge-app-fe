'use client';

import React, { useEffect, useState } from 'react';
import { getElapsedTime, getTimeBetween, isDeadlineExpired } from '@/utils/date';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Challenge } from '@/types/challenge';
import { CreateChallengeSheet } from './create-challenge-sheet';

interface ChallengeTableProps {
  challenges: Challenge[];
  loading?: boolean;
  onRefresh?: () => Promise<void>;
}

export default function ChallengeTable({ challenges, loading = false, onRefresh }: ChallengeTableProps) {
  const router = useRouter();
  const [elapsedTimes, setElapsedTimes] = useState<Record<string, string>>({});
  const [createSheetOpen, setCreateSheetOpen] = useState(false);

  const handleNavigate = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(path);
  };

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


  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px] text-center">STT</TableHead>
              <TableHead className="w-[250px]">Tên thử thách</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead className="w-[100px] text-center">Thời gian</TableHead>
              <TableHead className="w-[100px] text-center">Tiến độ</TableHead>
              <TableHead className="w-[150px]">Tag</TableHead>
              <TableHead className="w-[100px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell className="text-center"><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell className="text-center"><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-2 w-16" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px] text-center">STT</TableHead>
              <TableHead className="w-[250px]">Tên thử thách</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead className="w-[100px] text-center">Thời gian</TableHead>
              <TableHead className="w-[100px] text-center">Tiến độ</TableHead>
              <TableHead className="w-[150px]">Tag</TableHead>
              <TableHead className="w-[100px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(5).fill(0).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell>
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-4 w-4 absolute left-8 top-1" />
                    </div>
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-8 w-16" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px] text-center">STT</TableHead>
            <TableHead className="w-[250px]">Tên thử thách</TableHead>
            <TableHead>Mô tả</TableHead>
            <TableHead className="w-[100px] text-center">Thời gian</TableHead>
            <TableHead className="w-[100px] text-center">Tiến độ</TableHead>
            <TableHead className="w-[150px]">Tag</TableHead>
            <TableHead className="w-[100px] text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {challenges.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                Không có thử thách nào. Hãy tạo thử thách mới!
              </TableCell>
            </TableRow>
          ) : (
            challenges.map((challenge, index) => (
            <TableRow
              key={challenge.id}
              className="relative"
            >
              <TableCell className="text-center font-medium">{index + 1}</TableCell>
              <TableCell className="font-medium relative">
                {challenge.title}
                {challenge.completed && (
                  <div className="absolute bottom-0 right-0 opacity-40">
                    <div className="relative w-32 h-20 rotate-[-20deg] flex items-center justify-center mr-2 mb-2">
                      <div className="absolute inset-0 border-2 border-green-600 dark:border-green-500 rounded-md"></div>
                      <div className="absolute inset-[3px] border border-green-600/50 dark:border-green-500/50 rounded-md"></div>
                      <div className="absolute inset-[6px] border border-dashed border-green-600/30 dark:border-green-500/30"></div>

                      <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-green-600 dark:border-green-500"></div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-green-600 dark:border-green-500"></div>
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-green-600 dark:border-green-500"></div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-green-600 dark:border-green-500"></div>

                      <div className="text-green-600 dark:text-green-500 text-center font-bold text-lg tracking-wider">
                        Đã hoàn thành
                      </div>
                    </div>
                  </div>
                )}
                {challenge.failed && (
                  <div className="absolute bottom-0 right-0 opacity-40">
                    <div className="relative w-32 h-20 rotate-[-20deg] flex items-center justify-center mr-2 mb-2">
                      <div className="absolute inset-0 border-2 border-red-600 dark:border-red-500 rounded-md"></div>
                      <div className="absolute inset-[3px] border border-red-600/50 dark:border-red-500/50 rounded-md"></div>
                      <div className="absolute inset-[6px] border border-dashed border-red-600/30 dark:border-red-500/30"></div>

                      <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-red-600 dark:border-red-500"></div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-red-600 dark:border-red-500"></div>
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-red-600 dark:border-red-500"></div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-red-600 dark:border-red-500"></div>

                      <div className="text-red-600 dark:text-red-500 text-center font-bold text-lg tracking-wider">
                        Không hoàn thành
                      </div>
                    </div>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">{challenge.description}</TableCell>
              <TableCell className="text-center">{challenge.estimatedDays} ngày</TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center">
                  {challenge.daysRemaining !== undefined && !challenge.completed && !challenge.failed && (
                    <div className="w-20 bg-secondary h-3 rounded-full relative">
                      <div
                        className={`h-3 rounded-full transition-all ${challenge.completed ? 'bg-green-500' : challenge.deadline && isDeadlineExpired(challenge.deadline) ? 'bg-blue-500 road-track-expired' : 'bg-blue-500 road-track'}`}
                        style={{ width: `${challenge.progress}%` }}
                      />
                      {/* Car icon on progress bar */}
                      <div
                        className="absolute top-1/2 transform -translate-y-1/2 -mt-1 z-10 group car-animation"
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
                  )}
                </div>
              </TableCell>
              <TableCell>
                {challenge.tag && (
                  <Badge
                    variant="default"
                    className="text-[10px] py-0 px-2"
                  >
                    {challenge.tag}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Xem
                </Button>
              </TableCell>
            </TableRow>
            ))
          )}
          <TableRow>
            <TableCell colSpan={6}>
              <Button
                variant="ghost"
                className="w-full flex items-center justify-center py-4 text-muted-foreground hover:text-primary"
                onClick={handleCreateClick}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Tạo thử thách mới
              </Button>
            </TableCell>
          </TableRow>

        </TableBody>
      </Table>
    </div>

    {/* Sheet tạo thử thách mới */}
    <CreateChallengeSheet
      open={createSheetOpen}
      onOpenChange={setCreateSheetOpen}
      onSuccess={handleCreateSuccess}
    />
    </>
  );
}
