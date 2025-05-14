import { Trip, TripApiResponse, TripFromAPI, TripPaginationParams, TripDay, DayActivity, TripParticipant } from '@/types/trip';
import { fetchWithAuth } from '@/lib/fetcher';
import envConf from '@/app/config/config';
import { useAuthStore } from '@/stores/auth-store';

const API_BASE_URL = envConf.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3000';

// Định nghĩa interface cho dữ liệu lịch trình từ API
interface ItineraryFromAPI {
  id: number;
  tripId: string;
  dayNumber: number;
  location: string;
  startTime: string;
  endTime: string;
  description: string;
  createdAt: string;
}

/**
 * Chuyển đổi dữ liệu chuyến đi từ API sang định dạng sử dụng trong ứng dụng
 * @param tripFromAPI Dữ liệu chuyến đi từ API
 * @returns Dữ liệu chuyến đi đã chuyển đổi
 */
export function mapTripFromAPI(tripFromAPI: TripFromAPI): Trip {
  // Chuyển đổi danh sách người tham gia từ API sang định dạng sử dụng trong ứng dụng
  const participants: TripParticipant[] = tripFromAPI.participants?.map(p => ({
    id: p.id.toString(),
    name: p.name,
    email: p.email, // Lấy email từ user object nếu có
    avatar: p.user?.avatar,
    userId: p.userId,
    isOrganizer: p.userId === tripFromAPI.createdById, // Người tổ chức là người có userId = createdById
    isAccountHolder: p.isAccountHolder, // Người có tài khoản
    confirmed: true, // Mặc định là đã xác nhận
    permissions: {
      canPlanning: p.canPlanning,
      canManageExpenses: p.canManageExpenses
    }
  })) || [];

  // Xác định trạng thái của chuyến đi dựa trên thời gian
  const now = new Date();
  const startDate = new Date(tripFromAPI.startDate);
  const endDate = new Date(tripFromAPI.endDate);

  let status: Trip['status'];

  if (now < startDate) {
    // Nếu ngày hiện tại nhỏ hơn ngày bắt đầu => đang lên kế hoạch
    status = 'planning';
  } else if (now >= startDate && now <= endDate) {
    // Nếu ngày hiện tại trong khoảng thời gian chuyến đi => đang diễn ra
    status = 'ongoing';
  } else {
    // Nếu ngày hiện tại lớn hơn ngày kết thúc => đã hoàn thành
    status = 'completed';
  }

  return {
    id: tripFromAPI.id,
    title: tripFromAPI.name,
    description: tripFromAPI.description,
    destination: tripFromAPI.destination,
    startDate: tripFromAPI.startDate,
    endDate: tripFromAPI.endDate,
    status: status,
    visibility: tripFromAPI.visibility,
    participants: participants,
    days: [], // Sẽ được cập nhật khi lấy chi tiết
    expenses: [], // Sẽ được cập nhật khi lấy chi tiết
    incomes: [], // Sẽ được cập nhật khi lấy chi tiết
    createdAt: tripFromAPI.createdAt,
    updatedAt: tripFromAPI.updatedAt,
    createdBy: tripFromAPI.createdById,
    participantCount: tripFromAPI.participantCount || 0,
    participantNames: tripFromAPI.participantNames || [],
  };
}

/**
 * Lấy danh sách chuyến đi
 * @param params Tham số phân trang và sắp xếp
 * @returns Danh sách chuyến đi và thông tin phân trang
 */
export async function getTrips(params: TripPaginationParams = {}): Promise<{
  trips: Trip[];
  meta: TripApiResponse['meta'];
}> {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortDirection = 'DESC' } = params;

    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    queryParams.append('order', sortDirection);

    if (sortBy) {
      queryParams.append('sortBy', sortBy);
    }

    const url = `${API_BASE_URL}/trips?${queryParams.toString()}`;
    const response = await fetchWithAuth(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: TripApiResponse = await response.json();

    // Chuyển đổi dữ liệu từ API sang định dạng sử dụng trong ứng dụng
    const trips = data.data.map(mapTripFromAPI);

    return {
      trips,
      meta: data.meta,
    };
  } catch (error) {
    console.error('Error fetching trips:', error);
    // For development, return empty data
    return {
      trips: [],
      meta: {
        page: 1,
        limit: 10,
        itemCount: 0,
        pageCount: 0,
        hasPreviousPage: false,
        hasNextPage: false
      }
    };
  }
}

/**
 * Lấy chi tiết chuyến đi
 * @param id ID của chuyến đi
 * @returns Chi tiết chuyến đi hoặc null nếu có lỗi
 */
export async function getTripById(id: string): Promise<Trip | null> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/trips/${id}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Chuyển đổi dữ liệu từ API sang định dạng sử dụng trong ứng dụng
    return mapTripFromAPI(data.data);
  } catch (error) {
    console.error(`Error fetching trip with id ${id}:`, error);
    return null;
  }
}

/**
 * Tạo chuyến đi mới
 * @param tripData Dữ liệu chuyến đi mới
 * @returns Chuyến đi đã tạo hoặc null nếu có lỗi
 */
export async function createTrip(tripData: {
  title: string;
  description?: string;
  destination: string;
  startDate: string;
  endDate: string;
  visibility: 'public' | 'private';
}): Promise<Trip | null> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/trips`, {
      method: 'POST',
      body: JSON.stringify({
        name: tripData.title,
        description: tripData.description,
        destination: tripData.destination,
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        visibility: tripData.visibility,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Chuyển đổi dữ liệu từ API sang định dạng sử dụng trong ứng dụng
    return mapTripFromAPI(data.data);
  } catch (error) {
    console.error('Error creating trip:', error);
    return null;
  }
}

/**
 * Cập nhật chuyến đi
 * @param id ID của chuyến đi
 * @param tripData Dữ liệu cập nhật
 * @returns Chuyến đi đã cập nhật hoặc null nếu có lỗi
 */
export async function updateTrip(
  id: string,
  tripData: {
    title: string;
    description?: string;
    destination: string;
    startDate: string;
    endDate: string;
    visibility: 'public' | 'private';
  }
): Promise<Trip | null> {
  try {
    // Chuẩn bị dữ liệu gửi đi theo đúng định dạng API yêu cầu
    const updateData = {
      name: tripData.title,
      description: tripData.description || '',
      destination: tripData.destination,
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      visibility: tripData.visibility,
    };

    // Gọi API cập nhật chuyến đi với phương thức PATCH
    const response = await fetchWithAuth(`${API_BASE_URL}/trips/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Chuyển đổi dữ liệu từ API sang định dạng sử dụng trong ứng dụng
    return mapTripFromAPI(data.data);
  } catch (error) {
    console.error(`Error updating trip with id ${id}:`, error);
    return null;
  }
}

/**
 * Xóa chuyến đi
 * @param id ID của chuyến đi
 * @returns true nếu xóa thành công, false nếu có lỗi
 */
export async function deleteTrip(id: string): Promise<boolean> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/trips/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.statusCode === 200;
  } catch (error) {
    console.error(`Error deleting trip with id ${id}:`, error);
    return false;
  }
}

/**
 * Lấy lịch trình của chuyến đi
 * @param tripId ID của chuyến đi
 * @returns Danh sách lịch trình theo ngày hoặc null nếu có lỗi
 */
export async function getTripItineraries(tripId: string): Promise<TripDay[] | null> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/itineraries/by-trip/${tripId}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const itineraries: ItineraryFromAPI[] = data.data;

    // Nhóm các hoạt động theo ngày
    const itinerariesByDay = itineraries.reduce((acc, itinerary) => {
      const dayNumber = itinerary.dayNumber;

      if (!acc[dayNumber]) {
        acc[dayNumber] = [];
      }

      acc[dayNumber].push(itinerary);
      return acc;
    }, {} as Record<number, ItineraryFromAPI[]>);

    // Chuyển đổi sang định dạng TripDay[]
    const tripDays: TripDay[] = Object.entries(itinerariesByDay).map(([dayNumber, activities]) => {
      // Tính toán ngày dựa trên ngày bắt đầu của chuyến đi và số ngày
      const dayActivities: DayActivity[] = activities.map(activity => ({
        id: activity.id.toString(),
        title: activity.description,
        description: '',
        location: activity.location,
        startTime: activity.startTime,
        endTime: activity.endTime,
      }));

      // Sắp xếp các hoạt động theo thời gian bắt đầu
      const sortedActivities = [...dayActivities].sort((a, b) => {
        // Nếu không có thời gian bắt đầu, đặt xuống cuối
        if (!a.startTime) return 1;
        if (!b.startTime) return -1;
        return a.startTime.localeCompare(b.startTime);
      });

      return {
        id: `day-${dayNumber}`,
        dayNumber: parseInt(dayNumber),
        date: '', // Sẽ được cập nhật sau khi có thông tin chuyến đi
        activities: sortedActivities,
      };
    });

    return tripDays;
  } catch (error) {
    console.error(`Error fetching itineraries for trip ${tripId}:`, error);
    return null;
  }
}

// Định nghĩa interface cho dữ liệu người dùng từ API search
export interface UserSearchResult {
  id: string;
  name: string;
  email: string;
}

/**
 * Tìm kiếm người dùng theo từ khóa
 * @param keyword Từ khóa tìm kiếm (tên hoặc email)
 * @returns Danh sách người dùng phù hợp hoặc mảng rỗng nếu có lỗi
 */
export async function searchUsers(keyword: string): Promise<UserSearchResult[]> {
  try {
    if (!keyword || keyword.trim().length < 2) {
      return [];
    }

    const response = await fetchWithAuth(`${API_BASE_URL}/users/search?key=${encodeURIComponent(keyword)}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data as UserSearchResult[];
  } catch (error) {
    console.error(`Error searching users with keyword ${keyword}:`, error);
    return [];
  }
}

/**
 * Thêm người tham gia vào chuyến đi
 * @param tripId ID của chuyến đi
 * @param participantData Thông tin người tham gia
 * @returns true nếu thêm thành công, false nếu có lỗi
 */
export async function addTripParticipant(tripId: string, participantData: {
  userId?: string;
  name?: string;
  isAccountHolder: boolean;
  canPlanning: boolean;
  canManageExpenses: boolean;
}): Promise<boolean> {
  try {
    // Chuẩn bị dữ liệu gửi đi
    const payload = {
      userId: participantData.userId || null,
      name: participantData.userId ? null : participantData.name,
      isAccountHolder: participantData.userId ? true : participantData.isAccountHolder,
      canPlanning: participantData.canPlanning,
      canManageExpenses: participantData.canManageExpenses
    };

    const response = await fetchWithAuth(`${API_BASE_URL}/trips/${tripId}/participants`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.statusCode === 200 || data.statusCode === 201;
  } catch (error) {
    console.error(`Error adding participant to trip ${tripId}:`, error);
    return false;
  }
}

/**
 * Xóa người tham gia khỏi chuyến đi
 * @param tripId ID của chuyến đi
 * @param participantId ID của người tham gia
 * @returns true nếu xóa thành công, false nếu có lỗi
 */
export async function removeTripParticipant(tripId: string, participantId: string): Promise<boolean> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/trips/${tripId}/participants/${participantId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.statusCode === 200;
  } catch (error) {
    console.error(`Error removing participant ${participantId} from trip ${tripId}:`, error);
    return false;
  }
}

/**
 * Cập nhật quyền của người tham gia
 * @param tripId ID của chuyến đi
 * @param participantId ID của người tham gia
 * @param permissions Quyền cần cập nhật (canPlanning hoặc canManageExpenses)
 * @returns true nếu cập nhật thành công, false nếu có lỗi
 */
export async function updateParticipantPermissions(
  tripId: string,
  participantId: string,
  permissions: { canPlanning?: boolean; canManageExpenses?: boolean }
): Promise<boolean> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/trips/${tripId}/participants/${participantId}`, {
      method: 'PATCH',
      body: JSON.stringify(permissions),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.statusCode === 200;
  } catch (error) {
    console.error(`Error updating permissions for participant ${participantId} in trip ${tripId}:`, error);
    return false;
  }
}

/**
 * Interface cho dữ liệu hạng mục tham quan
 */
export interface ItineraryItem {
  id?: number;
  tripId: string;
  dayNumber: number;
  location: string;
  startTime: string;
  endTime: string;
  description: string;
  createdAt?: string;
}

/**
 * Thêm hạng mục tham quan mới
 * @param itineraryData Dữ liệu hạng mục tham quan
 * @returns Hạng mục tham quan đã được tạo hoặc null nếu có lỗi
 */
export async function createItinerary(itineraryData: ItineraryItem): Promise<{ success: boolean; data?: ItineraryItem; error?: string }> {
  try {
    // Log dữ liệu gửi đi để debug
    console.log('Creating itinerary with data:', itineraryData);
    console.log('Trip ID from data:', itineraryData.tripId);

    // Lấy tripId từ URL hiện tại nếu có
    const currentUrl = typeof window !== 'undefined' ? window.location.pathname : '';
    const tripIdFromUrl = currentUrl.match(/\/trips\/([^\/]+)/)?.[1];

    // Sử dụng tripId từ URL nếu có, nếu không thì sử dụng tripId từ dữ liệu
    const finalTripId = tripIdFromUrl || String(itineraryData.tripId);
    console.log('Trip ID from URL:', tripIdFromUrl);
    console.log('Final Trip ID to use:', finalTripId);

    // Tạo payload đúng định dạng cho API
    const payload = {
      tripId: finalTripId,
      dayNumber: Number(itineraryData.dayNumber),
      location: String(itineraryData.location),
      startTime: String(itineraryData.startTime),
      endTime: String(itineraryData.endTime),
      description: String(itineraryData.description)
    };

    console.log('Formatted payload:', payload);
    console.log('JSON payload:', JSON.stringify(payload));

    // Sử dụng fetch trực tiếp thay vì fetchWithAuth để có thể kiểm soát hoàn toàn request
    const { accessToken } = useAuthStore.getState();

    const response = await fetch(`${API_BASE_URL}/itineraries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log('API response status:', response.status);
    console.log('API response:', data);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `API error: ${response.status}`
      };
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('Error creating itinerary:', error);
    return {
      success: false,
      error: 'Không thể tạo hạng mục tham quan. Vui lòng thử lại sau.'
    };
  }
}

/**
 * Xóa hạng mục tham quan
 * @param itineraryId ID của hạng mục tham quan
 * @returns Kết quả xóa hạng mục tham quan
 */
export async function deleteItinerary(itineraryId: string | number): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/itineraries/${itineraryId}`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `API error: ${response.status}`
      };
    }

    return {
      success: true
    };
  } catch (error) {
    console.error(`Error deleting itinerary ${itineraryId}:`, error);
    return {
      success: false,
      error: 'Không thể xóa hạng mục tham quan. Vui lòng thử lại sau.'
    };
  }
}

/**
 * Lấy thông tin chuyến đi công khai (không cần đăng nhập)
 * @param id ID của chuyến đi
 * @returns Chi tiết chuyến đi hoặc null nếu có lỗi hoặc không công khai
 */
export async function getPublicTripById(id: string): Promise<Trip | null> {
  try {
    // Sử dụng fetch thường thay vì fetchWithAuth vì không cần xác thực
    const response = await fetch(`${API_BASE_URL}/trips/public/${id}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Chuyển đổi dữ liệu từ API sang định dạng sử dụng trong ứng dụng
    return mapTripFromAPI(data.data);
  } catch (error) {
    console.error(`Error fetching public trip with id ${id}:`, error);
    return null;
  }
}

/**
 * Interface cho dữ liệu nhóm chi tiêu
 */
export interface CostSharingGroup {
  id: string;
  name: string;
  createdAt: string;
  tripId: string;
  deleted: boolean;
}

/**
 * Lấy danh sách nhóm chi tiêu của chuyến đi
 * @param tripId ID của chuyến đi
 * @returns Danh sách nhóm chi tiêu hoặc mảng rỗng nếu có lỗi
 */
export async function getCostSharingGroups(tripId: string): Promise<CostSharingGroup[]> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/cost-sharing/by-trip/${tripId}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data as CostSharingGroup[];
  } catch (error) {
    console.error(`Error fetching cost sharing groups for trip ${tripId}:`, error);
    return [];
  }
}

/**
 * Interface cho thành viên nhóm chi tiêu
 */
export interface CostSharingGroupMember {
  id: string;
  name: string | null;
  user: {
    id: string;
    name: string;
  } | null;
}

/**
 * Lấy danh sách thành viên của nhóm chi tiêu
 * @param costSharingGroupId ID của nhóm chi tiêu
 * @returns Danh sách thành viên hoặc mảng rỗng nếu có lỗi
 */
export async function getCostSharingGroupMembers(costSharingGroupId: string): Promise<CostSharingGroupMember[]> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/expenses/get-all-member/${costSharingGroupId}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data as CostSharingGroupMember[];
  } catch (error) {
    console.error(`Error fetching cost sharing group members for group ${costSharingGroupId}:`, error);
    return [];
  }
}

/**
 * Interface cho dữ liệu tạo chi tiêu
 */
export interface CreateExpenseData {
  description: string;
  amount: number;
  date: string;
  type: string;
  costSharingGroupId: string;
  costSharingGroupParticipantId: string;
}

/**
 * Tạo chi tiêu mới
 * @param data Dữ liệu chi tiêu
 * @returns Kết quả tạo chi tiêu
 */
export async function createExpense(data: CreateExpenseData): Promise<{
  success: boolean;
  data?: {
    id: string;
    amount: string;
    description: string;
    date: string;
    type: string;
    costSharingGroupParticipantId: string;
  };
  error?: string;
}> {
  try {
    console.log('Sending expense data:', data);

    const response = await fetchWithAuth(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    console.log('API response:', responseData);

    if (!response.ok) {
      console.error('API error:', responseData);
      return {
        success: false,
        error: responseData.message || `API error: ${response.status}`
      };
    }

    return {
      success: true,
      data: responseData.data
    };
  } catch (error) {
    console.error('Error creating expense:', error);
    return {
      success: false,
      error: 'Không thể tạo chi tiêu. Vui lòng thử lại sau.'
    };
  }
}

/**
 * Tạo quỹ nhóm chi tiêu cho chuyến đi
 * @param tripId ID của chuyến đi
 * @returns Kết quả tạo quỹ nhóm chi tiêu
 */
export async function createCostSharingGroup(tripId: string): Promise<{
  success: boolean;
  data?: CostSharingGroup;
  error?: string;
}> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/cost-sharing/create-by-trip/${tripId}`, {
      method: 'POST',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `API error: ${response.status}`
      };
    }

    return {
      success: true,
      data: data.data as CostSharingGroup
    };
  } catch (error) {
    console.error(`Error creating cost sharing group for trip ${tripId}:`, error);
    return {
      success: false,
      error: 'Không thể tạo quỹ nhóm chi tiêu. Vui lòng thử lại sau.'
    };
  }
}

/**
 * Lấy lịch trình của chuyến đi công khai (không cần đăng nhập)
 * @param tripId ID của chuyến đi
 * @returns Danh sách lịch trình theo ngày hoặc null nếu có lỗi
 */
export async function getPublicTripItineraries(tripId: string): Promise<TripDay[] | null> {
  try {
    // Sử dụng fetch thường thay vì fetchWithAuth vì không cần xác thực
    const response = await fetch(`${API_BASE_URL}/itineraries/public/by-trip/${tripId}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const itineraries: ItineraryFromAPI[] = data.data;

    // Nhóm các hoạt động theo ngày
    const itinerariesByDay = itineraries.reduce((acc, itinerary) => {
      const dayNumber = itinerary.dayNumber;

      if (!acc[dayNumber]) {
        acc[dayNumber] = [];
      }

      acc[dayNumber].push(itinerary);
      return acc;
    }, {} as Record<number, ItineraryFromAPI[]>);

    // Chuyển đổi sang định dạng TripDay[]
    const tripDays: TripDay[] = Object.entries(itinerariesByDay).map(([dayNumber, activities]) => {
      // Tính toán ngày dựa trên ngày bắt đầu của chuyến đi và số ngày
      const dayActivities: DayActivity[] = activities.map(activity => ({
        id: activity.id.toString(),
        title: activity.description,
        description: '',
        location: activity.location,
        startTime: activity.startTime,
        endTime: activity.endTime,
      }));

      // Sắp xếp các hoạt động theo thời gian bắt đầu
      const sortedActivities = [...dayActivities].sort((a, b) => {
        // Nếu không có thời gian bắt đầu, đặt xuống cuối
        if (!a.startTime) return 1;
        if (!b.startTime) return -1;
        return a.startTime.localeCompare(b.startTime);
      });

      return {
        id: `day-${dayNumber}`,
        dayNumber: parseInt(dayNumber),
        date: '', // Sẽ được cập nhật sau khi có thông tin chuyến đi
        activities: sortedActivities,
      };
    });

    return tripDays;
  } catch (error) {
    console.error(`Error fetching public itineraries for trip ${tripId}:`, error);
    return null;
  }
}

/**
 * Lấy chi tiết tổng quan chi tiêu
 * @param costSharingGroupId ID của nhóm chi tiêu
 * @returns Tổng quan chi tiêu hoặc null nếu có lỗi
 */
export async function getCostSharingOverview(costSharingGroupId: string): Promise<import('@/types/expense').CostSharingOverview | null> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/cost-sharing/${costSharingGroupId}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching cost sharing overview with id ${costSharingGroupId}:`, error);
    return null;
  }
}

/**
 * Xóa chi tiêu
 * @param expenseId ID của chi tiêu
 * @returns Kết quả xóa chi tiêu
 */
export async function deleteExpense(expenseId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/expenses/${expenseId}`, {
      method: 'DELETE',
    });

    const responseData = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: responseData.message || `API error: ${response.status}`
      };
    }

    return {
      success: true
    };
  } catch (error) {
    console.error(`Error deleting expense ${expenseId}:`, error);
    return {
      success: false,
      error: 'Không thể xóa khoản chi. Vui lòng thử lại sau.'
    };
  }
}

/**
 * Xóa đóng góp
 * @param contributionId ID của đóng góp
 * @returns Kết quả xóa đóng góp
 */
export async function deleteContribution(contributionId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/contribution/${contributionId}`, {
      method: 'DELETE',
    });

    const responseData = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: responseData.message || `API error: ${response.status}`
      };
    }

    return {
      success: true
    };
  } catch (error) {
    console.error(`Error deleting contribution ${contributionId}:`, error);
    return {
      success: false,
      error: 'Không thể xóa khoản đóng góp. Vui lòng thử lại sau.'
    };
  }
}
