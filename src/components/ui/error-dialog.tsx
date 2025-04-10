'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { XCircle } from 'lucide-react';

interface ErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  errorMessage: string;
  showSavedMessage?: boolean;
}

export function ErrorDialog({
  open,
  onOpenChange,
  title = 'Đã xảy ra lỗi',
  description = 'Đã có lỗi xảy ra khi xử lý yêu cầu của bạn.',
  errorMessage,
  showSavedMessage = true,
}: ErrorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <XCircle className="h-6 w-6" />
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md my-2">
          <p className="text-sm text-destructive font-medium">{errorMessage}</p>
        </div>

        {showSavedMessage && (
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-md my-2">
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              Nội dung của bạn đã được lưu lại. Bạn có thể thử lại sau hoặc chỉnh sửa nội dung và gửi lại.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
