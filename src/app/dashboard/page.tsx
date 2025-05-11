'use client';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth-store';
import { TestToast } from '@/components/test-toast';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DollarSign, MapPin } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Xin chào, {user.name}!</h2>

      {/* Test Toast Component */}
      <Card>
        <CardHeader>
          <CardTitle>Kiểm tra thông báo</CardTitle>
        </CardHeader>
        <CardContent>
          <TestToast />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quản lý quỹ nhóm</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="flex-1">
            <div className="text-2xl font-bold">Theo dõi thu chi</div>
            <p className="text-xs text-muted-foreground mt-2">
              Quản lý thu chi chung của nhóm một cách dễ dàng
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/dashboard/expenses">
                Quản lý quỹ nhóm
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quản lý chuyến đi</CardTitle>
            <MapPin className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="flex-1">
            <div className="text-2xl font-bold">Lập kế hoạch</div>
            <p className="text-xs text-muted-foreground mt-2">
              Lập kế hoạch cho các chuyến đi và quản lý chi tiêu nhóm
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/dashboard/trips">
                Quản lý chuyến đi
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trạng thái</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="text-2xl font-bold">Hoạt động</div>
            <p className="text-xs text-muted-foreground mt-2">
              Tài khoản đang hoạt động bình thường
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}