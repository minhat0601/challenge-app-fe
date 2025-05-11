'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowRight } from 'lucide-react';

export default function TripsPage() {
  const router = useRouter();

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="text-center space-y-6">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
          <MapPin className="h-10 w-10 text-primary" />
        </div>
        
        <h1 className="text-3xl font-bold">Xem lịch trình chuyến đi</h1>
        
        <p className="text-muted-foreground max-w-lg mx-auto">
          Để xem lịch trình của một chuyến đi, bạn cần có đường dẫn trực tiếp đến chuyến đi đó.
          Chỉ những chuyến đi được đặt ở chế độ công khai mới có thể xem mà không cần đăng nhập.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button onClick={() => router.push('/login')} variant="outline" size="lg">
            Đăng nhập
          </Button>
          <Button onClick={() => router.push('/register')} size="lg">
            Đăng ký ngay
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mt-8">
          Đăng ký tài khoản để tạo và quản lý chuyến đi của riêng bạn, lên kế hoạch chi tiết và chia sẻ với bạn bè.
        </p>
      </div>
    </div>
  );
}
