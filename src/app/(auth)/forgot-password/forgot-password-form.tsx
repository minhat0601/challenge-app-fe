'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import  envConf  from '@/app/config/config';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { cn } from "@/lib/utils";

const formSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

const ForgotPasswordForm = ({
  className,
  ...props
}: {
  className?: string;
  [key: string]: any;
}) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({ 
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const res = await fetch(
        `${envConf.NEXT_PUBLIC_API_ENDPOINT}${envConf.AUTH_ENDPOINTS.FORGOT_PASSWORD}`,
        {
          method: "POST",
          body: JSON.stringify(values),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();

      if (res.ok) {
        toast.success("Yêu cầu đặt lại mật khẩu đã được gửi!", {
          description: "Vui lòng kiểm tra email của bạn để tiếp tục.",
        });
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        toast.error("Lỗi", {
          description: data.message || "Có lỗi xảy ra, vui lòng thử lại.",
        });
      }
    } catch (error) {
      toast("Lỗi mạng", {
        description: "Không thể kết nối đến máy chủ.",
      });
      console.error("Lỗi gửi yêu cầu:", error);
    }
  }

  function onError(errors: any) {
    toast("Lỗi.", {
      description:
        errors.message || "Vui lòng kiểm tra lại thông tin hoặc thử lại sau",
    });
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Quên mật khẩu</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onError)}>
              <div className="grid gap-6">
                <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <FormControl>
                          <Input
                            placeholder="Nhập email của bạn"
                            type="email"
                            required
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Gửi yêu cầu
                  </Button>
                </div>

                <div className="text-center text-sm">
                  <a href="/login" className="underline underline-offset-4">
                    Quay lại đăng nhập
                  </a>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export { ForgotPasswordForm };