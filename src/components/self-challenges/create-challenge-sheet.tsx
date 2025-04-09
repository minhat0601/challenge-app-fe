'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { fetchWithAuth } from '@/lib/fetcher';
import envConf from '@/app/config/config';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';


// Schema cho form tạo thử thách
const createChallengeSchema = z.object({
  prompt: z.string().min(10, {
    message: 'Nội dung phải có ít nhất 10 ký tự',
  }),
});

type CreateChallengeFormValues = z.infer<typeof createChallengeSchema>;

interface CreateChallengeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateChallengeSheet({
  open,
  onOpenChange,
  onSuccess
}: CreateChallengeSheetProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Khởi tạo form
  const form = useForm<CreateChallengeFormValues>({
    resolver: zodResolver(createChallengeSchema),
    defaultValues: {
      prompt: '',
    },
  });

  // State cho hiệu ứng đang xử lý
  const [isProcessing, setIsProcessing] = useState(false);

  // Xử lý submit form
  const onSubmit = async (values: CreateChallengeFormValues) => {
    setIsSubmitting(true);
    setIsProcessing(true);

    try {
      // Chuẩn bị dữ liệu gửi lên API
      const payload = {
        id: 3, // ID mặc định hoặc có thể thay đổi tùy theo yêu cầu
        prompt: values.prompt,
      };

      // Gọi API tạo thử thách mới
      const response = await fetchWithAuth(
        `${envConf.NEXT_PUBLIC_API_ENDPOINT}/challenge/register`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Có lỗi xảy ra khi tạo thử thách');
      }

      // Xử lý thành công
      toast.success('Thử thách tự học đã được tạo thành công!', {
        id: 'create-success',
        duration: 3000, // Hiển thị trong 3 giây
      });
      form.reset();
      onOpenChange(false);

      // Gọi callback để cập nhật danh sách thử thách
      if (onSuccess) {
        // Chờ 2 giây để đảm bảo API đã xử lý xong và toast thành công đã hiển thị
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo thử thách!');
    } finally {
      setIsSubmitting(false);
      setIsProcessing(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Tạo thử thách tự học mới</SheetTitle>
          <SheetDescription>
            Điền thông tin để tạo một thử thách tự học mới
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium">Nội dung mục tiêu</FormLabel>
                  <div className={`relative ${isProcessing ? 'animate-pulse' : ''}`}>
                    <FormControl>
                      <div className={`relative ai-textarea ${isProcessing ? 'ai-textarea-processing' : ''}`}>
                        <Textarea
                          placeholder="Mô tả mục tiêu bạn muốn đạt được, ví dụ: Tôi muốn học lập trình Python trong 30 ngày để có thể làm được các dự án nhỏ về phân tích dữ liệu..."
                          className="min-h-[200px] bg-transparent relative z-10 rounded-md"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    {isProcessing && (
                      <div className="absolute bottom-4 right-4 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping delay-100"></div>
                        <div className="w-2 h-2 bg-pink-400 rounded-full animate-ping delay-200"></div>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Hãy mô tả chi tiết mục tiêu của bạn. AI sẽ phân tích và tạo thử thách phù hợp.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="pt-4">
              <SheetClose asChild>
                <Button variant="outline" type="button">Hủy</Button>
              </SheetClose>
              <Button
                type="submit"
                disabled={isSubmitting}
                className={`relative overflow-hidden ${isSubmitting ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg glossy-button' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <span className="relative z-10">Đang xử lý...</span>
                    <div className="absolute inset-0 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-gradient-x"></div>
                    <div className="absolute inset-0 w-full h-full bg-white opacity-20 animate-pulse"></div>
                  </>
                ) : 'Tạo thử thách'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
