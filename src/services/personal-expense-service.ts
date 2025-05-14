import { fetchWithAuth } from '@/lib/fetcher';
import envConf from '@/app/config/config';
import { PersonalExpenseGroup, PersonalExpenseOverview } from '@/types/personal-expense';
import { useAuthStore } from '@/stores/auth-store';

const API_BASE_URL = envConf.NEXT_PUBLIC_API_ENDPOINT;

/**
 * Lấy danh sách nhóm chi tiêu
 * @returns Danh sách nhóm chi tiêu hoặc null nếu có lỗi
 */
export async function getPersonalExpenseGroups(): Promise<PersonalExpenseGroup[] | null> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/cost-sharing`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching expense groups:', error);
    return null;
  }
}

/**
 * Tạo nhóm chi tiêu mới
 * @param name Tên nhóm chi tiêu
 * @param description Mô tả nhóm chi tiêu
 * @returns Nhóm chi tiêu đã tạo hoặc null nếu có lỗi
 */
export async function createPersonalExpenseGroup(name: string, description: string): Promise<{
  success: boolean;
  data?: PersonalExpenseGroup;
  error?: string;
}> {
  try {
    // Sử dụng URL trực tiếp như trong curl command
    const endpoint = 'http://103.112.211.184:3001/api/cost-sharing';

    console.log('Endpoint being called:', endpoint);

    // Tạo payload chính xác như trong Swagger
    const payload = JSON.stringify({
      name: name,
      description: description
    });

    console.log('Payload JSON:', payload);

    // Lấy token từ store
    const { accessToken } = useAuthStore.getState();

    // Tạo request trực tiếp với fetch thay vì fetchWithAuth
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Authorization': `Bearer ${accessToken}`
      },
      body: payload,
    });

    const responseData = await response.json();
    console.log('API response status:', response.status);
    console.log('API response:', responseData);

    if (!response.ok) {
      return {
        success: false,
        error: responseData.message || `API error: ${response.status}`,
      };
    }

    return {
      success: true,
      data: responseData.data,
    };
  } catch (error) {
    console.error('Error creating expense group:', error);
    return {
      success: false,
      error: 'Không thể tạo nhóm chi tiêu. Vui lòng thử lại sau.',
    };
  }
}

/**
 * Lấy chi tiết tổng quan chi tiêu cá nhân
 * @param personalExpenseGroupId ID của nhóm chi tiêu cá nhân
 * @returns Tổng quan chi tiêu cá nhân hoặc null nếu có lỗi
 */
export async function getPersonalExpenseOverview(personalExpenseGroupId: string): Promise<PersonalExpenseOverview | null> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/cost-sharing/${personalExpenseGroupId}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching personal expense overview with id ${personalExpenseGroupId}:`, error);
    return null;
  }
}

/**
 * Tạo khoản chi tiêu cá nhân mới
 * @param data Dữ liệu khoản chi tiêu
 * @returns Kết quả tạo khoản chi tiêu
 */
export async function createPersonalExpense(data: {
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  personalExpenseGroupId: string;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Xác định endpoint dựa trên loại chi tiêu
    const endpoint = data.type === 'expense' ? 'expenses' : 'contribution';

    // Chuẩn bị dữ liệu gửi đi
    const requestData = {
      description: data.description,
      amount: data.amount,
      date: data.date,
      costSharingGroupId: data.personalExpenseGroupId,
      // Thêm các trường khác nếu cần
    };

    const response = await fetchWithAuth(`${API_BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const responseData = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: responseData.message || `API error: ${response.status}`,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error creating personal expense:', error);
    return {
      success: false,
      error: 'Không thể tạo khoản chi tiêu. Vui lòng thử lại sau.',
    };
  }
}

/**
 * Xóa khoản chi tiêu cá nhân
 * @param expenseId ID của khoản chi tiêu
 * @returns Kết quả xóa khoản chi tiêu
 */
export async function deletePersonalExpense(expenseId: string, type: 'income' | 'expense' = 'expense'): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Xác định endpoint dựa trên loại chi tiêu
    const endpoint = type === 'expense' ? 'expenses' : 'contribution';

    const response = await fetchWithAuth(`${API_BASE_URL}/${endpoint}/${expenseId}`, {
      method: 'DELETE',
    });

    const responseData = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: responseData.message || `API error: ${response.status}`,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error(`Error deleting personal expense ${expenseId}:`, error);
    return {
      success: false,
      error: 'Không thể xóa khoản chi tiêu. Vui lòng thử lại sau.',
    };
  }
}
