import { ApiResponse, UserChallengeData } from '@/types/api';
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
    // For development, return mock data
    return getMockChallenges();
  }
}

export async function fetchMyChallenges(): Promise<UserChallengeData[]> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/challenge/my-challenge`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: ApiResponse<UserChallengeData[]> = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching my challenges:', error);
    // For development, return mock data
    return [];
  }
}

