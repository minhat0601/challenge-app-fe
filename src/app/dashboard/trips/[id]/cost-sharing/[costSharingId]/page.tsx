'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { CostSharingOverviewComponent } from '@/components/trips/cost-sharing-overview';
import { getCostSharingOverview } from '@/services/trip-service';
import { CostSharingOverview } from '@/types/expense';
import { toast } from 'sonner';

export default function CostSharingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CostSharingOverview | null>(null);

  // Lấy id từ params một cách an toàn
  const costSharingGroupId = typeof params?.id === 'string' ? params.id : '';
  const tripId = typeof params?.tripId === 'string' ? params.tripId : '';

  const fetchData = async () => {
    setLoading(true);
    try {
      const overviewData = await getCostSharingOverview(costSharingGroupId);
      if (overviewData) {
        setData(overviewData);
      } else {
        toast.error('Không thể tải thông tin chi tiêu');
      }
    } catch (error) {
      console.error('Error fetching cost sharing overview:', error);
      toast.error('Đã xảy ra lỗi khi tải thông tin chi tiêu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (costSharingGroupId) {
      fetchData();
    }
  }, [costSharingGroupId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>
        <Skeleton className="h-10 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold">Không tìm thấy thông tin chi tiêu</h3>
        <p className="text-muted-foreground mt-2 mb-6">Thông tin chi tiêu này không tồn tại hoặc bạn không có quyền truy cập.</p>
        <Button onClick={() => router.push(`/dashboard/trips/${tripId}`)}>
          Quay lại chuyến đi
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
      </div>

      {/* Nội dung chính */}
      <CostSharingOverviewComponent data={data} onRefresh={fetchData} />
    </div>
  );
}
