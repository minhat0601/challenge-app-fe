'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { LogOut, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogoutModal({ open, onOpenChange }: LogoutModalProps) {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Xử lý hiển thị/ẩn modal
  useEffect(() => {
    if (open) {
      setIsVisible(true);
      // Thêm class để ngăn scroll
      document.body.classList.add('overflow-hidden');
    } else {
      // Thêm timeout để có animation khi đóng
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Xóa class để cho phép scroll
        document.body.classList.remove('overflow-hidden');
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Xử lý đăng xuất
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Thực hiện đăng xuất
      logout();
      // Chuyển hướng về trang đăng nhập
      router.push('/login');
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
    } finally {
      setIsLoggingOut(false);
      handleClose();
    }
  };

  // Xử lý đóng modal
  const handleClose = () => {
    if (!isLoggingOut) {
      onOpenChange(false);
    }
  };

  // Nếu không hiển thị, không render gì cả
  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-200",
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      onClick={handleClose}
    >
      {/* Modal content */}
      <div 
        className={cn(
          "bg-background rounded-lg shadow-lg w-full max-w-md mx-4 transition-all duration-200 transform",
          open ? "scale-100" : "scale-95"
        )}
        onClick={(e) => e.stopPropagation()} // Ngăn sự kiện click lan ra ngoài
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Xác nhận đăng xuất</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClose}
            disabled={isLoggingOut}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Body */}
        <div className="p-4">
          <p className="text-muted-foreground">
            Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?
          </p>
        </div>
        
        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoggingOut}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="gap-2"
          >
            {isLoggingOut ? 'Đang đăng xuất...' : (
              <>
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
