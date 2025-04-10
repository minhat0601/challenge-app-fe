import { ApiResponse, PaginatedApiResponse, UserChallengeData } from '@/types/api';
import { fetchWithAuth } from '@/lib/fetcher';
import envConf from '@/app/config/config';

const API_BASE_URL = envConf.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3000';

export async function fetchChallenges(): Promise<UserChallengeData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/challenges`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for authentication
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: ApiResponse<UserChallengeData[]> = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching challenges:', error);
    // For development, return empty array
    return [];
  }
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface ChallengeListResponse {
  challenges: UserChallengeData[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export async function fetchMyChallenges(params: PaginationParams = {}): Promise<ChallengeListResponse> {
  try {
    const { page = 1, limit = 10, sortBy, sortDirection } = params;

    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    if (sortBy) {
      queryParams.append('sortBy', sortBy);
    }

    if (sortDirection) {
      queryParams.append('sortDirection', sortDirection);
    }

    const url = `${API_BASE_URL}/challenge/my-challenge?${queryParams.toString()}`;
    const response = await fetchWithAuth(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: PaginatedApiResponse<UserChallengeData> = await response.json();

    return {
      challenges: data.data,
      totalItems: data.meta.itemCount,
      totalPages: data.meta.pageCount,
      currentPage: data.meta.page
    };
  } catch (error) {
    console.error('Error fetching my challenges:', error);
    // For development, return empty data
    return {
      challenges: [],
      totalItems: 0,
      totalPages: 0,
      currentPage: 1
    };
  }
}

// Fetch challenge detail by ID
export async function fetchChallengeById(id: number): Promise<UserChallengeData | null> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/challenge/my-challenge/${id}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: ApiResponse<UserChallengeData> = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching challenge with ID ${id}:`, error);
    return null;
  }
}

// Submit answer for a challenge question
export interface AnswerSubmission {
  challengeId: number;
  answer: string;
}

export async function submitChallengeAnswer(submission: AnswerSubmission): Promise<boolean> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/challenge/my-challenge/${submission.challengeId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ answer: submission.answer }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.statusCode === 200;
  } catch (error) {
    console.error('Error submitting challenge answer:', error);
    return false;
  }
}
