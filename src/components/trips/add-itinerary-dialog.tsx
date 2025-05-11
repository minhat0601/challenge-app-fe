'use client';

import { useState } from 'react';
import { Trip } from '@/types/trip';
import { ItineraryItem, createItinerary } from '@/services/trip-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatDate } from '@/utils/date';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Plus, MapPin, Clock } from 'lucide-react';
// Sử dụng hàm định dạng ngày tháng nội bộ thay vì thư viện bên ngoài

interface AddItineraryDialogProps {
  trip: Trip;
  onItineraryAdded?: () => void;
  trigger?: React.ReactNode;
  initialDayNumber?: number; // Ngày được chọn sẵn khi mở dialog
}

export default function AddItineraryDialog({
  trip,
  onItineraryAdded,
  trigger,
  initialDayNumber = 1
}: AddItineraryDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [dayNumber, setDayNumber] = useState<number>(initialDayNumber);
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('10:00');
  const [description, setDescription] = useState('');

  // Tính toán số ngày của chuyến đi
  const tripDays = Math.ceil(
    (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  // Hàm thêm ngày vào một ngày cụ thể
  const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  // Tạo danh sách các ngày trong chuyến đi
  const tripDayOptions = Array.from({ length: tripDays }, (_, i) => {
    const date = addDays(new Date(trip.startDate), i);
    const dateString = date.toISOString().split('T')[0]; // Format YYYY-MM-DD
    return {
      value: i + 1,
      label: `Ngày ${i + 1} (${formatDate(dateString)})`
    };
  });

  // Reset form
  const resetForm = () => {
    setDayNumber(initialDayNumber);
    setLocation('');
    setStartTime('08:00');
    setEndTime('10:00');
    setDescription('');
  };

  // Xử lý khi đóng dialog
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  // Xử lý khi thêm hạng mục tham quan
  const handleAddItinerary = async () => {
    // Kiểm tra dữ liệu đầu vào
    if (!location.trim()) {
      toast.error('Vui lòng nhập địa điểm tham quan');
      return;
    }

    if (!description.trim()) {
      toast.error('Vui lòng nhập mô tả hoạt động');
      return;
    }

    // Kiểm tra thời gian
    if (startTime >= endTime) {
      toast.error('Thời gian kết thúc phải sau thời gian bắt đầu');
      return;
    }

    setIsSubmitting(true);
    try {
      const itineraryData: ItineraryItem = {
        tripId: trip.id,
        dayNumber,
        location,
        startTime,
        endTime,
        description
      };

      const result = await createItinerary(itineraryData);

      if (result.success) {
        toast.success('Đã thêm hạng mục tham quan thành công');
        setOpen(false);
        resetForm();
        if (onItineraryAdded) {
          onItineraryAdded();
        }
      } else {
        toast.error(result.error || 'Không thể thêm hạng mục tham quan');
      }
    } catch (error) {
      console.error('Error adding itinerary:', error);
      toast.error('Đã xảy ra lỗi khi thêm hạng mục tham quan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Thêm hạng mục tham quan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-4 sm:p-6 max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Thêm hạng mục tham quan</DialogTitle>
          <DialogDescription>
            Thêm địa điểm và hoạt động tham quan cho chuyến đi của bạn.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="day-number">Ngày tham quan</Label>
            <Select
              value={dayNumber.toString()}
              onValueChange={(value) => setDayNumber(parseInt(value))}
            >
              <SelectTrigger id="day-number" className="w-full">
                <SelectValue placeholder="Chọn ngày" />
              </SelectTrigger>
              <SelectContent>
                {tripDayOptions.map((day) => (
                  <SelectItem key={day.value} value={day.value.toString()}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Địa điểm tham quan</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                placeholder="Nhập địa điểm tham quan"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">Thời gian bắt đầu</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time">Thời gian kết thúc</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả hoạt động</Label>
            <Textarea
              id="description"
              placeholder="Nhập mô tả chi tiết về hoạt động tham quan"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter className="mt-6 flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="w-full sm:w-auto"
          >
            Hủy
          </Button>
          <Button
            onClick={handleAddItinerary}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Thêm hạng mục tham quan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
