'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Trip, TripExpenseSummary, TripDay } from '@/types/trip';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate, formatDateWithMonth } from '@/utils/date';
import { formatCurrency } from '@/utils/format';
import { CostSharingOverview } from '@/types/expense';
import TripDayCard from '@/components/trips/trip-day-card';
import TripExpensesSummary from '@/components/trips/trip-expenses-summary';
import AddParticipantDialog from '@/components/trips/add-participant-dialog';
import ParticipantListDialog from '@/components/trips/participant-list-dialog';
import AddItineraryDialog from '@/components/trips/add-itinerary-dialog';
import { CreateCostSharingDialog } from '@/components/trips/create-cost-sharing-dialog';
import { CreateExpenseDialog } from '@/components/trips/create-expense-dialog';
import { CreateContributionDialog } from '@/components/trips/create-contribution-dialog';
import { DeleteExpenseDialog } from '@/components/trips/delete-expense-dialog';
import { DeleteContributionDialog } from '@/components/trips/delete-contribution-dialog';
import { useIsMobile } from '@/hooks/use-media-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Calendar,
  Check,
  Clock,
  Edit,
  Globe,
  Grid,
  LayoutList,
  Lock,
  MapPin,
  MoreHorizontal,
  PiggyBank,
  Plus,
  Receipt,
  Scale,
  Share2,
  Trash2,
  TrendingDown,
  TrendingUp,
  User,
  Users,
  DollarSign,
  UserPlus,
  ChevronRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { getTripById, getTripItineraries, getCostSharingGroups, getCostSharingOverview, CostSharingGroup } from '@/services/trip-service';


// Mock data cho tổng hợp chi tiêu
const MOCK_EXPENSE_SUMMARY: TripExpenseSummary = {
  totalExpenses: 5000000,
  totalIncomes: 5000000,
  balance: 0,
  expensesByCategory: {
    accommodation: 2400000,
    food: 500000,
    transportation: 1200000,
    activities: 900000,
  },
  participantBalances: [
    {
      participantId: '1',
      name: 'Nguyễn Văn A',
      paid: 3900000,
      owed: 1666667,
      balance: 2233333,
    },
    {
      participantId: '2',
      name: 'Trần Thị B',
      paid: 500000,
      owed: 1666667,
      balance: -1166667,
    },
    {
      participantId: '3',
      name: 'Lê Văn C',
      paid: 600000,
      owed: 1666667,
      balance: -1066667,
    },
  ],
};

export default function TripDetailPage() {
  const router = useRouter();
  const params = useParams();
  const isMobile = useIsMobile();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [tripDays, setTripDays] = useState<TripDay[]>([]);
  const [expenseSummary, setExpenseSummary] = useState<TripExpenseSummary | null>(null);
  const [costSharingGroups, setCostSharingGroups] = useState<CostSharingGroup[]>([]);
  const [costSharingOverview, setCostSharingOverview] = useState<CostSharingOverview | null>(null);
  const [loadingCostSharing, setLoadingCostSharing] = useState(true);
  const [loading, setLoading] = useState(true);
  const [expenseSortBy, setExpenseSortBy] = useState<'date' | 'amount' | 'name'>('date');
  const [expenseSortOrder, setExpenseSortOrder] = useState<'asc' | 'desc'>('desc');
  const [activeTab, setActiveTab] = useState('itinerary');
  const [viewMode, setViewMode] = useState<'card' | 'table'>(isMobile ? 'table' : 'card');

  // Cập nhật viewMode khi kích thước màn hình thay đổi
  useEffect(() => {
    if (isMobile) {
      setViewMode('table');
    }
  }, [isMobile]);

  // Lấy id từ params một cách an toàn
  const tripId = typeof params?.id === 'string' ? params.id : '';

  // Hàm sắp xếp danh sách chi tiêu
  const getSortedExpenses = () => {
    if (!costSharingOverview || !costSharingOverview.expenses) return [];

    return [...costSharingOverview.expenses].sort((a, b) => {
      if (expenseSortBy === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return expenseSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (expenseSortBy === 'amount') {
        const amountA = Number(a.amount);
        const amountB = Number(b.amount);
        return expenseSortOrder === 'asc' ? amountA - amountB : amountB - amountA;
      } else if (expenseSortBy === 'name') {
        const nameA = (a.paiderName || a.user?.name || '').toLowerCase();
        const nameB = (b.paiderName || b.user?.name || '').toLowerCase();
        return expenseSortOrder === 'asc'
          ? nameA.localeCompare(nameB, 'vi')
          : nameB.localeCompare(nameA, 'vi');
      }
      return 0;
    });
  };

  // Lấy dữ liệu chuyến đi
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Gọi API lấy thông tin chuyến đi
        const tripData = await getTripById(tripId);

        if (!tripData) {
          throw new Error('Không thể tải thông tin chuyến đi');
        }

        setTrip(tripData);

        // Gọi API lấy lịch trình
        const itineraries = await getTripItineraries(tripId);

        if (itineraries) {
          // Cập nhật ngày cho mỗi ngày trong lịch trình
          const startDate = new Date(tripData.startDate);
          const updatedItineraries = itineraries.map(day => {
            const dayDate = new Date(startDate);
            dayDate.setDate(startDate.getDate() + day.dayNumber - 1);

            return {
              ...day,
              date: dayDate.toISOString().split('T')[0] // Format YYYY-MM-DD
            };
          });

          setTripDays(updatedItineraries);
        }

        // Tạm thời sử dụng mock data cho phần chi tiêu
        setExpenseSummary(MOCK_EXPENSE_SUMMARY);

        // Lấy danh sách nhóm chi tiêu
        setLoadingCostSharing(true);
        const costSharingData = await getCostSharingGroups(tripId);
        setCostSharingGroups(costSharingData);

        // Nếu có nhóm chi tiêu, lấy thông tin chi tiết
        if (costSharingData.length > 0) {
          try {
            console.log('Fetching cost sharing overview for group:', costSharingData[0].id);
            const overviewData = await getCostSharingOverview(costSharingData[0].id);
            if (overviewData) {
              console.log('Cost sharing overview data:', overviewData);
              setCostSharingOverview(overviewData);
            }
          } catch (error) {
            console.error('Error fetching cost sharing overview:', error);
            toast.error('Không thể tải thông tin chi tiêu');
          }
        }

        setLoadingCostSharing(false);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching trip details:', error);
        toast.error('Không thể tải thông tin chuyến đi');
        setTrip(null);
        setTripDays([]);
        setExpenseSummary(null);
        setCostSharingGroups([]);
        setLoading(false);
        setLoadingCostSharing(false);
      }
    };

    fetchData();
  }, [tripId]);

  // Hàm định dạng trạng thái chuyến đi
  const getStatusBadge = (status: Trip['status']) => {
    switch (status) {
      case 'planning':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Đang lên kế hoạch</Badge>;
      case 'ongoing':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Đang diễn ra</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">Đã hoàn thành</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Đã hủy</Badge>;
      default:
        return null;
    }
  };

  // Xử lý thêm hoạt động
  const handleAddActivity = (dayId: string) => {
    // Tìm ngày tương ứng với dayId
    const day = tripDays.find(d => d.id === dayId);
    if (day) {
      // Tìm nút thêm hoạt động cho ngày cụ thể và click vào nó
      document.getElementById(`add-activity-day-${day.dayNumber}`)?.click();
    }
  };

  // Xử lý chỉnh sửa hoạt động
  const handleEditActivity = (dayId: string, activityId: string) => {
    // Trong thực tế, sẽ mở modal hoặc chuyển hướng đến trang chỉnh sửa hoạt động
    toast.info(`Chỉnh sửa hoạt động ${activityId} của ngày ${tripDays.find(d => d.id === dayId)?.dayNumber}`);
  };

  // Xử lý xóa hoạt động
  const handleDeleteActivity = (dayId: string, activityId: string) => {
    // Cập nhật lại danh sách hạng mục sau khi xóa
    if (trip) {
      getTripItineraries(tripId).then(data => {
        if (data) {
          // Cập nhật ngày cho mỗi ngày trong lịch trình
          const startDate = new Date(trip.startDate);
          const updatedItineraries = data.map(day => {
            const dayDate = new Date(startDate);
            dayDate.setDate(startDate.getDate() + day.dayNumber - 1);

            return {
              ...day,
              date: dayDate.toISOString().split('T')[0] // Format YYYY-MM-DD
            };
          });

          setTripDays(updatedItineraries);
        }
      });
    }
  };

  // Xử lý xóa chuyến đi
  const handleDeleteTrip = async () => {
    if (confirm('Bạn có chắc chắn muốn xóa chuyến đi này không?')) {
      try {
        // Trong thực tế, sẽ gọi API ở đây
        // await deleteTrip(tripId);

        // Mock xóa
        toast.success('Đã xóa chuyến đi thành công');
        router.push('/dashboard/trips');
      } catch (error) {
        console.error('Error deleting trip:', error);
        toast.error('Không thể xóa chuyến đi');
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <Skeleton className="h-9 w-24" />
        </div>

        <div className="h-40 bg-muted rounded-lg">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        <Skeleton className="h-10 w-full" />

        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-6">
              <Skeleton className="h-6 w-1/4 mb-4" />
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
          <MapPin className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">Không tìm thấy chuyến đi</h3>
        <p className="text-muted-foreground mt-2 mb-6">Chuyến đi này không tồn tại hoặc bạn không có quyền truy cập.</p>
        <Button onClick={() => router.push('/dashboard/trips')}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push(`/dashboard/trips/${tripId}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => toast.info('Đã sao chép liên kết chia sẻ')}>
                <Share2 className="h-4 w-4 mr-2" />
                Chia sẻ
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDeleteTrip} className="text-red-500 focus:text-red-500">
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa chuyến đi
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Ảnh bìa */}
      <div
        className="h-40 bg-cover bg-center rounded-lg relative"
        style={{ backgroundImage: `url(${'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000'})` }}
      >
        <div className="absolute inset-0 bg-black/20 rounded-lg flex items-end p-4">
          <div className="flex items-center gap-2">
            {getStatusBadge(trip.status)}
            {trip.visibility === 'private' ? (
              <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">
                <Lock className="h-3 w-3 mr-1" />
                Riêng tư
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                <Globe className="h-3 w-3 mr-1" />
                Công khai
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Thông tin chuyến đi */}
      <div>
        <h1 className="text-2xl font-bold">{trip.title}</h1>

        <div className="flex flex-wrap gap-4 mt-2">
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{trip.destination}</span>
          </div>

          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
          </div>

          <div className="flex items-center text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            <span>{tripDays.length > 0 ? tripDays.length : Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24))} ngày</span>
          </div>

          <div className="flex items-center text-muted-foreground">
            <Users className="h-4 w-4 mr-1" />
            <span>{trip.participants.length} người tham gia</span>
          </div>
        </div>

        {trip.description && (
          <p className="text-muted-foreground mt-4">{trip.description}</p>
        )}
      </div>

      {/* Người tham gia */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-lg font-medium">Người tham gia</h3>
          <div className="flex flex-wrap items-center gap-2">
            <ParticipantListDialog
              tripId={tripId}
              participants={trip.participants}
              onParticipantRemoved={() => {
                // Reload trip data after removing a participant
                getTripById(tripId).then(data => {
                  if (data) setTrip(data);
                });
              }}
              onPermissionsUpdated={() => {
                // Reload trip data after updating permissions
                getTripById(tripId).then(data => {
                  if (data) setTrip(data);
                });
              }}
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground h-9 px-3 text-sm w-full sm:w-auto justify-start sm:justify-center"
                  id="view-all-participants-trigger"
                >
                  <Users className="h-4 w-4 mr-1.5" />
                  Xem tất cả ({trip.participants.length})
                </Button>
              }
            />
            <AddParticipantDialog
              tripId={tripId}
              onParticipantAdded={() => {
                // Reload trip data after adding a participant
                getTripById(tripId).then(data => {
                  if (data) setTrip(data);
                });
              }}
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 text-sm w-full sm:w-auto justify-start sm:justify-center"
                >
                  <UserPlus className="h-4 w-4 mr-1.5" />
                  Thêm người tham gia
                </Button>
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2 sm:gap-3">
          {trip.participants.length === 0 ? (
            <p className="text-muted-foreground">Chưa có người tham gia nào</p>
          ) : (
            <>
              {/* Hiển thị tối đa 5 người */}
              {trip.participants.slice(0, 5).map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center bg-muted/50 rounded-lg p-2.5 border border-border/50 cursor-pointer hover:bg-muted transition-colors w-full sm:w-auto"
                  onClick={() => {
                    // Mở dialog danh sách người tham gia khi bấm vào bất kỳ người nào
                    document.getElementById('participant-list-trigger')?.click();
                  }}
                >
                  <Avatar className="h-8 w-8 border-2 border-background flex-shrink-0">
                    <AvatarImage src={participant.avatar} />
                    <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="ml-2 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-medium truncate">{participant.name}</p>
                      {participant.isOrganizer && (
                        <span className="px-1 py-0.5 rounded-sm text-[9px] font-medium bg-primary/10 text-primary border border-primary/20 flex-shrink-0">
                          Tổ chức
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {!participant.isAccountHolder ? 'Không có tài khoản' : participant.email || (participant.confirmed ? 'Đã xác nhận' : 'Chưa xác nhận')}
                    </p>
                  </div>
                </div>
              ))}

              {/* Hiển thị thông báo nếu có nhiều hơn 5 người */}
              {trip.participants.length > 5 && (
                <Button
                  variant="ghost"
                  className="flex items-center bg-muted/30 rounded-lg p-2.5 h-auto border border-border/50 hover:bg-muted transition-colors w-full sm:w-auto justify-start"
                  id="participant-list-trigger"
                  onClick={() => {
                    // Mở dialog danh sách người tham gia
                    document.getElementById('view-all-participants-trigger')?.click();
                  }}
                >
                  <span className="text-sm">và {trip.participants.length - 5} người khác...</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="itinerary">Lịch trình</TabsTrigger>
          <TabsTrigger value="expenses">Chi tiêu & Chia tiền</TabsTrigger>
        </TabsList>

        <TabsContent value="itinerary" className="space-y-6 mt-6">
          {/* Nút thêm hạng mục tham quan */}
          <div className="flex justify-end">
            <AddItineraryDialog
              trip={trip}
              onItineraryAdded={() => {
                // Reload trip data after adding an itinerary
                getTripItineraries(tripId).then(data => {
                  if (data) {
                    // Cập nhật ngày cho mỗi ngày trong lịch trình
                    const startDate = new Date(trip.startDate);
                    const updatedItineraries = data.map(day => {
                      const dayDate = new Date(startDate);
                      dayDate.setDate(startDate.getDate() + day.dayNumber - 1);

                      return {
                        ...day,
                        date: dayDate.toISOString().split('T')[0] // Format YYYY-MM-DD
                      };
                    });

                    setTripDays(updatedItineraries);
                  }
                });
              }}
            />
          </div>

          {/* Danh sách ngày */}
          {tripDays.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Chưa có lịch trình</h3>
              <p className="text-muted-foreground mt-2 mb-6">Hãy thêm ngày đầu tiên cho chuyến đi của bạn.</p>
              <AddItineraryDialog
                trip={trip}
                onItineraryAdded={() => {
                  // Reload trip data after adding an itinerary
                  getTripItineraries(tripId).then(data => {
                    if (data) {
                      // Cập nhật ngày cho mỗi ngày trong lịch trình
                      const startDate = new Date(trip.startDate);
                      const updatedItineraries = data.map(day => {
                        const dayDate = new Date(startDate);
                        dayDate.setDate(startDate.getDate() + day.dayNumber - 1);

                        return {
                          ...day,
                          date: dayDate.toISOString().split('T')[0] // Format YYYY-MM-DD
                        };
                      });

                      setTripDays(updatedItineraries);
                    }
                  });
                }}
                trigger={
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm hạng mục tham quan
                  </Button>
                }
              />
            </div>
          ) : (
            tripDays.map((day) => (
              <TripDayCard
                key={day.id}
                day={day}
                trip={trip}
                onAddActivity={handleAddActivity}
                onEditActivity={handleEditActivity}
                onDeleteActivity={handleDeleteActivity}
                onItineraryAdded={() => {
                  // Reload trip data after adding an itinerary
                  getTripItineraries(tripId).then(data => {
                    if (data) {
                      // Cập nhật ngày cho mỗi ngày trong lịch trình
                      const startDate = new Date(trip.startDate);
                      const updatedItineraries = data.map(day => {
                        const dayDate = new Date(startDate);
                        dayDate.setDate(startDate.getDate() + day.dayNumber - 1);

                        return {
                          ...day,
                          date: dayDate.toISOString().split('T')[0] // Format YYYY-MM-DD
                        };
                      });

                      setTripDays(updatedItineraries);
                    }
                  });
                }}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="expenses" className="mt-6">
          {loadingCostSharing ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : costSharingGroups.length > 0 ? (
            // Hiển thị giao diện chi tiêu khi đã có quỹ chia tiền
            <div>
              {costSharingOverview ? (
                <div className="space-y-6">
                  <div className="flex justify-end space-x-2">
                    {costSharingGroups.length > 0 && (
                      <>
                        <CreateExpenseDialog
                          costSharingGroupId={costSharingGroups[0].id}
                          groupBalance={costSharingOverview.totalContributions - costSharingOverview.totalGroupExpense}
                          onExpenseCreated={async () => {
                            // Tải lại dữ liệu chi tiêu sau khi tạo thành công
                            try {
                              console.log('Refreshing cost sharing data after expense creation');
                              const overviewData = await getCostSharingOverview(costSharingGroups[0].id);
                              if (overviewData) {
                                console.log('New cost sharing overview data:', overviewData);
                                setCostSharingOverview(overviewData);
                              }
                            } catch (error) {
                              console.error('Error refreshing cost sharing data:', error);
                              toast.error('Không thể tải lại thông tin chi tiêu');
                            }
                          }}
                          trigger={
                            <Button>
                              <Plus className="h-4 w-4 mr-2" />
                              Thêm khoản chi
                            </Button>
                          }
                        />

                        <CreateContributionDialog
                          costSharingGroupId={costSharingGroups[0].id}
                          onContributionCreated={async () => {
                            // Tải lại dữ liệu chi tiêu sau khi tạo đóng góp thành công
                            try {
                              console.log('Refreshing cost sharing data after contribution creation');
                              const overviewData = await getCostSharingOverview(costSharingGroups[0].id);
                              if (overviewData) {
                                console.log('New cost sharing overview data:', overviewData);
                                setCostSharingOverview(overviewData);
                              }
                            } catch (error) {
                              console.error('Error refreshing cost sharing data:', error);
                              toast.error('Không thể tải lại thông tin chi tiêu');
                            }
                          }}
                          trigger={
                            <Button variant="outline" className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/30">
                              <Plus className="h-4 w-4 mr-2" />
                              Thêm khoản đóng quỹ
                            </Button>
                          }
                        />
                      </>
                    )}
                  </div>

                  {/* Thêm nút đóng góp riêng để dễ nhìn hơn */}
                  <div className="flex justify-end mt-4">
                    {costSharingGroups.length > 0 && (
                      <CreateContributionDialog
                        costSharingGroupId={costSharingGroups[0].id}
                        onContributionCreated={async () => {
                          // Tải lại dữ liệu chi tiêu sau khi tạo đóng góp thành công
                          try {
                            console.log('Refreshing cost sharing data after contribution creation');
                            const overviewData = await getCostSharingOverview(costSharingGroups[0].id);
                            if (overviewData) {
                              console.log('New cost sharing overview data:', overviewData);
                              setCostSharingOverview(overviewData);
                            }
                          } catch (error) {
                            console.error('Error refreshing cost sharing data:', error);
                            toast.error('Không thể tải lại thông tin chi tiêu');
                          }
                        }}
                        trigger={
                          <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                            <PiggyBank className="h-5 w-5 mr-2" />
                            Đóng quỹ nhóm
                          </Button>
                        }
                      />
                    )}
                  </div>

                  {/* Hiển thị tổng quan chi tiêu */}
                  <div className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-primary" />
                      Tổng quan chi tiêu
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col">
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mr-2">
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          </div>
                          <span className="text-sm font-medium">Tổng chi tiêu</span>
                        </div>
                        <span className="text-xl font-bold text-red-500">{formatCurrency(costSharingOverview.totalExpense)}</span>
                        <div className="mt-2 text-xs text-muted-foreground">
                          <span className="inline-flex items-center mr-3">
                            <Users className="h-3 w-3 mr-1" />
                            Nhóm: {formatCurrency(costSharingOverview.totalGroupExpense)}
                          </span>
                          <span className="inline-flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            Cá nhân: {formatCurrency(costSharingOverview.totalPersonalExpense)}
                          </span>
                        </div>
                      </div>
                      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col">
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mr-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          </div>
                          <span className="text-sm font-medium">Tổng đóng góp</span>
                        </div>
                        <span className="text-xl font-bold text-green-500">{formatCurrency(costSharingOverview.totalContributions)}</span>
                        <div className="mt-2 text-xs text-muted-foreground">
                          <span className="inline-flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            Số lượng: {costSharingOverview.countContributions} khoản đóng góp
                          </span>
                        </div>
                      </div>
                      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col">
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mr-2">
                            <DollarSign className="h-4 w-4 text-blue-500" />
                          </div>
                          <span className="text-sm font-medium">Số dư quỹ nhóm</span>
                        </div>
                        <span className={`text-xl font-bold ${costSharingOverview.totalContributions - costSharingOverview.totalGroupExpense >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatCurrency(costSharingOverview.totalContributions - costSharingOverview.totalGroupExpense)}
                        </span>
                        {costSharingOverview.totalContributions - costSharingOverview.totalGroupExpense < 0 && (
                          <div className="mt-2 text-xs text-red-500 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Quỹ nhóm đang thiếu
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Hiển thị danh sách chi tiêu */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                      <h3 className="text-lg font-semibold flex items-center">
                        <Receipt className="h-5 w-5 mr-2 text-primary" />
                        Các khoản chi ra
                        <Badge className="ml-2 bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                          {costSharingOverview.countExpenses} khoản
                        </Badge>
                      </h3>

                      <div className="flex items-center space-x-2">
                        {!isMobile && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode(viewMode === 'card' ? 'table' : 'card')}
                            className="h-8 mr-2"
                          >
                            {viewMode === 'card' ? (
                              <><LayoutList className="h-4 w-4 mr-1" /> Dạng bảng</>
                            ) : (
                              <><Grid className="h-4 w-4 mr-1" /> Dạng thẻ</>
                            )}
                          </Button>
                        )}

                        <div className="text-sm text-muted-foreground mr-2 hidden sm:block">Sắp xếp theo:</div>
                        <Select
                          value={expenseSortBy}
                          onValueChange={(value) => setExpenseSortBy(value as 'date' | 'amount' | 'name')}
                        >
                          <SelectTrigger className="h-8 w-full sm:w-[130px]">
                            <span className="sm:hidden">Sắp xếp: </span>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="date">Ngày</SelectItem>
                            <SelectItem value="amount">Số tiền</SelectItem>
                            <SelectItem value="name">Người chi</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setExpenseSortOrder(expenseSortOrder === 'asc' ? 'desc' : 'asc')}
                          className="h-8 px-2"
                        >
                          {expenseSortOrder === 'asc' ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {costSharingOverview.expenses.length > 0 ? (
                      <>
                        {viewMode === 'card' && !isMobile ? (
                          <div className="space-y-3">
                            {getSortedExpenses().map((expense) => (
                              <div
                                key={expense.id}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                              >
                                <div className="flex items-start">
                                  <Avatar className="h-10 w-10 mr-3 border-2 border-slate-200 dark:border-slate-700 flex-shrink-0">
                                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                      {expense.user?.name
                                        ? expense.user.name.trim().split(' ').pop()?.charAt(0).toUpperCase() || 'U'
                                        : expense.paiderName
                                          ? expense.paiderName.trim().split(' ').pop()?.charAt(0).toUpperCase() || 'U'
                                          : 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                      <p className="font-medium truncate">{expense.description}</p>
                                      <Badge variant="outline" className={`whitespace-nowrap ${expense.type === 'group'
                                        ? 'bg-blue-500/10 text-blue-500 border-blue-200 dark:border-blue-800'
                                        : 'bg-purple-500/10 text-purple-500 border-purple-200 dark:border-purple-800'
                                      }`}>
                                        {expense.type === 'group' ? 'Quỹ nhóm' : 'Ứng tiền cá nhân'}
                                      </Badge>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center text-xs text-muted-foreground">
                                      <div className="flex items-center mb-1 sm:mb-0 sm:mr-3">
                                        <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                                        <span className="truncate">
                                          {new Date(expense.date).toLocaleDateString('vi-VN')} {new Date(expense.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      </div>
                                      <div className="flex items-center">
                                        <User className="h-3 w-3 mr-1 flex-shrink-0" />
                                        <span className="truncate">Chi bởi: {expense.paiderName || expense.user?.name || 'Không xác định'}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between mt-3 sm:mt-0 sm:justify-end">
                                  <div className="text-right sm:mr-4">
                                    <p className="font-medium text-red-500 text-lg">{formatCurrency(Number(expense.amount))}</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      Tạo bởi: {expense.createdBy.name}
                                    </p>
                                  </div>
                                  <DeleteExpenseDialog
                                    expenseId={expense.id}
                                    expenseName={expense.description}
                                    onExpenseDeleted={async () => {
                                      // Tải lại dữ liệu chi tiêu sau khi xóa thành công
                                      try {
                                        console.log('Refreshing cost sharing data after expense deletion');
                                        const overviewData = await getCostSharingOverview(costSharingGroups[0].id);
                                        if (overviewData) {
                                          console.log('New cost sharing overview data:', overviewData);
                                          setCostSharingOverview(overviewData);
                                        }
                                      } catch (error) {
                                        console.error('Error refreshing cost sharing data:', error);
                                        toast.error('Không thể tải lại thông tin chi tiêu');
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="border rounded-md overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                  <TableHead className="w-12 text-center">#</TableHead>
                                  <TableHead>Mô tả</TableHead>
                                  <TableHead>Loại</TableHead>
                                  <TableHead>Ngày giờ</TableHead>
                                  <TableHead>Người chi</TableHead>
                                  <TableHead className="text-right">Số tiền</TableHead>
                                  <TableHead className="w-12"></TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {getSortedExpenses().map((expense, index) => (
                                  <TableRow key={expense.id}>
                                    <TableCell className="text-center font-medium">{index + 1}</TableCell>
                                    <TableCell className="font-medium">{expense.description}</TableCell>
                                    <TableCell>
                                      <Badge variant="outline" className={`whitespace-nowrap ${expense.type === 'group'
                                        ? 'bg-blue-500/10 text-blue-500 border-blue-200 dark:border-blue-800'
                                        : 'bg-purple-500/10 text-purple-500 border-purple-200 dark:border-purple-800'
                                      }`}>
                                        {expense.type === 'group' ? 'Quỹ nhóm' : 'Ứng tiền cá nhân'}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                      {new Date(expense.date).toLocaleDateString('vi-VN')} {new Date(expense.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                    </TableCell>
                                    <TableCell>{expense.paiderName || expense.user?.name || 'Không xác định'}</TableCell>
                                    <TableCell className="text-right font-medium text-red-500">
                                      {formatCurrency(Number(expense.amount))}
                                    </TableCell>
                                    <TableCell>
                                      <DeleteExpenseDialog
                                        expenseId={expense.id}
                                        expenseName={expense.description}
                                        onExpenseDeleted={async () => {
                                          try {
                                            const overviewData = await getCostSharingOverview(costSharingGroups[0].id);
                                            if (overviewData) {
                                              setCostSharingOverview(overviewData);
                                            }
                                          } catch (error) {
                                            console.error('Error refreshing cost sharing data:', error);
                                            toast.error('Không thể tải lại thông tin chi tiêu');
                                          }
                                        }}
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-10 border border-dashed rounded-lg">
                        <Receipt className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">Chưa có khoản chi ra nào</p>
                        <CreateExpenseDialog
                          costSharingGroupId={costSharingGroups[0].id}
                          groupBalance={costSharingOverview.totalContributions - costSharingOverview.totalGroupExpense}
                          onExpenseCreated={async () => {
                            // Tải lại dữ liệu chi tiêu sau khi tạo thành công
                            try {
                              console.log('Refreshing cost sharing data after expense creation');
                              const overviewData = await getCostSharingOverview(costSharingGroups[0].id);
                              if (overviewData) {
                                console.log('New cost sharing overview data:', overviewData);
                                setCostSharingOverview(overviewData);
                              }
                            } catch (error) {
                              console.error('Error refreshing cost sharing data:', error);
                              toast.error('Không thể tải lại thông tin chi tiêu');
                            }
                          }}
                          trigger={
                            <Button variant="outline" className="mt-4">
                              <Plus className="h-4 w-4 mr-2" />
                              Thêm khoản chi đầu tiên
                            </Button>
                          }
                        />
                      </div>
                    )}
                  </div>

                  {/* Hiển thị danh sách đóng góp */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                      <h3 className="text-lg font-semibold flex items-center">
                        <PiggyBank className="h-5 w-5 mr-2 text-primary" />
                        Các khoản đóng quỹ
                        {costSharingOverview.countContributions > 0 && (
                          <Badge className="ml-2 bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                            {costSharingOverview.countContributions} khoản
                          </Badge>
                        )}
                      </h3>

                      {!isMobile && costSharingOverview.countContributions > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewMode(viewMode === 'card' ? 'table' : 'card')}
                          className="h-8"
                        >
                          {viewMode === 'card' ? (
                            <><LayoutList className="h-4 w-4 mr-1" /> Dạng bảng</>
                          ) : (
                            <><Grid className="h-4 w-4 mr-1" /> Dạng thẻ</>
                          )}
                        </Button>
                      )}
                    </div>

                    {costSharingOverview.contributions.length > 0 ? (
                      <>
                        {viewMode === 'card' && !isMobile ? (
                          <div className="space-y-3">
                            {costSharingOverview.contributions.map((contribution) => (
                              <div
                                key={contribution.id}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-900/30 transition-colors"
                              >
                                <div className="flex items-start">
                                  <Avatar className="h-10 w-10 mr-3 border-2 border-green-200 dark:border-green-800 flex-shrink-0">
                                    <AvatarFallback className="bg-green-100 text-green-600 font-medium dark:bg-green-900/30 dark:text-green-400">
                                      {contribution.user?.name
                                        ? contribution.user.name.trim().split(' ').pop()?.charAt(0).toUpperCase() || 'U'
                                        : contribution.paiderName
                                          ? contribution.paiderName.trim().split(' ').pop()?.charAt(0).toUpperCase() || 'U'
                                          : 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0 flex-1">
                                    <p className="font-medium truncate">{contribution.description}</p>
                                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                                      <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                                      <span className="truncate">
                                        {new Date(contribution.date).toLocaleDateString('vi-VN')} {new Date(contribution.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between mt-3 sm:mt-0 sm:justify-end">
                                  <div className="text-right sm:mr-4">
                                    <p className="font-medium text-green-600 text-lg dark:text-green-400">{formatCurrency(Number(contribution.amount))}</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      Đóng góp bởi: {contribution.paiderName || contribution.user?.name || 'Không xác định'}
                                    </p>
                                  </div>
                                  <DeleteContributionDialog
                                    contributionId={contribution.id}
                                    contributionName={contribution.description}
                                    onContributionDeleted={async () => {
                                      // Tải lại dữ liệu chi tiêu sau khi xóa thành công
                                      try {
                                        console.log('Refreshing cost sharing data after contribution deletion');
                                        const overviewData = await getCostSharingOverview(costSharingGroups[0].id);
                                        if (overviewData) {
                                          console.log('New cost sharing overview data:', overviewData);
                                          setCostSharingOverview(overviewData);
                                        }
                                      } catch (error) {
                                        console.error('Error refreshing cost sharing data:', error);
                                        toast.error('Không thể tải lại thông tin chi tiêu');
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="border rounded-md overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                  <TableHead className="w-12 text-center">#</TableHead>
                                  <TableHead>Mô tả</TableHead>
                                  <TableHead>Ngày giờ</TableHead>
                                  <TableHead>Người đóng góp</TableHead>
                                  <TableHead className="text-right">Số tiền</TableHead>
                                  <TableHead className="w-12"></TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {costSharingOverview.contributions.map((contribution, index) => (
                                  <TableRow key={contribution.id}>
                                    <TableCell className="text-center font-medium">{index + 1}</TableCell>
                                    <TableCell className="font-medium">{contribution.description}</TableCell>
                                    <TableCell className="whitespace-nowrap">
                                      {new Date(contribution.date).toLocaleDateString('vi-VN')} {new Date(contribution.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                    </TableCell>
                                    <TableCell>{contribution.paiderName || contribution.user?.name || 'Không xác định'}</TableCell>
                                    <TableCell className="text-right font-medium text-green-600 dark:text-green-400">
                                      {formatCurrency(Number(contribution.amount))}
                                    </TableCell>
                                    <TableCell>
                                      <DeleteContributionDialog
                                        contributionId={contribution.id}
                                        contributionName={contribution.description}
                                        onContributionDeleted={async () => {
                                          try {
                                            const overviewData = await getCostSharingOverview(costSharingGroups[0].id);
                                            if (overviewData) {
                                              setCostSharingOverview(overviewData);
                                            }
                                          } catch (error) {
                                            console.error('Error refreshing cost sharing data:', error);
                                            toast.error('Không thể tải lại thông tin chi tiêu');
                                          }
                                        }}
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-10 border border-dashed rounded-lg">
                        <PiggyBank className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">Chưa có khoản đóng quỹ nào</p>
                        <CreateContributionDialog
                          costSharingGroupId={costSharingGroups[0].id}
                          onContributionCreated={async () => {
                            // Tải lại dữ liệu chi tiêu sau khi tạo đóng góp thành công
                            try {
                              console.log('Refreshing cost sharing data after contribution creation');
                              const overviewData = await getCostSharingOverview(costSharingGroups[0].id);
                              if (overviewData) {
                                console.log('New cost sharing overview data:', overviewData);
                                setCostSharingOverview(overviewData);
                              }
                            } catch (error) {
                              console.error('Error refreshing cost sharing data:', error);
                              toast.error('Không thể tải lại thông tin chi tiêu');
                            }
                          }}
                          trigger={
                            <Button variant="outline" className="mt-4 bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/30">
                              <Plus className="h-4 w-4 mr-2" />
                              Thêm khoản đóng quỹ đầu tiên
                            </Button>
                          }
                        />
                      </div>
                    )}
                  </div>

                  {/* Hiển thị cân đối chi tiêu */}
                  {costSharingOverview.balances && Object.keys(costSharingOverview.balances).length > 0 && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold flex items-center">
                          <Scale className="h-5 w-5 mr-2 text-primary" />
                          Cân đối chi tiêu
                          <Badge className="ml-2 bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                            {Object.keys(costSharingOverview.balances).length} thành viên
                          </Badge>
                        </h3>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <p className="flex items-center mb-1">
                            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                            <span className="font-medium mr-1">Đã chi:</span> Thực tiền đã chi ra của mỗi cá nhân
                          </p>
                          <p className="flex items-center">
                            <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                            <span className="font-medium mr-1">Cần chi:</span> Thực tiền mỗi cá nhân phải chi
                          </p>
                          <p className="flex items-center">
                            <span className="font-medium mr-1">Được nhận:</span> Số tiền được nhận lại
                          </p>
                          <p className="flex items-center">
                            <span className="font-medium mr-1">Phải trả:</span> Số tiền phải trả thêm
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {Object.values(costSharingOverview.balances).map((balance) => (
                          <div
                            key={balance.costSharingGroupParticipantId}
                            className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border transition-colors ${
                              balance.balance >= 0
                                ? 'bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20 border-green-200 dark:border-green-900/30'
                                : 'bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 border-red-200 dark:border-red-900/30'
                            }`}
                          >
                            <div className="flex items-start">
                              <Avatar className={`h-10 w-10 mr-3 border-2 flex-shrink-0 ${
                                balance.balance >= 0
                                  ? 'border-green-200 dark:border-green-800'
                                  : 'border-red-200 dark:border-red-800'
                              }`}>
                                <AvatarFallback className={`font-medium ${
                                  balance.balance >= 0
                                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                  {balance.name.trim().split(' ').pop()?.charAt(0).toUpperCase() || '?'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium truncate">{balance.name}</p>
                                <div className="flex flex-col sm:flex-row sm:items-center text-xs text-muted-foreground mt-1 gap-1 sm:gap-3">
                                  <span className="inline-flex items-center">
                                    <TrendingUp className="h-3 w-3 mr-1 flex-shrink-0 text-green-500" />
                                    <span className="truncate">Đã chi: {formatCurrency(balance.paid)}</span>
                                  </span>
                                  <span className="inline-flex items-center">
                                    <TrendingDown className="h-3 w-3 mr-1 flex-shrink-0 text-red-500" />
                                    <span className="truncate">Cần chi: {formatCurrency(balance.shouldPay)}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right mt-3 sm:mt-0">
                              <p className={`font-medium text-lg ${
                                balance.balance >= 0
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-red-600 dark:text-red-400'
                              }`}>
                                {formatCurrency(balance.balance)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {balance.balance >= 0 ? 'Được nhận' : 'Cần trả'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hiển thị thanh toán cân bằng */}
                  {costSharingOverview.settlements.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <ArrowRight className="h-5 w-5 mr-2 text-primary" />
                          Dự kiến thanh toán
                        <Badge className="ml-2 bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                          {costSharingOverview.settlements.length} khoản
                        </Badge>
                      </h3>
                      <div className="space-y-3">
                        {costSharingOverview.settlements.map((settlement, index) => (
                          <div
                            key={index}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-amber-50 dark:bg-amber-900/10 hover:bg-amber-100 dark:hover:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-900/30 transition-colors"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                              <div className="flex items-center">
                                <Avatar className="h-10 w-10 border-2 border-amber-200 dark:border-amber-800 flex-shrink-0">
                                  <AvatarFallback className="bg-amber-100 text-amber-600 font-medium dark:bg-amber-900/30 dark:text-amber-400">
                                    {settlement.fromName
                                      ? settlement.fromName.trim().split(' ').pop()?.charAt(0).toUpperCase() || '?'
                                      : settlement.from.trim().split(' ').pop()?.charAt(0).toUpperCase() || '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <ArrowRight className="h-5 w-5 mx-2 text-amber-500 flex-shrink-0" />
                                <Avatar className="h-10 w-10 border-2 border-amber-200 dark:border-amber-800 flex-shrink-0">
                                  <AvatarFallback className="bg-amber-100 text-amber-600 font-medium dark:bg-amber-900/30 dark:text-amber-400">
                                    {settlement.toName
                                      ? settlement.toName.trim().split(' ').pop()?.charAt(0).toUpperCase() || '?'
                                      : settlement.to.trim().split(' ').pop()?.charAt(0).toUpperCase() || '?'}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                              <p className="font-medium mt-2 sm:mt-0 min-w-0 truncate">
                                <span className="text-amber-700 dark:text-amber-300">{settlement.fromName || settlement.from}</span> cần trả{' '}
                                <span className="text-amber-700 dark:text-amber-300">{settlement.toName || settlement.to}</span>
                              </p>
                            </div>
                            <div className="text-right mt-3 sm:mt-0">
                              <p className="font-medium text-amber-600 text-lg dark:text-amber-400">{formatCurrency(settlement.amount)}</p>
                              <Button size="sm" variant="outline" className="mt-2 h-8 text-xs border-amber-200 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/30 w-full sm:w-auto">
                                <Check className="h-3 w-3 mr-1" />
                                Đánh dấu đã thanh toán
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4 animate-pulse">
                    <DollarSign className="h-8 w-8 text-primary animate-bounce" />
                  </div>
                  <h3 className="text-lg font-semibold">Đang tải thông tin chi tiêu</h3>
                  <p className="text-muted-foreground mt-2 mb-6">Vui lòng đợi trong giây lát...</p>
                  <div className="flex justify-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Hiển thị nút tạo nhóm chi tiêu nếu không có dữ liệu
            <div className="text-center py-12 border rounded-lg">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Chưa có nhóm chi tiêu</h3>
              <p className="text-muted-foreground mt-2 mb-6">Tạo nhóm chi tiêu đầu tiên cho chuyến đi của bạn.</p>
              <CreateCostSharingDialog
                tripId={tripId}
                onCostSharingCreated={async () => {
                  // Tải lại danh sách nhóm chi tiêu sau khi tạo thành công
                  try {
                    const data = await getCostSharingGroups(tripId);
                    setCostSharingGroups(data);

                    // Nếu có nhóm chi tiêu, lấy thông tin chi tiết
                    if (data.length > 0) {
                      const overviewData = await getCostSharingOverview(data[0].id);
                      if (overviewData) {
                        setCostSharingOverview(overviewData);
                      }
                    }
                  } catch (error) {
                    console.error('Error refreshing cost sharing data:', error);
                    toast.error('Không thể tải lại thông tin chi tiêu');
                  }
                }}
                trigger={
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo nhóm chi tiêu
                  </Button>
                }
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
