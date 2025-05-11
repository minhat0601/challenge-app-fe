'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { deleteContribution } from '@/services/trip-service';
import { toast } from 'sonner';

interface DeleteContributionDialogProps {
  contributionId: string;
  contributionName: string;
  onContributionDeleted: () => void;
  trigger?: React.ReactNode;
}

export function DeleteContributionDialog({
  contributionId,
  contributionName,
  onContributionDeleted,
  trigger,
}: DeleteContributionDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDeleteContribution = async () => {
    setLoading(true);
    try {
      const result = await deleteContribution(contributionId);

      if (result.success) {
        toast.success('Đã xóa khoản đóng góp thành công');
        setOpen(false);
        onContributionDeleted();
      } else {
        toast.error(result.error || 'Không thể xóa khoản đóng góp');
      }
    } catch (error) {
      console.error('Error deleting contribution:', error);
      toast.error('Đã xảy ra lỗi khi xóa khoản đóng góp');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa khoản đóng góp</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa khoản đóng góp "{contributionName}" không? Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDeleteContribution();
            }}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {loading ? 'Đang xóa...' : 'Xóa khoản đóng góp'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
