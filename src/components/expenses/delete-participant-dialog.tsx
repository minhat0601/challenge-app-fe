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
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/fetcher';
import envConf from '@/app/config/config';
import { Trash2, Loader2 } from 'lucide-react';

const API_BASE_URL = envConf.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3000';

interface DeleteParticipantDialogProps {
  participantId: string;
  participantName: string;
  onParticipantDeleted: () => void;
  trigger?: React.ReactNode;
}

export function DeleteParticipantDialog({
  participantId,
  participantName,
  onParticipantDeleted,
  trigger,
}: DeleteParticipantDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/cost-sharing/participant/${participantId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.status}`);
      }

      toast.success('Đã xóa người tham gia thành công');
      setOpen(false);
      onParticipantDeleted();
    } catch (error) {
      console.error('Error deleting participant:', error);
      toast.error(error instanceof Error ? error.message : 'Không thể xóa người tham gia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
          onClick={() => setOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa người tham gia</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Bạn có chắc chắn muốn xóa <span className="font-medium">{participantName}</span> khỏi nhóm quỹ?</p>
              <p className="text-red-500 font-medium">Lưu ý: Tất cả các khoản chi tiêu và đóng góp của người này cũng sẽ bị xóa.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                'Xóa người tham gia'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
