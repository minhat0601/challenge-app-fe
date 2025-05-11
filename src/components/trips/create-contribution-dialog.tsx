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
import { getCostSharingGroupMembers, CostSharingGroupMember } from '@/services/trip-service';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchWithAuth } from '@/lib/fetcher';
import envConf from '@/app/config/config';
import { formatCurrency } from '@/utils/format';
import { formatNumberWithCommas, numberToVietnameseWords, parseFormattedNumber } from '@/utils/number-to-words';

const API_BASE_URL = envConf.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3000';

interface CreateContributionDialogProps {
  costSharingGroupId: string;
  onContributionCreated: () => void;
  trigger?: React.ReactNode;
}

// Hàm tạo đóng góp mới
async function createContribution(data: {
  description: string;
  amount: number;
  date: string;
  costSharingGroupId: string;
  costSharingGroupParticipantId: string;
}): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    console.log('Sending contribution data:', data);

    const response = await fetchWithAuth(`${API_BASE_URL}/contribution`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    console.log('API response:', responseData);

    if (!response.ok) {
      console.error('API error:', responseData);
      return {
        success: false,
        error: responseData.message || `API error: ${response.status}`
      };
    }

    return {
      success: true,
      data: responseData.data
    };
  } catch (error) {
    console.error('Error creating contribution:', error);
    return {
      success: false,
      error: 'Không thể tạo đóng góp. Vui lòng thử lại sau.'
    };
  }
}

export function CreateContributionDialog({
  costSharingGroupId,
  onContributionCreated,
  trigger,
}: CreateContributionDialogProps) {
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
    setParticipantId('');
  };

  const handleCreateContribution = async () => {
    // Validate form
    if (!description.trim()) {
      setErrorMessage('Vui lòng nhập mô tả đóng góp');
      setErrorDialogOpen(true);
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setErrorMessage('Vui lòng nhập số tiền hợp lệ');
      setErrorDialogOpen(true);
      return;
    }

    if (!participantId) {
      setErrorMessage('Vui lòng chọn người đóng góp');
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

      // Kết hợp ngày và giờ thành một chuỗi datetime đầy đủ
      const dateTimeString = `${date}T${time}:00`;

      const contributionData = {
        description: description.trim(),
        amount: numericAmount,
        date: dateTimeString,
        costSharingGroupId: costSharingGroupId,
        costSharingGroupParticipantId: participantId,
      };

      console.log('Contribution data before sending:', contributionData);
      const result = await createContribution(contributionData);

      if (result.success) {
        toast.success('Đã tạo đóng góp thành công');
        resetForm();
        setOpen(false);
        onContributionCreated();
      } else {
        // Hiển thị thông báo lỗi chi tiết
        console.error('Error creating contribution:', result.error);
        setErrorMessage(result.error || 'Không thể tạo đóng góp');
        setErrorDialogOpen(true);
      }
    } catch (error) {
      console.error('Error creating contribution:', error);
      setErrorMessage('Đã xảy ra lỗi khi tạo đóng góp');
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
          {trigger || <Button>Thêm đóng góp</Button>}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Thêm đóng góp mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin đóng góp cho quỹ nhóm.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Mô tả
              </Label>
              <Textarea
                id="description"
                placeholder="Nhập mô tả đóng góp"
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
              <Label htmlFor="participant" className="text-right">
                Người đóng góp
              </Label>
              <Select
                value={participantId}
                onValueChange={setParticipantId}
                disabled={loadingMembers}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={loadingMembers ? "Đang tải..." : "Chọn người đóng góp"} />
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Hủy
            </Button>
            <Button onClick={handleCreateContribution} disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? 'Đang tạo...' : 'Tạo đóng góp'}
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
