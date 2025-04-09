import { Metadata } from "next";
import { LoginForm } from "./login-form"
import { Lightbulb } from "lucide-react";

export const metadata: Metadata = {
    title: "Đăng nhập - Challenge App",
    description: "Đăng nhập vào Challenge App để bắt đầu hành trình học tập của bạn",
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10 overflow-hidden">
      {/* Pattern Background with Gradient */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 dark:from-primary/10 dark:to-secondary/10"></div>

        {/* Pattern */}
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-[0.04] dark:opacity-[0.06]">
          <defs>
            <pattern id="lightbulbs" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M30 10c-8.284 0-15 6.716-15 15 0 5.542 3.029 10.377 7.5 12.956V42.5c0 1.381 1.119 2.5 2.5 2.5h10c1.381 0 2.5-1.119 2.5-2.5v-4.544c4.471-2.579 7.5-7.414 7.5-12.956 0-8.284-6.716-15-15-15zm0 27.5c-1.381 0-2.5-1.119-2.5-2.5v-2.5h5v2.5c0 1.381-1.119 2.5-2.5 2.5zm0-7.5c-4.687 0-8.5-3.813-8.5-8.5s3.813-8.5 8.5-8.5 8.5 3.813 8.5 8.5-3.813 8.5-8.5 8.5z" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#lightbulbs)" />
        </svg>
      </div>

      <div className="absolute top-8 left-8 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Lightbulb className="h-5 w-5" />
        </div>
        <span className="text-xl font-bold">Challenge App</span>
      </div>

      <div className="w-full max-w-sm md:max-w-md">
        <LoginForm />
      </div>

      <div className="absolute bottom-4 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Challenge App
      </div>
    </div>
  )
}
