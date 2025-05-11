'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Trip } from '@/types/trip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Users, Calendar, MapPin, Lock, Globe, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { formatDate } from '@/utils/date';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TripTableProps {
  trips: Trip[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

export default function TripTable({ trips, loading = false, onDelete }: TripTableProps) {
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Tên chuyến đi</TableHead>
              <TableHead>Điểm đến</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Người tham gia</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Hiển thị</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-1" />
                    <Skeleton className="h-5 w-8" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-9 w-20 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Tên chuyến đi</TableHead>
              <TableHead>Điểm đến</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Người tham gia</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Hiển thị</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Không có chuyến đi nào. Hãy tạo chuyến đi mới!
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Tên chuyến đi</TableHead>
            <TableHead>Điểm đến</TableHead>
            <TableHead>Thời gian</TableHead>
            <TableHead>Người tham gia</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Hiển thị</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trips.map((trip) => (
            <TableRow key={trip.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">{trip.title}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                  {trip.destination}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-sm">
                    {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span>{trip.participantCount}</span>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(trip.status)}</TableCell>
              <TableCell>
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
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/dashboard/trips/${trip.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">Xem</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/dashboard/trips/${trip.id}/edit`)}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Sửa</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Thao tác khác</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/dashboard/trips/${trip.id}/expenses`)}>
                        Quản lý chi tiêu
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/dashboard/trips/${trip.id}/participants`)}>
                        Quản lý người tham gia
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete && onDelete(trip.id)} className="text-red-500 focus:text-red-500">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Xóa chuyến đi
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
