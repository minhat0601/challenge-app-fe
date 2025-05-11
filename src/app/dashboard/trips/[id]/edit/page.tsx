'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getTripById, updateTrip } from '@/services/trip-service';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Users, Globe, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

// Schema cho form chỉnh sửa chuyến đi
const tripFormSchema = z.object({
  title: z.string().min(3, {
    message: 'Tên chuyến đi phải có ít nhất 3 ký tự',
  }).max(100, {
    message: 'Tên chuyến đi không được vượt quá 100 ký tự',
  }),
  description: z.string().max(500, {
    message: 'Mô tả không được vượt quá 500 ký tự',
  }).optional(),
  destination: z.string().min(3, {
    message: 'Điểm đến phải có ít nhất 3 ký tự',
  }).max(100, {
    message: 'Điểm đến không được vượt quá 100 ký tự',
  }),
  startDate: z.string({
    required_error: 'Vui lòng chọn ngày bắt đầu',
  }),
  endDate: z.string({
    required_error: 'Vui lòng chọn ngày kết thúc',
  }),
  visibility: z.enum(['public', 'private'], {
    required_error: 'Vui lòng chọn chế độ hiển thị',
  }),
}).refine((data) => {
  // Kiểm tra ngày kết thúc phải sau ngày bắt đầu
  if (!data.startDate || !data.endDate) return true;
  return new Date(data.endDate) >= new Date(data.startDate);
}, {
  message: 'Ngày kết thúc phải sau hoặc trùng với ngày bắt đầu',
  path: ['endDate'],
});

type TripFormValues = z.infer<typeof tripFormSchema>;

export default function EditTripPage() {
  const router = useRouter();
  const params = useParams();
  // Lấy id từ params một cách an toàn
  const tripId = typeof params?.id === 'string' ? params.id : '';

  const [loading, setLoading] = useState(false);
  const [fetchingTrip, setFetchingTrip] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Khởi tạo form với giá trị mặc định
  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      title: '',
      description: '',
      destination: '',
      visibility: 'public',
    },
  });

  // Lấy thông tin chuyến đi
  useEffect(() => {
    const fetchTrip = async () => {
      setFetchingTrip(true);
      try {
        const trip = await getTripById(tripId);

        if (trip) {
          // Điền thông tin chuyến đi vào form
          form.reset({
            title: trip.title,
            description: trip.description || '',
            destination: trip.destination,
            startDate: trip.startDate,
            endDate: trip.endDate,
            visibility: trip.visibility,
          });
        } else {
          setError('Không thể tìm thấy chuyến đi');
        }
      } catch (error) {
        console.error('Error fetching trip:', error);
        setError('Đã xảy ra lỗi khi tải thông tin chuyến đi');
      } finally {
        setFetchingTrip(false);
      }
    };

    fetchTrip();
  }, [tripId, form]);

  // Xử lý submit form
  const onSubmit = async (values: TripFormValues) => {
    setLoading(true);
    try {
      // Gọi API cập nhật chuyến đi
      const updatedTrip = await updateTrip(tripId, {
        title: values.title,
        description: values.description,
        destination: values.destination,
        startDate: values.startDate,
        endDate: values.endDate,
        visibility: values.visibility,
      });

      if (updatedTrip) {
        // Hiển thị thông báo thành công
        toast.success('Đã cập nhật chuyến đi thành công!');

        // Chuyển hướng đến trang chi tiết chuyến đi
        router.push(`/dashboard/trips/${tripId}`);
      } else {
        toast.error('Không thể cập nhật chuyến đi. Vui lòng thử lại sau.');
      }
    } catch (error) {
      console.error('Error updating trip:', error);
      toast.error('Không thể cập nhật chuyến đi. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị skeleton loading khi đang tải dữ liệu
  if (fetchingTrip) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" disabled>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>

        <div className="space-y-8">
          <div className="space-y-6 p-6 bg-card rounded-lg border">
            <Skeleton className="h-6 w-40 mb-6" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Hiển thị thông báo lỗi nếu có
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold">Chỉnh sửa chuyến đi</h1>
        </div>

        <div className="p-6 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
          <p>{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.back()}
          >
            Quay lại
          </Button>
        </div>
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
        <h1 className="text-2xl font-bold">Chỉnh sửa chuyến đi</h1>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Thông tin cơ bản */}
          <div className="space-y-6 p-6 bg-card rounded-lg border">
            <h2 className="text-lg font-semibold">Thông tin cơ bản</h2>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên chuyến đi</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên chuyến đi" {...field} />
                  </FormControl>
                  <FormDescription>
                    Tên ngắn gọn để mô tả chuyến đi của bạn
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả chi tiết về chuyến đi"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Mô tả ngắn gọn về chuyến đi, mục đích và các hoạt động chính
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Điểm đến</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập điểm đến" {...field} />
                  </FormControl>
                  <FormDescription>
                    Địa điểm chính của chuyến đi
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Ngày bắt đầu</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          // Cập nhật giá trị min của endDate khi startDate thay đổi
                          const endDateField = form.getValues('endDate');
                          if (endDateField && new Date(endDateField) < new Date(e.target.value)) {
                            form.setValue('endDate', e.target.value);
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Ngày bắt đầu chuyến đi
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Ngày kết thúc</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        min={form.getValues('startDate')}
                      />
                    </FormControl>
                    <FormDescription>
                      Ngày kết thúc chuyến đi
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Cài đặt */}
          <div className="space-y-6 p-6 bg-card rounded-lg border">
            <h2 className="text-lg font-semibold">Cài đặt</h2>

            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chế độ hiển thị</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn chế độ hiển thị" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-2" />
                          <span>Công khai</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex items-center">
                          <Lock className="h-4 w-4 mr-2" />
                          <span>Riêng tư</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Chọn chế độ hiển thị cho chuyến đi của bạn
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Nút submit */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Đang cập nhật...' : 'Cập nhật chuyến đi'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
