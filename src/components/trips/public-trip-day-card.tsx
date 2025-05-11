'use client';

import React, { useMemo, useEffect, useState, useRef } from 'react';
import { TripDay } from '@/types/trip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateWithMonth } from '@/utils/date';
import { Clock, MapPin, FileText, AlertCircle } from 'lucide-react';

interface PublicTripDayCardProps {
  day: TripDay;
  isCurrentDay?: boolean; // Đánh dấu ngày đang diễn ra
}

export default function PublicTripDayCard({ day, isCurrentDay = false }: PublicTripDayCardProps) {
  // State để theo dõi thời gian hiện tại
  const [currentTime, setCurrentTime] = useState(new Date());

  // Xác định hạng mục đang diễn ra dựa trên thời gian hiện tại
  const currentActivities = useMemo(() => {
    if (!isCurrentDay) return {};

    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    // Kiểm tra từng hạng mục xem có đang diễn ra không
    return day.activities.reduce((acc, activity) => {
      if (activity.startTime && activity.endTime) {
        // Chuyển đổi thời gian bắt đầu và kết thúc sang phút
        let startTime = activity.startTime;
        let endTime = activity.endTime;

        // Xử lý các định dạng thời gian khác nhau
        if (startTime.includes('T')) {
          startTime = startTime.split('T')[1].substring(0, 5);
        }
        if (endTime.includes('T')) {
          endTime = endTime.split('T')[1].substring(0, 5);
        }

        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);

        const startTimeInMinutes = startHour * 60 + startMinute;
        const endTimeInMinutes = endHour * 60 + endMinute;

        // Kiểm tra xem thời gian hiện tại có nằm trong khoảng thời gian của hạng mục không
        acc[activity.id] = currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes;
      }
      return acc;
    }, {} as Record<string, boolean>);
  }, [day.activities, isCurrentDay, currentTime]);

  // Theo dõi thời gian và cập nhật mỗi giây
  useEffect(() => {
    // Chỉ thiết lập interval nếu là ngày hiện tại
    if (!isCurrentDay) return;

    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Cập nhật mỗi giây

    return () => clearInterval(intervalId);
  }, [isCurrentDay]);


  return (
    <Card
      className={`mb-6 transition-all duration-300 ${isCurrentDay
        ? 'border-primary border-2 shadow-lg ring-1 ring-primary/30 bg-primary/5'
        : ''}`
      }
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Ngày {day.dayNumber}</CardTitle>
            <div className="flex items-center gap-2">
              {day.date && (
                <Badge variant="outline" className="ml-2">
                  {formatDateWithMonth(day.date)}
                </Badge>
              )}
              {isCurrentDay && (
                <Badge variant="default" className="bg-primary text-primary-foreground animate-pulse flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Hôm nay
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {day.activities.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>Chưa có hoạt động nào cho ngày này</p>
          </div>
        ) : (
          <div className="space-y-4">
            {day.activities.map((activity, index) => (
              <div
                key={activity.id}

                className={`relative pl-6 ${index !== day.activities.length - 1 ? 'pb-4 border-l-2 border-dashed border-muted-foreground/20' : ''}`}
              >
                {/* Điểm tròn trên timeline */}
                <div className={`absolute left-[-5px] top-1 w-3 h-3 rounded-full transition-all duration-300 ${currentActivities[activity.id] ? 'bg-green-500 ring-2 ring-green-300/50 dark:ring-green-700/50' : 'bg-primary'}`}></div>

                <div className={`bg-muted/50 rounded-lg p-4 border border-border/50 transition-all duration-300 ${currentActivities[activity.id] ? 'border-green-500 shadow-md bg-green-50/10 dark:bg-green-950/10' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{activity.title}</h3>
                      {currentActivities[activity.id] && (
                        <Badge variant="default" className="bg-green-500 text-white animate-pulse flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Đang diễn ra
                        </Badge>
                      )}
                    </div>
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
