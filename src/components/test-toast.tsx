'use client';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function TestToast() {
  const showSuccessToast = () => {
    toast.success('Thành công!', {
      description: 'Đây là thông báo thành công với màu mặc định.',
    });
  };

  const showErrorToast = () => {
    toast.error('Lỗi!', {
      description: 'Đây là thông báo lỗi với màu mặc định.',
    });
  };

  const showInfoToast = () => {
    toast('Thông tin', {
      description: 'Đây là thông báo thông tin với màu mặc định.',
    });
  };

  const showWarningToast = () => {
    toast.warning('Cảnh báo!', {
      description: 'Đây là thông báo cảnh báo với màu mặc định.',
    });
  };

  return (
    <div className="flex flex-col gap-4 items-start">
      <h2 className="text-xl font-semibold">Kiểm tra thông báo</h2>
      <div className="flex flex-wrap gap-2">
        <Button onClick={showSuccessToast} variant="default">
          Thông báo thành công
        </Button>
        <Button onClick={showErrorToast} variant="destructive">
          Thông báo lỗi
        </Button>
        <Button onClick={showInfoToast} variant="outline">
          Thông báo thông tin
        </Button>
        <Button onClick={showWarningToast} variant="secondary">
          Thông báo cảnh báo
        </Button>
      </div>
    </div>
  );
}
