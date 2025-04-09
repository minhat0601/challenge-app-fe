'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import SelfChallengeHeader from '@/components/self-challenges/self-challenge-header';
import ChallengeList from '@/components/self-challenges/challenge-list';
import { Challenge } from '@/types/challenge';
import { fetchMyChallenges } from '@/services/api';
import { UserChallengeData } from '@/types/api';

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
    progress: deadlineProgress, // Use deadline progress instead of API progress
    completed: apiChallenge.status === 'completed',
    failed: apiChallenge.status === 'abandoned',
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

  // Update current time every second for realtime progress
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Function to fetch challenges from API
  const loadChallenges = async () => {
    try {
      setLoading(true);
      const fetchedChallenges = await fetchMyChallenges();
      setApiChallenges(fetchedChallenges);
    } catch (error) {
      console.error('Failed to load challenges:', error);
      toast.error('Không thể tải dữ liệu thử thách. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch challenges on component mount
  useEffect(() => {
    loadChallenges();
  }, []);

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

  return (
    <div className="space-y-4">
      <SelfChallengeHeader
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
      />
      <ChallengeList
        viewMode={viewMode}
        challenges={sortedChallenges}
        loading={loading}
        onRefresh={loadChallenges}
      />
    </div>
  );
}