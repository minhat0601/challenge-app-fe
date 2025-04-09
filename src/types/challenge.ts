// Kiểu dữ liệu cho thử thách tự học từ backend
export interface SelfLearningTag {
  slug: string;
  name: string;
}

export interface SelfLearningChallengeDetail {
  id: number;
  learningGoal: string;
  topic: string;
  selfLearningTag: SelfLearningTag;
}

export interface ChallengeCategory {
  category: string;
}

export interface ChallengeResponse {
  id: number;
  status: 'in_progress' | 'completed' | 'failed';
  progress: number | null;
  createdAt: string;
  challenge: ChallengeCategory | null;
  selfLearningChallenge: SelfLearningChallengeDetail[];
}

export interface ApiResponse {
  message: string;
  statusCode: number;
  data: ChallengeResponse[];
}

// Kiểu dữ liệu cho hiển thị trong UI
export interface Challenge {
  id: string;
  title: string;
  description: string;
  estimatedDays: number;
  learningGoals: string;
  currentKnowledge: string;
  progress: number;
  completed?: boolean;
  failed?: boolean;
  tag?: string;
  createdAt?: string;
  deadline?: string;
  daysRemaining?: number;
  timeRemainingText?: string;
  hoursRemaining?: number;
  minutesRemaining?: number;
}
