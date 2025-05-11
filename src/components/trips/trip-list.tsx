'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trip } from '@/types/trip';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Users, Calendar, MapPin, Lock, Globe } from 'lucide-react';
import { formatDate } from '@/utils/date';

interface TripListProps {
  trips: Trip[];
  loading?: boolean;
}

export default function TripList({ trips, loading = false }: TripListProps) {
  const router = useRouter();

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

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden flex flex-col h-full">
            <div className="p-4 flex items-start justify-between">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
            </div>
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <div className="flex items-center">
                  <Skeleton className="h-4 w-4 mr-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center">
                  <Skeleton className="h-4 w-4 mr-2" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
            <CardFooter className="mt-auto pt-4">
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
          <MapPin className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">Không có chuyến đi nào</h3>
        <p className="text-muted-foreground mt-2 mb-6">Bạn chưa có kế hoạch chuyến đi nào. Hãy tạo chuyến đi đầu tiên!</p>
        <Button onClick={() => router.push('/dashboard/trips/create')}>
          Tạo chuyến đi mới
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {trips.map((trip) => (
        <Card key={trip.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
          <div className="p-4 flex items-start justify-between">
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

          <CardHeader>
            <CardTitle className="line-clamp-1">{trip.title}</CardTitle>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="line-clamp-1">{trip.destination}</span>
            </div>
          </CardHeader>

          <CardContent className="flex-grow">
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>
                  {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </span>
              </div>

              <div className="flex items-center text-sm">
                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{trip.participantCount} người tham gia</span>
              </div>

              {trip.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                  {trip.description}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="mt-auto pt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push(`/dashboard/trips/${trip.id}`)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Xem chi tiết
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
