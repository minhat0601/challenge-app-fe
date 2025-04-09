'use client';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import envConf from '@/app/config/config';
import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchWithAuth } from '@/lib/fetcher';

const formSchema = z.object({
  oldPassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  newPassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  confirmPassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự")
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

const ChangePasswordForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({ 
    resolver: zodResolver(formSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth(
        `${envConf.NEXT_PUBLIC_API_ENDPOINT}${envConf.AUTH_ENDPOINTS.CHANGE_PASSWORD}`,
        {
          method: "POST",
          body: JSON.stringify({
            oldPassword: values.oldPassword,
            newPassword: values.newPassword,
          })
        }
      );
      const data = await res.json();

      if (res.ok) {
        toast.success("Đổi mật khẩu thành công!", {
          description: "Vui lòng đăng xuất và đăng nhập lại với mật khẩu mới.",
          action: {
            label: "Đăng xuất",
            onClick: () => {
              useAuthStore.getState().logout();
              router.push('/login');
            }
          }
        });
      } else {
        toast.error("Lỗi", {
          description: data.message || "Có lỗi xảy ra, vui lòng thử lại.",
          duration: 3000
        });
      }
    } catch (error) {
      toast.error("Lỗi mạng", {
        description: "Không thể kết nối đến máy chủ.",
      });
      console.error("Lỗi gửi yêu cầu:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="oldPassword"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="oldPassword">Mật khẩu hiện tại</Label>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Nhập mật khẩu hiện tại"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="newPassword">Mật khẩu mới</Label>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Nhập mật khẩu mới"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Nhập lại mật khẩu mới"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export { ChangePasswordForm };