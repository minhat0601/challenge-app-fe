'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTrip } from '@/services/trip-service';
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
// import { Calendar } from '@/components/ui/calendar';
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from '@/components/ui/popover';
// import { format } from 'date-fns';
// import { vi } from 'date-fns/locale';
import { ArrowLeft, Users, Globe, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Schema cho form tạo chuyến đi
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

export default function CreateTripPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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

  // Xử lý submit form
  const onSubmit = async (values: TripFormValues) => {
    setLoading(true);
    try {
      // Gọi API tạo chuyến đi mới
      const newTrip = await createTrip({
        title: values.title,
        description: values.description,
        destination: values.destination,
        startDate: values.startDate,
        endDate: values.endDate,
        visibility: values.visibility,
      });

      if (newTrip) {
        // Hiển thị thông báo thành công
        toast.success('Đã tạo chuyến đi thành công!');

        // Chuyển hướng đến trang danh sách chuyến đi
        router.push('/dashboard/trips');
      } else {
        toast.error('Không thể tạo chuyến đi. Vui lòng thử lại sau.');
      }
    } catch (error) {
      console.error('Error creating trip:', error);
      toast.error('Không thể tạo chuyến đi. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <h1 className="text-2xl font-bold">Tạo chuyến đi mới</h1>
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
                        min={new Date().toISOString().split('T')[0]}
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
                        min={form.getValues('startDate') || new Date().toISOString().split('T')[0]}
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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

          {/* Người tham gia */}
          <div className="space-y-6 p-6 bg-card rounded-lg border">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Người tham gia</h2>
              <Button type="button" variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Thêm người tham gia
              </Button>
            </div>

            <div className="text-center py-6 text-muted-foreground">
              <p>Bạn có thể thêm người tham gia sau khi tạo chuyến đi</p>
            </div>
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
              {loading ? 'Đang tạo...' : 'Tạo chuyến đi'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
