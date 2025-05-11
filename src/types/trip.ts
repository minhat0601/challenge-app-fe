// Định nghĩa các types cho tính năng kế hoạch chuyến đi

// Trạng thái của chuyến đi
export type TripStatus = 'planning' | 'ongoing' | 'completed' | 'cancelled';

// Chế độ hiển thị
export type TripVisibility = 'public' | 'private';

// Thông tin người tham gia
export interface TripParticipant {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  userId?: string | null; // ID của người dùng (nếu có tài khoản)
  isOrganizer: boolean; // Người tạo chuyến đi (userId = createdById)
  isAccountHolder: boolean; // Người có tài khoản trên hệ thống
  confirmed: boolean;
  permissions?: {
    canPlanning: boolean;
    canManageExpenses: boolean;
  };
}

// Hoạt động trong ngày
export interface DayActivity {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startTime?: string; // Định dạng HH:MM
  endTime?: string; // Định dạng HH:MM
  notes?: string;
  cost?: number;
}

// Lịch trình theo ngày
export interface TripDay {
  id: string;
  dayNumber: number;
  date: string; // Định dạng YYYY-MM-DD
  activities: DayActivity[];
}

// Thông tin chi phí
export interface TripExpense {
  id: string;
  title: string;
  amount: number;
  category: 'accommodation' | 'food' | 'transportation' | 'activities' | 'other';
  paidBy: string; // ID của người trả
  sharedBy: string[]; // IDs của những người chia sẻ chi phí
  date: string; // Định dạng YYYY-MM-DD
  notes?: string;
  relatedActivityId?: string; // ID của hoạt động liên quan (nếu có)
}

// Thông tin thu nhập (đóng góp vào quỹ chung)
export interface TripIncome {
  id: string;
  title: string;
  amount: number;
  source: 'participant' | 'other';
  contributedBy: string; // ID của người đóng góp
  date: string; // Định dạng YYYY-MM-DD
  notes?: string;
}

// Thông tin thanh toán giữa các thành viên
export interface TripPayment {
  id: string;
  fromParticipantId: string; // Người trả
  toParticipantId: string; // Người nhận
  amount: number;
  status: 'pending' | 'completed';
  date?: string; // Ngày thanh toán
}

// Thông tin người tham gia từ API
export interface TripParticipantFromAPI {
  id: number;
  tripId: string;
  userId: string | null;
  name: string;
  isAccountHolder: boolean;
  canPlanning: boolean;
  canManageExpenses: boolean;
  createdAt: string;
  user: any | null; // Có thể mở rộng thêm nếu cần
}

// Thông tin chuyến đi từ API
export interface TripFromAPI {
  id: string;
  name: string;
  description?: string;
  destination: string;
  startDate: string; // Định dạng YYYY-MM-DD
  endDate: string; // Định dạng YYYY-MM-DD
  visibility: TripVisibility;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  participantCount: number;
  participantNames: string[];
  participants: TripParticipantFromAPI[];
}

// Thông tin chuyến đi đầy đủ
export interface Trip {
  id: string;
  title: string; // Tương ứng với name từ API
  description?: string;
  destination: string;
  startDate: string; // Định dạng YYYY-MM-DD
  endDate: string; // Định dạng YYYY-MM-DD
  status: TripStatus;
  visibility: TripVisibility;
  participants: TripParticipant[];
  days: TripDay[];
  expenses: TripExpense[];
  incomes: TripIncome[];
  payments?: TripPayment[];
  createdAt: string;
  updatedAt: string;

  createdBy: string; // ID của người tạo
  participantCount: number; // Số người tham gia
  participantNames: string[]; // Tên các người tham gia
}

// Response từ API
export interface TripApiResponse {
  message: string;
  statusCode: number;
  data: TripFromAPI[];
  meta: {
    page: number;
    limit: number;
    itemCount: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

// Params cho phân trang
export interface TripPaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

// Thông tin tổng hợp chi tiêu
export interface TripExpenseSummary {
  totalExpenses: number;
  totalIncomes: number;
  balance: number;
  expensesByCategory: Record<string, number>;
  participantBalances: {
    participantId: string;
    name: string;
    paid: number;
    owed: number;
    balance: number;
  }[];
}
