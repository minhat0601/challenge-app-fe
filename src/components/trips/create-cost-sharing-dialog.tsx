'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { createCostSharingGroup } from '@/services/trip-service';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface CreateCostSharingDialogProps {
  tripId: string;
  onCostSharingCreated: () => void;
  trigger?: React.ReactNode;
}

export function CreateCostSharingDialog({
  tripId,
  onCostSharingCreated,
  trigger,
}: CreateCostSharingDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCreateCostSharing = async () => {
    setLoading(true);
    try {
      const result = await createCostSharingGroup(tripId);

      if (result.success) {
        toast.success('Đã tạo quỹ nhóm chi tiêu thành công');
        setOpen(false);
        onCostSharingCreated();
      } else {
        setErrorMessage(result.error || 'Không thể tạo quỹ nhóm chi tiêu');
        setErrorDialogOpen(true);
      }
    } catch (error) {
      console.error('Error creating cost sharing group:', error);
      setErrorMessage('Đã xảy ra lỗi khi tạo quỹ nhóm chi tiêu');
      setErrorDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || <Button>Tạo quỹ nhóm chi tiêu</Button>}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tạo quỹ nhóm chi tiêu</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn tạo quỹ nhóm chi tiêu cho chuyến đi này không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Hủy
            </Button>
            <Button onClick={handleCreateCostSharing} disabled={loading}>
              {loading ? 'Đang tạo...' : 'Tạo quỹ nhóm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lỗi</AlertDialogTitle>
            <AlertDialogDescription>
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorDialogOpen(false)}>
              Đóng
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
