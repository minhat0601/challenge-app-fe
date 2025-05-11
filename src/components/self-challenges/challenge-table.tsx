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
              <TableHead className="w-[60px] text-center font-medium">STT</TableHead>
              <TableHead className="w-[250px] font-medium">Tên thử thách</TableHead>
              <TableHead className="font-medium">Mô tả</TableHead>
              <TableHead className="w-[100px] text-center font-medium">Thời gian</TableHead>
              <TableHead className="w-[100px] text-center font-medium">Tiến độ</TableHead>
              <TableHead className="w-[150px] font-medium">Tag</TableHead>
              <TableHead className="w-[120px] text-center font-medium">Trạng thái</TableHead>
              <TableHead className="w-[120px] text-right font-medium">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(5).fill(0).map((_, i) => (
              <TableRow key={i}>
                <TableCell className="text-center"><Skeleton className="h-4 w-6 mx-auto" /></TableCell>
                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell className="text-center"><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center">
                    <Skeleton className="h-3 w-20 rounded-full" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </TableCell>
                <TableCell className="text-center">
                  <Skeleton className="h-6 w-24 mx-auto rounded-full" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-24 ml-auto rounded-md" />
                </TableCell>
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
            <TableHead className="w-[60px] text-center font-medium">STT</TableHead>
            <TableHead className="w-[250px] font-medium">Tên thử thách</TableHead>
            <TableHead className="font-medium">Mô tả</TableHead>
            <TableHead className="w-[100px] text-center font-medium">Thời gian</TableHead>
            <TableHead className="w-[100px] text-center font-medium">Tiến độ</TableHead>
            <TableHead className="w-[150px] font-medium">Tag</TableHead>
            <TableHead className="w-[120px] text-center font-medium">Trạng thái</TableHead>
            <TableHead className="w-[120px] text-right font-medium">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {challenges.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                Không có thử thách nào. Hãy tạo thử thách mới!
              </TableCell>
            </TableRow>
          ) : (
            challenges.map((challenge, index) => (
            <TableRow
              key={challenge.id}
              className="relative hover:bg-muted/40 transition-colors"
            >
              <TableCell className="text-center font-medium">{index + 1}</TableCell>
              <TableCell className="font-medium">
                {challenge.title}
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
                    className="text-[10px] py-0 px-2 font-medium"
                  >
                    {challenge.tag}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-center">
                {challenge.completed && (
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 font-medium text-xs py-1">
                    Đã hoàn thành
                  </Badge>
                )}
                {challenge.failed && (
                  <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 font-medium text-xs py-1">
                    Không hoàn thành
                  </Badge>
                )}
                {!challenge.completed && !challenge.failed && (
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 font-medium text-xs py-1">
                    Đang học
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-secondary/80"
                  onClick={() => router.push(`/dashboard/selfChallenge/${challenge.id}`)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Xem chi tiết
                </Button>
              </TableCell>
            </TableRow>
            ))
          )}
          <TableRow>
            <TableCell colSpan={8}>
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
