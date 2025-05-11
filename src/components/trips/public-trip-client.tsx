'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trip } from '@/types/trip';
import { getPublicTripById, getPublicTripItineraries } from '@/services/trip-service';
import { formatDate } from '@/utils/date';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, MapPin, Calendar, Clock, Users, Globe, Lock, Share2 } from 'lucide-react';
import PublicTripDayCard from '@/components/trips/public-trip-day-card';

export function PublicTripClient({ tripId }: { tripId: string }) {
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [tripDays, setTripDays] = useState<Array<{id: string; dayNumber: number; date: string; activities: Array<{id: string; title?: string; location?: string; startTime?: string; endTime?: string; description?: string}>}>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  // Theo dõi sự kiện scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lấy dữ liệu chuyến đi
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Gọi API lấy thông tin chuyến đi công khai
        const tripData = await getPublicTripById(tripId);

        if (!tripData) {
          setError('Không thể tải thông tin chuyến đi hoặc chuyến đi không công khai');
          setLoading(false);
          return;
        }

        // API đã kiểm tra xem chuyến đi có công khai không, nếu không sẽ trả về lỗi
        setTrip(tripData);

        // Gọi API lấy lịch trình
        try {
          const itineraries = await getPublicTripItineraries(tripId);

          if (itineraries && itineraries.length > 0) {
            // Cập nhật ngày cho mỗi ngày trong lịch trình
            const startDate = new Date(tripData.startDate);
            const updatedItineraries = itineraries.map((day: any) => {
              const dayDate = new Date(startDate);
              dayDate.setDate(startDate.getDate() + day.dayNumber - 1);

              return {
                ...day,
                date: dayDate.toISOString().split('T')[0] // Format YYYY-MM-DD
              };
            });

            setTripDays(updatedItineraries);
          } else {
            // Nếu không có lịch trình hoặc lịch trình rỗng
            setTripDays([]);
          }
        } catch (err) {
          console.error('Error fetching trip itineraries:', err);
          // Vẫn hiển thị thông tin chuyến đi, chỉ không có lịch trình
          setTripDays([]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching trip data:', err);
        setError('Đã xảy ra lỗi khi tải dữ liệu chuyến đi');
        setLoading(false);
      }
    };

    fetchData();
  }, [tripId]);

  // Hiển thị trạng thái chuyến đi
  const getStatusBadge = (status: Trip['status']) => {
    switch (status) {
      case 'planning':
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            Đang lên kế hoạch
          </Badge>
        );
      case 'ongoing':
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            Đang diễn ra
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
            Đã hoàn thành
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-6 px-4 space-y-6">
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

  if (error || !trip) {
    return (
      <div className="container max-w-4xl mx-auto py-6 px-4">
        <div className="text-center py-12">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
            <MapPin className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Không thể xem chuyến đi</h3>
          <p className="text-muted-foreground mt-2 mb-6">{error || 'Chuyến đi này không tồn tại hoặc không công khai.'}</p>
          <Button onClick={() => router.push('/')}>
            Về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4 space-y-6 pt-24">
      {/* Fixed Header */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-background/70 backdrop-blur-xl border-b border-border/40 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>

              <div className="overflow-hidden">
                <div
                  className={`flex flex-col transition-all duration-300 ${
                    scrolled && trip ? 'opacity-100 translate-y-0 h-auto' : 'opacity-0 -translate-y-4 h-0'
                  }`}
                >
                  <h2 className="font-semibold truncate max-w-[200px] sm:max-w-xs">
                    {trip?.title || ''}
                  </h2>
                  {trip && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      {getStatusBadge(trip.status)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button
              variant={scrolled ? "outline" : "secondary"}
              size="sm"
              className="transition-all duration-300"
              onClick={() => {
                // Sao chép đường dẫn hiện tại vào clipboard
                navigator.clipboard.writeText(window.location.href);
                toast.success('Đã sao chép đường dẫn chia sẻ');
              }}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Chia sẻ
            </Button>
          </div>
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
            <span>{trip.participantCount || trip.participants?.length || 0} người tham gia</span>
          </div>
        </div>

        {trip.description && (
          <p className="text-muted-foreground mt-4">{trip.description}</p>
        )}

        {/* Hiển thị thông tin người tạo */}
        <p className="text-xs text-muted-foreground mt-2">
          Tạo bởi: {trip.createdBy || 'Không xác định'}
        </p>
      </div>

      {/* Lịch trình */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Lịch trình chuyến đi</h2>

        {tripDays.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Chưa có lịch trình</h3>
            <p className="text-muted-foreground mt-2">Chuyến đi này chưa có lịch trình hoặc lịch trình không được công khai.</p>
          </div>
        ) : (
          tripDays.map((day) => {
            // Kiểm tra xem ngày này có phải là ngày hiện tại không
            const today = new Date();

            // Tính toán số ngày từ ngày bắt đầu chuyến đi đến ngày hiện tại
            const tripStartDate = new Date(trip.startDate);
            const tripEndDate = new Date(trip.endDate);

            // Đặt giờ, phút, giây về 0 để so sánh chỉ theo ngày
            const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const startDate = new Date(tripStartDate.getFullYear(), tripStartDate.getMonth(), tripStartDate.getDate());
            const endDate = new Date(tripEndDate.getFullYear(), tripEndDate.getMonth(), tripEndDate.getDate());

            // Kiểm tra xem ngày hiện tại có nằm trong khoảng thời gian của chuyến đi không
            const isTripOngoing = todayDate >= startDate && todayDate <= endDate;

            // Tính số ngày từ ngày bắt đầu đến ngày hiện tại (chỉ khi chuyến đi đang diễn ra)
            const currentDayNumber = isTripOngoing ?
              Math.floor((todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1 : 0;

            // Ngày đang diễn ra là ngày có dayNumber trùng với currentDayNumber
            const isCurrentDay = isTripOngoing && day.dayNumber === currentDayNumber;

            return (
              <PublicTripDayCard
                key={day.id}
                day={day}
                isCurrentDay={isCurrentDay}
              />
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="border-t pt-6 mt-8 text-center text-sm text-muted-foreground">
        <p>Đây là lịch trình công khai của chuyến đi. Bạn có thể đăng nhập để tạo chuyến đi của riêng mình.</p>
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.push('/login')}>
            Đăng nhập
          </Button>
          <Button className="ml-2" onClick={() => router.push('/register')}>
            Đăng ký
          </Button>
        </div>
      </div>
    </div>
  );
}
