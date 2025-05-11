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
import { MusicProviderWrapper } from '@/providers/music-provider-wrapper';
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
  Music,
  MapPin,
  DollarSign,
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
    <MusicProviderWrapper>
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
        <aside className="hidden w-72 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:block sticky top-7 h-[calc(100vh-28px)] shadow-md shadow-primary/5 dark:shadow-primary/10"> {/* Made sidebar sticky and wider */}
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-border/40">
              <div
                className="flex items-center gap-3 cursor-pointer transition-all hover:scale-105 hover:text-primary"
                onClick={() => router.push('/dashboard')}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold tracking-tight">Challenge App</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-4 px-4 py-4 overflow-y-auto">
              <div className="py-2">
                <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tổng quan</h3>
                <div className="space-y-1.5">
                  <NavLink
                    href="/dashboard"
                    icon={LayoutDashboard}
                    label="Bảng điều khiển"
                    exactMatch
                  />
                </div>
              </div>

              <div className="py-2">
                <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Thử thách</h3>
                <div className="space-y-1.5">
                  <NavLink
                    href="/dashboard/selfChallenge"
                    icon={Lightbulb}
                    label="Thử thách tự học"
                  />
                  <NavLink
                    href="/dashboard/music"
                    icon={Music}
                    label="Phòng nghe nhạc"
                  />
                  <NavLink
                    href="/dashboard/trips"
                    icon={MapPin}
                    label="Kế hoạch chuyến đi"
                  />
                  <NavLink
                    href="/dashboard/expenses"
                    icon={DollarSign}
                    label="Quản lý quỹ nhóm"
                  />
                </div>
              </div>

              <div className="py-2">
                <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tài khoản</h3>
                <div className="space-y-1.5">
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
            <div className="p-5 border-t space-y-5 bg-muted/10 dark:bg-muted/5 rounded-b-lg">
              {/* User profile */}
              <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-primary/10 transition-all border border-border/30 shadow-sm">
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name || 'Người dùng'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email || 'user@example.com'}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-red-500/10 hover:text-red-500 transition-colors rounded-full"
                  onClick={() => setLogoutDialogOpen(true)}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>

              {/* Theme toggle */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground px-3 flex items-center gap-2">
                  <Settings className="h-3.5 w-3.5" />
                  Chế độ giao diện
                </p>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-background rounded-lg border border-border/30 shadow-sm">
                  <Button
                    variant={theme === 'light' ? "default" : "ghost"}
                    size="sm"
                    className={`justify-center rounded-md ${theme === 'light' ? 'shadow-sm' : ''}`}
                    onClick={() => setTheme("light")}
                  >
                    <Sun className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={theme === 'dark' ? "default" : "ghost"}
                    size="sm"
                    className={`justify-center rounded-md ${theme === 'dark' ? 'shadow-sm' : ''}`}
                    onClick={() => setTheme("dark")}
                  >
                    <Moon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={theme === 'system' ? "default" : "ghost"}
                    size="sm"
                    className={`justify-center rounded-md ${theme === 'system' ? 'shadow-sm' : ''}`}
                    onClick={() => setTheme("system")}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center text-xs text-muted-foreground">
                  <div>Sáng</div>
                  <div>Tối</div>
                  <div>Hệ thống</div>
                </div>
              </div>
            </div>
          </div>
        </aside>
        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {/* Header for mobile only */}
          <header className="sticky top-7 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden shadow-sm">
            {/* Mobile menu */}
            <div className="container flex h-16 items-center">
              <div className="flex items-center gap-2 w-full justify-between">
                <div className="flex items-center gap-3">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="mr-1 rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] sm:w-[350px] pr-0 border-r-primary/10">
                      <div className="flex flex-col h-full">
                        {/* Logo */}
                        <div className="p-5 border-b border-border/40">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                              <Lightbulb className="h-5 w-5" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">Challenge App</span>
                          </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex-1 overflow-auto py-4 px-4">
                          <div className="py-2">
                            <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tổng quan</h3>
                            <div className="space-y-1.5">
                              <NavLink
                                href="/dashboard"
                                icon={LayoutDashboard}
                                label="Bảng điều khiển"
                                exactMatch
                              />
                            </div>
                          </div>

                          <div className="py-2">
                            <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Thử thách</h3>
                            <div className="space-y-1.5">
                              <NavLink
                                href="/dashboard/selfChallenge"
                                icon={Lightbulb}
                                label="Thử thách tự học"
                              />
                              <NavLink
                                href="/dashboard/music"
                                icon={Music}
                                label="Phòng nghe nhạc"
                              />
                              <NavLink
                                href="/dashboard/trips"
                                icon={MapPin}
                                label="Kế hoạch chuyến đi"
                              />
                              <NavLink
                                href="/dashboard/expenses"
                                icon={DollarSign}
                                label="Quản lý quỹ nhóm"
                              />
                            </div>
                          </div>

                          <div className="py-2">
                            <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tài khoản</h3>
                            <div className="space-y-1.5">
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
                        <div className="p-5 border-t space-y-5 bg-muted/10 dark:bg-muted/5 rounded-b-lg">
                          {/* User profile */}
                          <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-primary/10 transition-all border border-border/30 shadow-sm">
                            <Avatar className="h-10 w-10 border-2 border-primary/20">
                              <AvatarImage src={user?.avatar} />
                              <AvatarFallback className="bg-primary/10 text-primary font-medium">{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{user?.name || 'Người dùng'}</p>
                              <p className="text-xs text-muted-foreground truncate">{user?.email || 'user@example.com'}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-red-500/10 hover:text-red-500 transition-colors rounded-full"
                              onClick={() => setLogoutDialogOpen(true)}
                            >
                              <LogOut className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Theme toggle */}
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground px-3 flex items-center gap-2">
                              <Settings className="h-3.5 w-3.5" />
                              Chế độ giao diện
                            </p>
                            <div className="grid grid-cols-3 gap-1.5 p-1 bg-background rounded-lg border border-border/30 shadow-sm">
                              <Button
                                variant={theme === 'light' ? "default" : "ghost"}
                                size="sm"
                                className={`justify-center rounded-md ${theme === 'light' ? 'shadow-sm' : ''}`}
                                onClick={() => setTheme("light")}
                              >
                                <Sun className="h-4 w-4" />
                              </Button>
                              <Button
                                variant={theme === 'dark' ? "default" : "ghost"}
                                size="sm"
                                className={`justify-center rounded-md ${theme === 'dark' ? 'shadow-sm' : ''}`}
                                onClick={() => setTheme("dark")}
                              >
                                <Moon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant={theme === 'system' ? "default" : "ghost"}
                                size="sm"
                                className={`justify-center rounded-md ${theme === 'system' ? 'shadow-sm' : ''}`}
                                onClick={() => setTheme("system")}
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-3 gap-1.5 text-center text-xs text-muted-foreground">
                              <div>Sáng</div>
                              <div>Tối</div>
                              <div>Hệ thống</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>

                  <div className="flex items-center gap-3 cursor-pointer transition-all hover:text-primary" onClick={() => router.push('/dashboard')}>
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                      <Lightbulb className="h-5 w-5" />
                    </div>
                    <span className="font-semibold tracking-tight">Challenge App</span>
                  </div>
                </div>

                {/* Mobile avatar */}
                <Avatar className="h-9 w-9 border-2 border-primary/20 shadow-sm">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>
          {/* Page content */}
          <div className="container p-6 md:p-8 lg:p-10">
            <div className="bg-card/30 dark:bg-card/20 rounded-xl p-6 shadow-sm border border-border/30">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Modal xác nhận đăng xuất */}
      <LogoutModal
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
      />
    </div>
    </MusicProviderWrapper>
  );
}
