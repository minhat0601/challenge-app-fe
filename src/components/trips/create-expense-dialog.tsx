'use client';

import { useState, useEffect } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createExpense, getCostSharingGroupMembers, CostSharingGroupMember, getCostSharingOverview } from '@/services/trip-service';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { formatCurrency } from '@/utils/format';
import { formatNumberWithCommas, numberToVietnameseWords, parseFormattedNumber } from '@/utils/number-to-words';

interface CreateExpenseDialogProps {
  costSharingGroupId: string;
  onExpenseCreated: () => void;
  trigger?: React.ReactNode;
  groupBalance?: number; // Số dư quỹ nhóm hiện tại
}

export function CreateExpenseDialog({
  costSharingGroupId,
  onExpenseCreated,
  trigger,
  groupBalance = 0,
}: CreateExpenseDialogProps) {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [members, setMembers] = useState<CostSharingGroupMember[]>([]);
  const [amountInWords, setAmountInWords] = useState('');

  // Hàm để lấy ngày hiện tại dưới dạng chuỗi YYYY-MM-DD
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Hàm để lấy giờ hiện tại dưới dạng chuỗi HH:MM
  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Form state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [formattedAmount, setFormattedAmount] = useState('');
  const [date, setDate] = useState(getCurrentDate());
  const [time, setTime] = useState(getCurrentTime());
  const [type, setType] = useState('group'); // Mặc định là chi tiêu nhóm
  const [participantId, setParticipantId] = useState('');

  // Cập nhật số tiền bằng chữ khi số tiền thay đổi
  useEffect(() => {
    if (formattedAmount) {
      try {
        const numericAmount = parseFormattedNumber(formattedAmount);
        if (!isNaN(numericAmount) && numericAmount > 0) {
          setAmount(numericAmount.toString());
          setAmountInWords(numberToVietnameseWords(numericAmount));
        } else {
          setAmount('');
          setAmountInWords('');
        }
      } catch (error) {
        setAmount('');
        setAmountInWords('');
      }
    } else {
      setAmount('');
      setAmountInWords('');
    }
  }, [formattedAmount]);

  // Lấy danh sách thành viên khi dialog mở
  useEffect(() => {
    if (open) {
      const fetchMembers = async () => {
        setLoadingMembers(true);
        try {
          const data = await getCostSharingGroupMembers(costSharingGroupId);
          setMembers(data);

          // Tự động chọn thành viên là người dùng hiện tại
          if (user?.id) {
            const currentUserMember = data.find(member => member.user?.id === user.id);
            if (currentUserMember) {
              setParticipantId(currentUserMember.id);
            } else if (data.length > 0) {
              setParticipantId(data[0].id);
            }
          }
        } catch (error) {
          console.error('Error fetching members:', error);
          toast.error('Không thể tải danh sách thành viên');
        } finally {
          setLoadingMembers(false);
        }
      };

      fetchMembers();
    }
  }, [open, costSharingGroupId, user?.id]);

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setFormattedAmount('');
    setAmountInWords('');
    setDate(getCurrentDate());
    setTime(getCurrentTime());
    setType('group');
    setParticipantId('');
  };

  const handleCreateExpense = async () => {
    // Validate form
    if (!description.trim()) {
      setErrorMessage('Vui lòng nhập mô tả chi tiêu');
      setErrorDialogOpen(true);
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setErrorMessage('Vui lòng nhập số tiền hợp lệ');
      setErrorDialogOpen(true);
      return;
    }

    // Chỉ kiểm tra người chi tiêu khi nguồn tiền là "personal"
    if (type === 'personal' && !participantId) {
      setErrorMessage('Vui lòng chọn người chi tiêu');
      setErrorDialogOpen(true);
      return;
    }

    setLoading(true);
    try {
      // Đảm bảo dữ liệu đúng định dạng trước khi gửi
      // Chuyển đổi amount từ string sang number
      const numericAmount = parseFloat(amount);

      if (isNaN(numericAmount)) {
        setErrorMessage('Số tiền không hợp lệ');
        setErrorDialogOpen(true);
        return;
      }

      // Nếu nguồn tiền là "group", sử dụng người dùng hiện tại làm người chi tiêu
      // Nếu không có người dùng hiện tại, sử dụng thành viên đầu tiên trong danh sách
      let selectedParticipantId = participantId;

      if (type === 'group') {
        if (user?.id) {
          const currentUserMember = members.find(member => member.user?.id === user.id);
          if (currentUserMember) {
            selectedParticipantId = currentUserMember.id;
          } else if (members.length > 0) {
            selectedParticipantId = members[0].id;
          }
        } else if (members.length > 0) {
          selectedParticipantId = members[0].id;
        }
      }

      // Kết hợp ngày và giờ thành một chuỗi datetime đầy đủ
      const dateTimeString = `${date}T${time}:00`;

      const expenseData = {
        description: description.trim(),
        amount: numericAmount,
        date: dateTimeString,
        type: type,
        costSharingGroupId: costSharingGroupId,
        costSharingGroupParticipantId: selectedParticipantId,
      };

      console.log('Expense data before sending:', expenseData);
      const result = await createExpense(expenseData);

      if (result.success) {
        toast.success('Đã tạo chi tiêu thành công');
        resetForm();
        setOpen(false);
        onExpenseCreated();
      } else {
        // Hiển thị thông báo lỗi chi tiết
        console.error('Error creating expense:', result.error);
        setErrorMessage(result.error || 'Không thể tạo chi tiêu');
        setErrorDialogOpen(true);
      }
    } catch (error) {
      console.error('Error creating expense:', error);
      setErrorMessage('Đã xảy ra lỗi khi tạo chi tiêu');
      setErrorDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) resetForm();
      }}>
        <DialogTrigger asChild>
          {trigger || <Button>Thêm chi tiêu</Button>}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Thêm chi tiêu mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin chi tiêu cho chuyến đi của bạn.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Mô tả
              </Label>
              <Textarea
                id="description"
                placeholder="Nhập mô tả chi tiêu"
                className="col-span-3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Số tiền
              </Label>
              <div className="col-span-3 flex flex-col">
                <div className="flex items-center">
                  <Input
                    id="amount"
                    type="text"
                    placeholder="Nhập số tiền"
                    value={formattedAmount}
                    onChange={(e) => {
                      // Chỉ cho phép nhập số và dấu phẩy
                      const value = e.target.value.replace(/[^0-9,]/g, '');
                      setFormattedAmount(formatNumberWithCommas(value));
                    }}
                  />
                  <span className="ml-2">VNĐ</span>
                </div>

                {/* Hiển thị số tiền bằng chữ */}
                {amountInWords && (
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    {amountInWords}
                  </p>
                )}

                {/* Hiển thị số dư quỹ hiện tại */}
                {type === 'group' && (
                  <p className={`text-xs mt-1 ${Number(amount) > groupBalance ? 'text-red-500' : 'text-green-500'}`}>
                    {Number(amount) > groupBalance
                      ? `Quỹ nhóm không đủ (thiếu ${formatCurrency(Number(amount) - groupBalance)})`
                      : `Số dư quỹ hiện tại: ${formatCurrency(groupBalance)}`
                    }
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Ngày giờ
              </Label>
              <div className="col-span-3 grid grid-cols-2 gap-2">
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Nguồn tiền
              </Label>
              <Select
                value={type}
                onValueChange={(value) => {
                  setType(value);
                  // Khi chuyển từ personal sang group, tự động chọn người chi tiêu là người dùng hiện tại
                  if (value === 'group' && user?.id) {
                    const currentUserMember = members.find(member => member.user?.id === user.id);
                    if (currentUserMember) {
                      setParticipantId(currentUserMember.id);
                    } else if (members.length > 0) {
                      setParticipantId(members[0].id);
                    }
                  }
                }}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn loại chi tiêu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="group">Quỹ nhóm</SelectItem>
                  <SelectItem value="personal">Cá nhân ứng trước</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Chỉ hiển thị trường người chi tiêu khi nguồn tiền là "personal" (cá nhân ứng trước) */}
            {type === 'personal' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="participant" className="text-right">
                  Người chi tiêu
                </Label>
                <Select
                  value={participantId}
                  onValueChange={setParticipantId}
                  disabled={loadingMembers}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={loadingMembers ? "Đang tải..." : "Chọn người chi tiêu"} />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.user?.name || member.name || 'Không có tên'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Hủy
            </Button>
            <Button onClick={handleCreateExpense} disabled={loading}>
              {loading ? 'Đang tạo...' : 'Tạo chi tiêu'}
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
