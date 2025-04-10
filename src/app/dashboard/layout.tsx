'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { LogoutModal } from '@/components/auth/logout-modal';
import { NavLink } from '@/components/ui/nav-link';
import { MarqueeBanner } from '@/components/marquee-banner';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  PlusCircle,
  Lightbulb,
  UserCircle,
  Settings,
  LogOut,
  Moon,
  Sun,
  Menu,
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, accessToken } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  useEffect(() => {
    if (!accessToken || !user) {
      router.push('/login');
    }
  }, [accessToken, user, router]);

  if (!accessToken || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Marquee Banner - visible on all screen sizes */}
      <MarqueeBanner
        messages={[
          "Chào mừng bạn đến với Challenge App - Nền tảng học tập thông qua thử thách",
          "Phiên bản mới đã được cập nhật với nhiều tính năng hấp dẫn",
          "Hãy tạo thử thách đầu tiên của bạn ngay hôm nay!"
        ]}
        variant="primary"
        fixed={true}
        className="bg-background/60 dark:bg-background/60"
      />

      <div className="flex pt-7"> {/* Added padding-top to account for fixed banner */}
        {/* Sidebar */}
        <aside className="hidden w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:block sticky top-7 h-[calc(100vh-28px)]"> {/* Made sidebar sticky */}
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6">
              <div
                className="flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
                onClick={() => router.push('/dashboard')}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Lightbulb className="h-4 w-4" />
                </div>
                <span className="text-xl font-bold">Challenge App</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-4 overflow-y-auto">
              <div className="py-2">
                <h3 className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Tổng quan</h3>
                <div className="mt-2 space-y-1">
                  <NavLink
                    href="/dashboard"
                    icon={LayoutDashboard}
                    label="Bảng điều khiển"
                    exactMatch
                  />
                </div>
              </div>

              <div className="py-2">
                <h3 className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Thử thách</h3>
                <div className="mt-2 space-y-1">
                  <NavLink
                    href="/dashboard/challenges/create"
                    icon={PlusCircle}
                    label="Tạo thử thách mới"
                  />
                  <NavLink
                    href="/dashboard/selfChallenge"
                    icon={Lightbulb}
                    label="Thử thách tự học"
                  />
                </div>
              </div>

              <div className="py-2">
                <h3 className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Tài khoản</h3>
                <div className="mt-2 space-y-1">
                  <NavLink
                    href="/dashboard/profile"
                    icon={UserCircle}
                    label="Hồ sơ cá nhân"
                  />
                  <NavLink
                    href="/dashboard/change-password"
                    icon={Settings}
                    label="Đổi mật khẩu"
                  />
                </div>
              </div>
            </nav>

            {/* User profile and theme toggle */}
            <div className="p-4 border-t space-y-4">
              {/* User profile */}
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 transition-all">
                <Avatar>
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name || 'Người dùng'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email || 'user@example.com'}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-red-500/10 hover:text-red-500 transition-colors"
                  onClick={() => setLogoutDialogOpen(true)}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>

              {/* Theme toggle */}
              <Button
                variant="outline"
                className="w-full justify-start gap-2 transition-colors"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="h-4 w-4" />
                    <span>Chế độ sáng</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" />
                    <span>Chế độ tối</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </aside>
        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {/* Header for mobile only */}
          <header className="sticky top-7 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
            {/* Mobile menu */}
            <div className="container flex h-14 items-center">
              <div className="flex items-center gap-2 w-full justify-between">
                <div className="flex items-center gap-2">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="mr-2">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] sm:w-[350px] pr-0">
                      <div className="flex flex-col h-full">
                        {/* Logo */}
                        <div className="p-4 border-b">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                              <Lightbulb className="h-4 w-4" />
                            </div>
                            <span className="text-xl font-bold">Challenge App</span>
                          </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex-1 overflow-auto py-2 px-4">
                          <div className="py-2">
                            <h3 className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Tổng quan</h3>
                            <div className="mt-2 space-y-1">
                              <NavLink
                                href="/dashboard"
                                icon={LayoutDashboard}
                                label="Bảng điều khiển"
                                exactMatch
                              />
                            </div>
                          </div>

                          <div className="py-2">
                            <h3 className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Thử thách</h3>
                            <div className="mt-2 space-y-1">
                              <NavLink
                                href="/dashboard/challenges/create"
                                icon={PlusCircle}
                                label="Tạo thử thách mới"
                              />
                              <NavLink
                                href="/dashboard/selfChallenge"
                                icon={Lightbulb}
                                label="Thử thách tự học"
                              />
                            </div>
                          </div>

                          <div className="py-2">
                            <h3 className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Tài khoản</h3>
                            <div className="mt-2 space-y-1">
                              <NavLink
                                href="/dashboard/profile"
                                icon={UserCircle}
                                label="Hồ sơ cá nhân"
                              />
                              <NavLink
                                href="/dashboard/change-password"
                                icon={Settings}
                                label="Đổi mật khẩu"
                              />
                            </div>
                          </div>
                        </div>

                        {/* User profile and theme toggle */}
                        <div className="p-4 border-t space-y-4">
                          {/* User profile */}
                          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 transition-all">
                            <Avatar>
                              <AvatarImage src={user?.avatar} />
                              <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{user?.name || 'Người dùng'}</p>
                              <p className="text-xs text-muted-foreground truncate">{user?.email || 'user@example.com'}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-red-500/10 hover:text-red-500 transition-colors"
                              onClick={() => setLogoutDialogOpen(true)}
                            >
                              <LogOut className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Theme toggle */}
                          <Button
                            variant="outline"
                            className="w-full justify-start gap-2 transition-colors"
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                          >
                            {theme === 'dark' ? (
                              <>
                                <Sun className="h-4 w-4" />
                                <span>Chế độ sáng</span>
                              </>
                            ) : (
                              <>
                                <Moon className="h-4 w-4" />
                                <span>Chế độ tối</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>

                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                      <Lightbulb className="h-4 w-4" />
                    </div>
                    <span className="font-semibold">Challenge App</span>
                  </div>
                </div>

                {/* Mobile avatar */}
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>
          {/* Page content */}
          <div className="container p-6">{children}</div>
        </main>
      </div>

      {/* Modal xác nhận đăng xuất */}
      <LogoutModal
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
      />
    </div>
  );
}
