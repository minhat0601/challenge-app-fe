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
import { createPersonalExpense } from '@/services/personal-expense-service';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { formatCurrency } from '@/utils/format';

interface CreatePersonalExpenseDialogProps {
  personalExpenseGroupId: string;
  defaultType?: 'income' | 'expense';
  onExpenseCreated: () => void;
  trigger?: React.ReactNode;
}

export function CreatePersonalExpenseDialog({
  personalExpenseGroupId,
  defaultType = 'expense',
  onExpenseCreated,
  trigger,
}: CreatePersonalExpenseDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'income' | 'expense'>(defaultType);

  // Định dạng số tiền
  const [amountInWords, setAmountInWords] = useState('');

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setType(defaultType);
    setAmountInWords('');
  };

  const handleAmountChange = (value: string) => {
    // Chỉ cho phép nhập số
    const numericValue = value.replace(/[^0-9]/g, '');
    setAmount(numericValue);

    // Hiển thị số tiền bằng chữ
    if (numericValue) {
      const formattedAmount = formatCurrency(Number(numericValue));
      setAmountInWords(formattedAmount);
    } else {
      setAmountInWords('');
    }
  };

  const handleCreateExpense = async () => {
    // Validate form
    if (!description.trim()) {
      setErrorMessage('Vui lòng nhập mô tả khoản chi tiêu');
      setErrorDialogOpen(true);
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setErrorMessage('Vui lòng nhập số tiền hợp lệ');
      setErrorDialogOpen(true);
      return;
    }

    if (!date) {
      setErrorMessage('Vui lòng chọn ngày');
      setErrorDialogOpen(true);
      return;
    }

    // Tạo đối tượng datetime đầy đủ
    const dateObj = new Date(date);
    const now = new Date();
    dateObj.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
    const dateTimeString = dateObj.toISOString();

    setLoading(true);
    try {
      const result = await createPersonalExpense({
        description: description.trim(),
        amount: Number(amount),
        date: dateTimeString,
        type,
        personalExpenseGroupId,
      });

      if (result.success) {
        toast.success(`Đã tạo khoản ${type === 'income' ? 'thu nhập' : 'chi tiêu'} thành công`);
        setOpen(false);
        resetForm();
        onExpenseCreated();
      } else {
        setErrorMessage(result.error || 'Không thể tạo khoản chi tiêu');
        setErrorDialogOpen(true);
      }
    } catch (error) {
      console.error('Error creating expense:', error);
      setErrorMessage('Đã xảy ra lỗi khi tạo khoản chi tiêu');
      setErrorDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || <Button>Thêm khoản {defaultType === 'income' ? 'thu nhập' : 'chi tiêu'}</Button>}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Thêm khoản {defaultType === 'income' ? 'thu nhập' : 'chi tiêu'} mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin để thêm khoản {defaultType === 'income' ? 'thu nhập' : 'chi tiêu'} mới. Nhấn Thêm khi hoàn tất.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Loại
              </Label>
              <RadioGroup
                value={type}
                onValueChange={(value) => setType(value as 'income' | 'expense')}
                className="col-span-3 flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expense" id="expense" />
                  <Label htmlFor="expense" className="text-red-500 font-medium">Chi tiêu</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="income" id="income" />
                  <Label htmlFor="income" className="text-green-500 font-medium">Thu nhập</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Mô tả
              </Label>
              <Input
                id="description"
                placeholder="Nhập mô tả khoản chi tiêu"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Số tiền
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="amount"
                  type="text"
                  placeholder="Nhập số tiền"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className={`${type === 'income' ? 'text-green-500' : 'text-red-500'} font-medium`}
                />
                {amountInWords && (
                  <p className="text-xs text-muted-foreground">{amountInWords}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Ngày
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleCreateExpense} disabled={loading}>
              {loading ? 'Đang thêm...' : 'Thêm khoản'}
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
