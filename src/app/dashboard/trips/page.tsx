'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import TripHeader from '@/components/trips/trip-header';
import TripList from '@/components/trips/trip-list';
import TripTable from '@/components/trips/trip-table';
import { Trip } from '@/types/trip';
import { Pagination } from '@/components/ui/pagination';
import { getTrips, deleteTrip } from '@/services/trip-service';

type ViewMode = 'grid' | 'table';
type SortOption = 'startDate' | 'title' | 'participants';
type SortDirection = 'ASC' | 'DESC';
type FilterOption = 'all' | 'planning' | 'ongoing' | 'completed' | 'cancelled';

// Dữ liệu mẫu cho trường hợp API chưa hoạt động
// Không sử dụng trong production
/*
const MOCK_TRIPS: Trip[] = [
  {
    id: '1',
    title: 'Du lịch Đà Lạt',
    description: 'Chuyến đi nghỉ dưỡng và khám phá Đà Lạt trong 3 ngày',
    destination: 'Đà Lạt, Lâm Đồng',
    startDate: '2024-07-15',
    endDate: '2024-07-18',
    status: 'planning',
    visibility: 'public',
    participants: [
      {
        id: '1',
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=random',
        isOrganizer: true,
        confirmed: true,
      },
      {
        id: '2',
        name: 'Trần Thị B',
        email: 'tranthib@example.com',
        avatar: 'https://ui-avatars.com/api/?name=Tran+Thi+B&background=random',
        isOrganizer: false,
        confirmed: true,
      },
      {
        id: '3',
        name: 'Lê Văn C',
        email: 'levanc@example.com',
        avatar: 'https://ui-avatars.com/api/?name=Le+Van+C&background=random',
        isOrganizer: false,
        confirmed: false,
      },
    ],
    days: [
      {
        id: 'd1',
        dayNumber: 1,
        date: '2024-07-15',
        activities: [
          {
            id: 'a1',
            title: 'Khởi hành từ TP.HCM',
            description: 'Tập trung tại bến xe miền Đông, khởi hành lúc 8:00',
            location: 'Bến xe Miền Đông, TP.HCM',
            startTime: '08:00',
            endTime: '14:00',
            cost: 200000,
          },
          {
            id: 'a2',
            title: 'Nhận phòng khách sạn',
            description: 'Check-in khách sạn, nghỉ ngơi',
            location: 'Khách sạn Đà Lạt Dream',
            startTime: '14:30',
            endTime: '16:00',
            cost: 800000,
          },
        ],
      },
    ],
    expenses: [
      {
        id: 'e1',
        title: 'Vé xe khách TP.HCM - Đà Lạt',
        amount: 600000,
        category: 'transportation',
        paidBy: '1',
        sharedBy: ['1', '2', '3'],
        date: '2024-07-15',
      },
      {
        id: 'e2',
        title: 'Tiền phòng khách sạn',
        amount: 2400000,
        category: 'accommodation',
        paidBy: '1',
        sharedBy: ['1', '2', '3'],
        date: '2024-07-15',
      },
    ],
    incomes: [
      {
        id: 'i1',
        title: 'Đóng góp của Nguyễn Văn A',
        amount: 2000000,
        source: 'participant',
        contributedBy: '1',
        date: '2024-07-10',
      },
      {
        id: 'i2',
        title: 'Đóng góp của Trần Thị B',
        amount: 1000000,
        source: 'participant',
        contributedBy: '2',
        date: '2024-07-10',
      },
    ],
    createdAt: '2024-06-15T10:00:00Z',
    updatedAt: '2024-06-20T14:30:00Z',
    coverImage: 'https://images.unsplash.com/photo-1589874235156-e8a7c5c95d6d?q=80&w=1000',
    createdBy: '1',
  },
  {
    id: '2',
    title: 'Du lịch Phú Quốc',
    description: 'Chuyến đi biển đảo Phú Quốc trong 4 ngày',
    destination: 'Phú Quốc, Kiên Giang',
    startDate: '2024-08-10',
    endDate: '2024-08-14',
    status: 'planning',
    visibility: 'private',
    participants: [
      {
        id: '1',
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=random',
        isOrganizer: true,
        confirmed: true,
      },
      {
        id: '4',
        name: 'Phạm Thị D',
        email: 'phamthid@example.com',
        avatar: 'https://ui-avatars.com/api/?name=Pham+Thi+D&background=random',
        isOrganizer: false,
        confirmed: true,
      },
    ],
    days: [],
    expenses: [],
    incomes: [],
    createdAt: '2024-06-25T10:00:00Z',
    updatedAt: '2024-06-25T14:30:00Z',
    coverImage: 'https://images.unsplash.com/photo-1540202404-1b927e27fa8b?q=80&w=1000',
    createdBy: '1',
  },
];*/

export default function TripsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('startDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('ASC');
  const [filter, setFilter] = useState<FilterOption>('all');
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Lấy dữ liệu chuyến đi
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Gọi API lấy danh sách chuyến đi
        const response = await getTrips({
          page: currentPage,
          limit: 9,
          sortBy,
          sortDirection,
        });

        setTrips(response.trips);
        setTotalPages(response.meta.pageCount);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching trips:', error);
        toast.error('Không thể tải danh sách chuyến đi');
        setTrips([]);
        setTotalPages(1);
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, sortBy, sortDirection]);

  // Lọc và sắp xếp chuyến đi
  const filteredTrips = useMemo(() => {
    let result = [...trips];

    // Lọc theo trạng thái
    if (filter !== 'all') {
      result = result.filter(trip => trip.status === filter);
    }

    // Sắp xếp
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'startDate':
          comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'participants':
          comparison = a.participants.length - b.participants.length;
          break;
      }

      return sortDirection === 'ASC' ? comparison : -comparison;
    });

    return result;
  }, [trips, filter, sortBy, sortDirection]);

  // Xử lý thay đổi sắp xếp
  const handleSortChange = (option: SortOption, direction: SortDirection) => {
    if (option === sortBy) {
      setSortDirection(direction);
    } else {
      setSortBy(option);
      setSortDirection(direction);
    }
  };

  // Xử lý xóa chuyến đi
  const handleDeleteTrip = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa chuyến đi này không?')) {
      // Gọi API xóa chuyến đi
      const success = await deleteTrip(id);

      if (success) {
        // Cập nhật danh sách chuyến đi
        setTrips(trips.filter(trip => trip.id !== id));
        toast.success('Đã xóa chuyến đi thành công');
      } else {
        toast.error('Không thể xóa chuyến đi');
      }
    }
  };

  return (
    <div className="space-y-6">
      <TripHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        filter={filter}
        onFilterChange={setFilter}
      />

      {viewMode === 'grid' ? (
        <TripList trips={filteredTrips} loading={loading} />
      ) : (
        <TripTable trips={filteredTrips} loading={loading} onDelete={handleDeleteTrip} />
      )}

      {/* Phân trang */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        className="mt-6"
        showFirstLast={true}
        disabled={loading}
      />
    </div>
  );
}
