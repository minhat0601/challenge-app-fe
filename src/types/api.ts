export interface ApiResponse<T> {
  message: string;
  statusCode: number;
  data: T;
}

export interface PaginatedApiResponse<T> {
  message: string;
  statusCode: number;
  data: T[];
  meta: {
    page: number;
    limit: number;
    itemCount: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export interface SelfLearningTag {
  slug: string;
  name: string;
}

export interface TestQuestionResult {
  question: string;
  answer: string;
  point: number;
  comment: string;
  accuracy: string;
  knowledge_coverage: string;
}

export interface TestLearningAssessment {
  achieved_objectives: string[];
  missing_points: string[];
  misconceptions: string[];
  time_efficiency: string;
}

export interface TestSuggestions {
  improvement: string[];
  resources: string[];
}

export interface AfterSubmitData {
  feedback: string;
  detail: TestQuestionResult[];
  learning_assessment: TestLearningAssessment;
  suggestions: TestSuggestions;
}

export interface AnalyzedData {
  scope: string;
  topic: string;
  context: string;
  estimatedTime: {
    basic: string;
    newbie: string;
  };
  deadline?: string;
  note?: string;
  estimateHours?: string;
  relatedIssues: string;
  academicKnowledge: string | any;
  afterSubmit?: AfterSubmitData;
}

export interface SelfLearningChallengeData {
  id: number;
  learningGoal: string;
  analyzedData: AnalyzedData;
  topic: string;
  selfLearningTag: SelfLearningTag;
  aiGeneratedQuestion?: string[];
  userAnswer?: string | null;
  score?: number | null;
  scope?: string | null;
}

export interface ChallengeData {
  category: string;
}

export interface UserChallengeData {
  id: number;
  status: 'in_progress' | 'completed' | 'abandoned' | 'failed';
  progress: number | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  acceptAt: string | null;
  updatedAt: string;
  challenge: ChallengeData | null;
  selfLearningChallenge: SelfLearningChallengeData[];
}
