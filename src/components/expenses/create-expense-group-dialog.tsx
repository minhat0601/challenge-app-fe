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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createPersonalExpenseGroup } from '@/services/personal-expense-service';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface CreateExpenseGroupDialogProps {
  onExpenseGroupCreated: () => void;
  trigger?: React.ReactNode;
}

export function CreateExpenseGroupDialog({
  onExpenseGroupCreated,
  trigger,
}: CreateExpenseGroupDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const resetForm = () => {
    setName('');
    setDescription('');
  };

  const handleCreateExpenseGroup = async () => {
    // Validate form
    if (!name.trim()) {
      setErrorMessage('Vui lòng nhập tên nhóm chi tiêu');
      setErrorDialogOpen(true);
      return;
    }

    setLoading(true);
    try {
      const result = await createPersonalExpenseGroup(name.trim(), description.trim());

      if (result.success) {
        toast.success('Đã tạo quỹ nhóm thành công');
        setOpen(false);
        resetForm();
        onExpenseGroupCreated();
      } else {
        setErrorMessage(result.error || 'Không thể tạo quỹ nhóm');
        setErrorDialogOpen(true);
      }
    } catch (error) {
      console.error('Error creating expense group:', error);
      setErrorMessage('Đã xảy ra lỗi khi tạo quỹ nhóm');
      setErrorDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || <Button>Tạo quỹ nhóm</Button>}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tạo quỹ nhóm mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin để tạo quỹ nhóm mới. Nhấn Tạo khi hoàn tất.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Tên quỹ
              </Label>
              <Input
                id="name"
                placeholder="Nhập tên quỹ nhóm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Mô tả
              </Label>
              <Textarea
                id="description"
                placeholder="Nhập mô tả (không bắt buộc)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleCreateExpenseGroup} disabled={loading}>
              {loading ? 'Đang tạo...' : 'Tạo quỹ nhóm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lỗi</AlertDialogTitle>
            <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
