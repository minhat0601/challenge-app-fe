'use client';

import React, { useEffect, useState } from 'react';
import './challenge-card.css';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getElapsedTime, getTimeBetween, isDeadlineExpired } from '@/utils/date';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Eye, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import ChallengeTable from './challenge-table';
import { Challenge } from '@/types/challenge';
import { CreateChallengeSheet } from './create-challenge-sheet';
import { useAuthStore } from '@/stores/auth-store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";

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



  // Removed handleCreateClick as it's now handled in the parent component

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
          <Card key={i} className="relative overflow-hidden h-[430px] flex flex-col">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-3/4 mb-2" />
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-4 flex flex-col h-full">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />

                {/* Academic knowledge skeleton */}
                <div className="p-2 bg-secondary/50 rounded-md">
                  <Skeleton className="h-3 w-1/3 mb-1" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full mt-1" />
                  <Skeleton className="h-3 w-16 mt-1" />
                </div>

                {/* Tag and time remaining */}
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>

                <div className="flex-grow"></div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 pt-2">
              {/* Progress bar skeleton */}
              <div className="w-full h-[24px] flex items-center">
                <Skeleton className="h-3 w-full rounded-full" />
              </div>

              {/* Button skeleton */}
              <Skeleton className="h-9 w-full" />
            </CardFooter>
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
          className={`relative overflow-hidden card-hover-effect ${challenge.completed ? 'completed-card' : ''} ${challenge.failed ? 'failed-card' : ''} flex flex-col h-[430px]`}
        >
          {/* HEADER - Tiêu đề */}
          <CardHeader className="pb-2 relative">
            <CardTitle className="text-xl relative z-10 line-clamp-1">{challenge.title}</CardTitle>
          </CardHeader>

          {/* BODY - Nội dung chính */}
          <CardContent className="flex-grow">
            <div className="flex flex-col h-full">
              {/* Mô tả */}
              <div className="mb-4">
                <p className="text-sm text-muted-foreground relative z-10 line-clamp-2">{challenge.description}</p>
              </div>

              {/* Kiến thức học thuật - giới hạn độ dài */}
              {challenge.currentKnowledge && (
                <div className="mb-4 p-2 bg-secondary/50 rounded-md">
                  <h4 className="text-xs font-medium mb-1 text-primary">Kiến thức học thuật:</h4>
                  <div className="text-xs text-muted-foreground relative z-10 line-clamp-2 prose prose-xs dark:prose-invert max-w-none">
                    {typeof challenge.currentKnowledge === 'string' ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: challenge.currentKnowledge.length > 150
                            ? `${challenge.currentKnowledge.substring(0, 150)}...`
                            : challenge.currentKnowledge
                        }}
                      />
                    ) : (
                      <p>
                        {typeof challenge.currentKnowledge === 'object' && challenge.currentKnowledge.overview
                          ? challenge.currentKnowledge.overview.substring(0, 150) + '...'
                          : 'Xem chi tiết kiến thức học thuật'}
                      </p>
                    )}
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        className="text-xs text-primary mt-1 hover:underline focus:outline-none"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Xem thêm
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Kiến thức học thuật</DialogTitle>
                        <DialogDescription>
                          Thông tin chi tiết về chủ đề mà AI đã phân tích
                        </DialogDescription>
                      </DialogHeader>
                      <div className="p-4 bg-secondary/30 rounded-md max-h-[300px] overflow-y-auto">
                        <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                          {typeof challenge.currentKnowledge === 'string' ? (
                            <div dangerouslySetInnerHTML={{ __html: challenge.currentKnowledge }} />
                          ) : (
                            <div>
                              {typeof challenge.currentKnowledge === 'object' && challenge.currentKnowledge.overview && (
                                <div className="mb-4">
                                  <h3 className="text-base font-medium mb-2">Tổng quan</h3>
                                  <p>{challenge.currentKnowledge.overview}</p>
                                </div>
                              )}

                              {typeof challenge.currentKnowledge === 'object' && challenge.currentKnowledge.keyPoints && (
                                <div className="mb-4">
                                  <h3 className="text-base font-medium mb-2">Điểm chính</h3>
                                  <ul className="list-disc pl-5 space-y-1">
                                    {challenge.currentKnowledge.keyPoints.map((point: string, index: number) => (
                                      <li key={index}>{point}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <Button
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Thêm thông tin challenge vào URL của Google Form
                            const formUrl = new URL('https://forms.gle/xQnV1ruDWmybap7H6');

                            // Lấy thông tin người dùng từ auth store
                            const { user } = useAuthStore.getState();
                            const userName = user?.name || 'Không có tên';
                            const userEmail = user?.email || 'Không có email';

                            // Thêm các trường vào form với ID chính xác
                            formUrl.searchParams.append('usp=pp_url', '');
                            formUrl.searchParams.append('entry.2029755173', userName); // Họ và tên
                            formUrl.searchParams.append('entry.1524445052', userEmail); // Email
                            formUrl.searchParams.append('entry.2032970399', challenge.id); // UUID
                            formUrl.searchParams.append('entry.1031341378', challenge.id); // learnid

                            // Thêm thông tin bổ sung về challenge
                            formUrl.searchParams.append('entry.title', challenge.title); // Tiêu đề challenge (không có trong form nhưng có thể hữu ích)
                            formUrl.searchParams.append('entry.content', challenge.currentKnowledge); // Nội dung kiến thức học thuật (không có trong form nhưng có thể hữu ích)

                            // Hiển thị thông báo cảm ơn
                            toast.success('Cảm ơn bạn đã góp ý!', {
                              description: 'Góp ý của bạn sẽ giúp chúng tôi cải thiện chất lượng phân tích của AI.',
                            });

                            // Mở Google Form trong tab mới
                            window.open(formUrl.toString(), '_blank');
                          }}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          Góp ý về nội dung
                        </Button>
                        <DialogPrimitive.Close asChild>
                          <Button variant="outline" className="flex items-center gap-1">
                            <X className="h-4 w-4" />
                            Đóng
                          </Button>
                        </DialogPrimitive.Close>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {/* Tag và thời gian còn lại */}
              <div className="flex items-center justify-between relative z-10 mb-4">
                <div className="flex items-center gap-2">
                  {challenge.tag && (
                    <Badge
                      variant="default"
                      className="text-[10px] py-0 px-2"
                    >
                      {challenge.tag}
                    </Badge>
                  )}
                </div>
                {/* Hiển thị trạng thái hoàn thành/không hoàn thành hoặc thời gian còn lại */}
                {challenge.completed && (
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Đã hoàn thành
                  </span>
                )}
                {challenge.failed && (
                  <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                    Không hoàn thành
                  </span>
                )}
                {!challenge.completed && !challenge.failed && challenge.daysRemaining !== undefined && (
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    Còn: {challenge.timeRemainingText || (challenge.daysRemaining && challenge.daysRemaining > 0 ? `${challenge.daysRemaining} ngày` : 'Hết hạn')}
                  </span>
                )}
              </div>

              {/* Khoảng trống để đẩy nút xuống dưới */}
              <div className="flex-grow"></div>
            </div>
          </CardContent>

          {/* FOOTER - Thanh tiến độ và nút xem chi tiết */}
          <CardFooter className="flex flex-col gap-2 pt-2">

            {/* Thanh tiến độ */}
            {!challenge.completed && !challenge.failed && (
              <div className="w-full h-[24px] flex items-center relative z-10 mb-1">
                <div className="w-full bg-secondary h-3 rounded-full relative z-10">
                  <div
                    className={`h-3 rounded-full transition-all ${challenge.deadline && isDeadlineExpired(challenge.deadline) ? 'bg-blue-500 road-track-expired' : 'bg-blue-500 road-track'}`}
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
              </div>
            )}



            {/* Nút xem chi tiết - luôn hiển thị */}
            <Button
              variant="outline"
              className="w-full relative z-10 h-9"
              onClick={() => router.push(`/dashboard/selfChallenge/${challenge.id}`)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Xem chi tiết
            </Button>
          </CardFooter>
        </Card>
      ))}

      {/* Sheet tạo thử thách mới */}
      <CreateChallengeSheet
        open={createSheetOpen}
        onOpenChange={setCreateSheetOpen}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}