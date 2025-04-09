"use client";
import { cn } from "@/lib/utils";
import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import envConf from "@/app/config/config";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Metadata } from "next";
import { useRouter } from 'next/navigation';

const formSchema = z
  .object({
    username: z.string().min(3, {
      message: "Tên tài khoản tối thiểu 3 ký tự",
    }),
    password: z.string().min(6, {
      message: "Mật khẩu tối thiểu 6 ký tự",
    }),
    rePassword: z.string().min(6, {
      message: "Mật khẩu tối thiểu 6 ký tự",
    }),
    email: z
      .string()
      .email({ message: "Email không hợp lệ" })
      .min(1, { message: "Email không được để trống" }),
    name: z.string().min(5, { message: "Tên tối thiểu 5 ký tự" }),
  })
  .superRefine(({ rePassword, password }, ctx) => {
    if (rePassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "Mật khẩu xác nhận không khớp",
        path: ["rePassword"],
      });
    }
  });
export const metadata: Metadata = {
    title: "Đăng ký",
    description: "",
  };
const RegisterForm = ({
  className,
  ...props
}: {
  className?: string;
  [key: string]: unknown;
}) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      name: "",
      password: "",
      rePassword: "",
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const res = await fetch(
        `${envConf.NEXT_PUBLIC_API_ENDPOINT}/auth/register`,
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
        toast.success("Đăng ký thành công!", {
          description: "Bạn đã đăng ký thành công. Quay lại trang đăng nhập trong giây lát...",
        });
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }else {
        toast.error("Lỗi đăng ký", {
          description: data.message || "Có lỗi xảy ra, vui lòng thử lại.",
        });
      }
    } catch (error) {
      toast("Lỗi mạng", {
        description: "Không thể kết nối đến máy chủ.",
      });
      console.error("Lỗi đăng ký:", error);
    }
  }
  function onError(errors: z.ZodError | Error | unknown) {
    let errorMessage = "Vui lòng kiểm tra lại thông tin hoặc thử lại sau";

    if (errors instanceof Error) {
      errorMessage = errors.message;
    } else if (errors instanceof z.ZodError) {
      errorMessage = errors.errors[0]?.message || errorMessage;
    }

    toast("Lỗi.", {
      description: errorMessage,
    });
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden border-none shadow-lg">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold tracking-tight">Đăng ký</CardTitle>
          <p className="text-sm text-muted-foreground">Nhập thông tin đăng ký của bạn để tiếp tục</p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onError)}>
              <div className="grid gap-6">

                <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <Label htmlFor="email">Họ và tên</Label>
                        <FormControl>
                          <Input placeholder="Họ và tên" required {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <Label htmlFor="username">Tên người dùng</Label>
                        <FormControl>
                          <Input
                            placeholder="Tên người dùng"
                            required
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <Label htmlFor="username">Email</Label>
                        <FormControl>
                          <Input
                            placeholder="Email của bạn"
                            type="email"
                            required
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <Label htmlFor="password">Mật khẩu</Label>
                        <FormControl>
                          <Input
                            placeholder="Nhập mật khẩu"
                            type="password"
                            required
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rePassword"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <Label htmlFor="rePassword">Nhập lại mật khẩu</Label>
                        <FormControl>
                          <Input
                            placeholder="Nhập lại mật khẩu"
                            type="password"
                            required
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                  >
                    Đăng ký
                  </Button>
                </div>
                <div className="flex flex-col gap-4">
                  <Button disabled variant="outline" className="w-full bg-white hover:bg-gray-50 text-black border border-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white dark:border-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    Tiếp tục với Google
                  </Button>
                </div>

                <div className="text-center text-sm">
                  Hoặc bạn đã có tài khoản?{" "}
                  <a href="/login" className="text-primary font-medium hover:underline underline-offset-4">
                    Đăng nhập ngay
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
/**
 * The `RegisterForm` component is responsible for rendering the registration form
 * within the authentication flow of the application. It handles user input for
 * creating a new account, such as username, email, and password fields.
 *
 * @component
 * @returns {JSX.Element} The rendered registration form component.
 */
export default RegisterForm;
