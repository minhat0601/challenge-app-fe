'use client';

import React, { useState } from 'react';
import { TripDay, DayActivity, Trip } from '@/types/trip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateWithMonth } from '@/utils/date';
import { Clock, MapPin, FileText, DollarSign, MoreHorizontal, Plus, Loader2, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { deleteItinerary } from '@/services/trip-service';
import AddItineraryDialog from './add-itinerary-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency } from '@/utils/format';

interface TripDayCardProps {
  day: TripDay;
  trip: Trip;
  onAddActivity?: (dayId: string) => void;
  onEditActivity?: (dayId: string, activityId: string) => void;
  onDeleteActivity?: (dayId: string, activityId: string) => void;
  onItineraryAdded?: () => void;
}

export default function TripDayCard({
  day,
  trip,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
  onItineraryAdded
}: TripDayCardProps) {
  const [deletingActivityId, setDeletingActivityId] = useState<string | null>(null);

  // Xử lý xóa hạng mục tham quan
  const handleDeleteActivity = async (activityId: string) => {
    try {
      setDeletingActivityId(activityId);

      // Gọi API xóa hạng mục tham quan
      const result = await deleteItinerary(activityId);

      if (result.success) {
        toast.success('Xóa hạng mục tham quan thành công');

        // Gọi callback để cập nhật lại danh sách hạng mục
        if (onDeleteActivity) {
          onDeleteActivity(day.id, activityId);
        }
      } else {
        toast.error(result.error || 'Không thể xóa hạng mục tham quan');
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast.error('Đã xảy ra lỗi khi xóa hạng mục tham quan');
    } finally {
      setDeletingActivityId(null);
    }
  };
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Badge variant="outline" className="mr-2 bg-primary/10 text-primary border-primary/20">
              Ngày {day.dayNumber}
            </Badge>
            <CardTitle>{formatDateWithMonth(day.date)}</CardTitle>
          </div>
          <AddItineraryDialog
            trip={trip}
            initialDayNumber={day.dayNumber}
            onItineraryAdded={onItineraryAdded}
            trigger={
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                id={`add-activity-day-${day.dayNumber}`}
                onClick={() => onAddActivity && onAddActivity(day.id)}
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">Thêm hoạt động</span>
              </Button>
            }
          />
        </div>
      </CardHeader>
      <CardContent>
        {day.activities.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>Chưa có hoạt động nào cho ngày này</p>
            <AddItineraryDialog
              trip={trip}
              initialDayNumber={day.dayNumber}
              onItineraryAdded={onItineraryAdded}
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => onAddActivity && onAddActivity(day.id)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm hoạt động
                </Button>
              }
            />
          </div>
        ) : (
          <div className="space-y-4">
            {day.activities.map((activity, index) => (
              <div
                key={activity.id}
                className={`relative pl-6 ${index !== day.activities.length - 1 ? 'pb-4 border-l-2 border-dashed border-muted-foreground/20' : ''}`}
              >
                {/* Điểm tròn trên timeline */}
                <div className="absolute left-[-5px] top-1 w-3 h-3 rounded-full bg-primary"></div>

                <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{activity.title}</h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Thao tác</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditActivity && onEditActivity(day.id, activity.id)}>
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteActivity(activity.id)}
                          className="text-red-500 focus:text-red-500"
                          disabled={deletingActivityId === activity.id}
                        >
                          {deletingActivityId === activity.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Đang xóa...
                            </>
                          ) : (
                            <>
                              <Trash className="h-4 w-4 mr-2" />
                              Xóa
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2 text-sm">
                    {(
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>
                          {activity.startTime ? (
                            activity.startTime.includes('T')
                              ? activity.startTime.split('T')[1].substring(0, 5)
                              : activity.startTime
                          ) : '??:??'}
                          {' - '}
                          {activity.endTime ? (
                            activity.endTime.includes('T')
                              ? activity.endTime.split('T')[1].substring(0, 5)
                              : activity.endTime
                          ) : '??:??'}
                        </span>
                      </div>
                    )}

                    {activity.location && (
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{activity.location}</span>
                      </div>
                    )}

                    {activity.cost !== undefined && activity.cost > 0 && (
                      <div className="flex items-center text-muted-foreground">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <span>Chi phí ước tính: {formatCurrency(activity.cost)}</span>
                      </div>
                    )}

                    {activity.description && (
                      <div className="flex items-start mt-2">
                        <FileText className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                        <p className="text-muted-foreground">{activity.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
