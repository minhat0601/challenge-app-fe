'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import SelfChallengeHeader from '@/components/self-challenges/self-challenge-header';
import ChallengeList from '@/components/self-challenges/challenge-list';
import { Challenge } from '@/types/challenge';
import { fetchMyChallenges, PaginationParams } from '@/services/api';
import { UserChallengeData } from '@/types/api';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CreateChallengeSheet } from '@/components/self-challenges/create-challenge-sheet';

type ViewMode = 'grid' | 'table';
type SortOption = 'title' | 'estimatedDays' | 'progress';
type SortDirection = 'asc' | 'desc';

// Function to map API data to app data structure
function mapApiChallengeToAppChallenge(apiChallenge: UserChallengeData, currentTime: Date): Challenge | null {
  // Skip challenges that are not self-learning or have no self-learning data
  if (!apiChallenge.challenge?.category || apiChallenge.challenge.category !== 'self_learning' || !apiChallenge.selfLearningChallenge.length) {
    return null;
  }

  const selfLearningData = apiChallenge.selfLearningChallenge[0];

  // Calculate deadline and days remaining
  const createdAt = new Date(apiChallenge.createdAt);
  const deadlineDate = selfLearningData.analyzedData.deadline ? new Date(selfLearningData.analyzedData.deadline) : null;

  // Calculate time remaining and progress percentage based on deadline
  let daysRemaining = 0;
  let hoursRemaining = 0;
  let minutesRemaining = 0;
  let timeRemainingText = '';
  let deadlineProgress = 0;

  if (deadlineDate) {
    const totalDuration = deadlineDate.getTime() - createdAt.getTime();
    const elapsedDuration = currentTime.getTime() - createdAt.getTime();
    const remainingMs = deadlineDate.getTime() - currentTime.getTime();

    // Calculate detailed time remaining
    if (remainingMs > 0) {
      daysRemaining = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
      const remainingHours = remainingMs % (1000 * 60 * 60 * 24);
      hoursRemaining = Math.floor(remainingHours / (1000 * 60 * 60));
      const remainingMinutes = remainingHours % (1000 * 60 * 60);
      minutesRemaining = Math.floor(remainingMinutes / (1000 * 60));

      // Format time remaining text
      if (daysRemaining > 0) {
        timeRemainingText = `${daysRemaining} ngày`;
      } else if (hoursRemaining > 0) {
        timeRemainingText = `${hoursRemaining} giờ ${minutesRemaining} phút`;
      } else {
        timeRemainingText = `${minutesRemaining} phút`;
      }
    } else {
      timeRemainingText = 'Hết hạn';
    }

    // Calculate progress percentage (how much time has elapsed)
    deadlineProgress = Math.min(Math.round((elapsedDuration / totalDuration) * 100), 100);
  }

  // Extract estimated days from estimatedTime.basic (e.g., "1 giờ" -> 1)
  const estimatedHoursMatch = selfLearningData.analyzedData.estimateHours?.match(/\d+/) ||
                             selfLearningData.analyzedData.estimatedTime.basic.match(/\d+/);
  const estimatedHours = estimatedHoursMatch ? parseInt(estimatedHoursMatch[0]) : 1;
  const estimatedDays = Math.ceil(estimatedHours / 24) || 1; // Convert hours to days, minimum 1 day

  return {
    id: apiChallenge.id.toString(),
    title: selfLearningData.topic,
    description: selfLearningData.learningGoal,
    estimatedDays: estimatedDays,
    learningGoals: selfLearningData.learningGoal,
    currentKnowledge: selfLearningData.analyzedData.academicKnowledge,
    // Thử chuyển đổi academicKnowledge từ chuỗi sang đối tượng JSON nếu có thể
    ...((() => {
      try {
        // Kiểm tra xem chuỗi có dạng JSON không
        if (selfLearningData.analyzedData.academicKnowledge.startsWith('{') &&
            selfLearningData.analyzedData.academicKnowledge.endsWith('}')) {
          const jsonData = JSON.parse(selfLearningData.analyzedData.academicKnowledge);
          if (jsonData && typeof jsonData === 'object') {
            return { currentKnowledge: jsonData };
          }
        }
      } catch (_) {
        // Nếu không phải JSON hợp lệ, giữ nguyên chuỗi
        console.log('academicKnowledge không phải là JSON hợp lệ');
      }
      return {};
    })()),
    progress: deadlineProgress, // Use deadline progress instead of API progress
    completed: apiChallenge.status === 'completed',
    failed: apiChallenge.status === 'abandoned' || apiChallenge.status === 'failed',
    tag: selfLearningData.selfLearningTag.name,
    createdAt: apiChallenge.createdAt,
    deadline: deadlineDate?.toISOString(),
    daysRemaining: daysRemaining,
    timeRemainingText: timeRemainingText,
    hoursRemaining: hoursRemaining,
    minutesRemaining: minutesRemaining
  };
}

export default function SelfChallengePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [apiChallenges, setApiChallenges] = useState<UserChallengeData[]>([]);
  const [createSheetOpen, setCreateSheetOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Update current time every second for realtime progress
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Function to fetch challenges from API with pagination
  const loadChallenges = async (page = currentPage) => {
    try {
      setLoading(true);

      // Convert sort direction to API format
      const apiSortDirection = sortDirection === 'asc' ? 'ASC' : 'DESC';

      // Prepare pagination params
      const params: PaginationParams = {
        page,
        limit: itemsPerPage,
        sortBy: sortBy,
        sortDirection: apiSortDirection
      };

      const result = await fetchMyChallenges(params);

      // Update state with fetched data
      setApiChallenges(result.challenges);
      setTotalPages(result.totalPages);
      setTotalItems(result.totalItems);
      setCurrentPage(result.currentPage);
    } catch (error) {
      console.error('Failed to load challenges:', error);
      toast.error('Không thể tải dữ liệu thử thách. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch challenges when component mounts or when sort/pagination changes
  useEffect(() => {
    loadChallenges(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, sortBy, sortDirection, itemsPerPage]);

  // Update challenges when currentTime or apiChallenges change
  useEffect(() => {
    if (apiChallenges.length > 0) {
      // Map API data to app data structure
      const mappedChallenges = apiChallenges
        .map(challenge => mapApiChallengeToAppChallenge(challenge, currentTime))
        .filter((challenge): challenge is Challenge => challenge !== null);

      setChallenges(mappedChallenges);
    }
  }, [currentTime, apiChallenges]);

  // Handle sort change
  const handleSortChange = (option: SortOption, direction: SortDirection) => {
    setSortBy(option);
    setSortDirection(direction);
    // Reset to first page when sorting changes
    setCurrentPage(1);
  };

  // Handle view mode change
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  // Sort challenges based on current sort options
  const sortedChallenges = useMemo(() => {
    return [...challenges].sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === 'estimatedDays') {
        comparison = a.estimatedDays - b.estimatedDays;
      } else if (sortBy === 'progress') {
        comparison = a.progress - b.progress;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [challenges, sortBy, sortDirection]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Handle create challenge click
  const handleCreateClick = () => {
    setCreateSheetOpen(true);
  };

  // Handle create challenge success
  const handleCreateSuccess = async () => {
    // Thêm toast thông báo đang cập nhật danh sách với ID
    toast.loading('Đang cập nhật danh sách thử thách...', {
      id: 'updating-challenges',
      duration: 10000, // Tối đa 10 giây
    });

    // Gọi hàm loadChallenges để lấy dữ liệu mới từ API
    try {
      await loadChallenges(currentPage);
      // Đóng toast loading và hiển thị toast success
      toast.dismiss('updating-challenges');
      toast.success('Danh sách thử thách đã được cập nhật!');
    } catch (_) {
      // Nếu có lỗi, hiển thị thông báo lỗi
      toast.dismiss('updating-challenges');
      toast.error('Không thể cập nhật danh sách thử thách!');
    }
  };

  return (
    <div className="space-y-4">
      <SelfChallengeHeader
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        onCreateClick={handleCreateClick}
      />

      {/* Create Challenge Sheet */}
      <CreateChallengeSheet
        open={createSheetOpen}
        onOpenChange={setCreateSheetOpen}
        onSuccess={handleCreateSuccess}
      />
      <ChallengeList
        viewMode={viewMode}
        challenges={sortedChallenges}
        loading={loading}
        onRefresh={() => loadChallenges(currentPage)}
      />

      {/* Pagination UI */}
      {challenges.length > 0 && (
        <div className="flex items-center justify-between py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Hiển thị {totalItems > 0 ? `${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, totalItems)}` : '0'} trên tổng số {totalItems} thử thách
          </div>
          <div className="flex items-center space-x-4">
            {/* Items per page selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Hiển thị:</span>
              <select
                className="h-8 w-16 rounded-md border border-input bg-background px-2 text-xs"
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={!totalPages || currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium">
                Trang {currentPage} / {totalPages || 1}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={!totalPages || currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}