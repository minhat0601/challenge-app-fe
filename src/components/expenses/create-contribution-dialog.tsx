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
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
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

// Interface cho thành viên nhóm chi tiêu
interface CostSharingGroupMember {
  id: string;
  name: string | null;
  user: {
    id: string;
    name: string;
  } | null;
}

// Hàm lấy danh sách thành viên của nhóm chi tiêu
async function getCostSharingGroupMembers(costSharingGroupId: string): Promise<CostSharingGroupMember[]> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/expenses/get-all-member/${costSharingGroupId}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data as CostSharingGroupMember[];
  } catch (error) {
    console.error(`Error fetching cost sharing group members for group ${costSharingGroupId}:`, error);
    return [];
  }
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

  // Form state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [formattedAmount, setFormattedAmount] = useState('');
  const [date, setDate] = useState(getCurrentDate());
  const [time, setTime] = useState(getCurrentTime());
  const [participantId, setParticipantId] = useState('');

  // Lấy ngày hiện tại theo định dạng YYYY-MM-DD
  function getCurrentDate() {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  // Lấy thời gian hiện tại theo định dạng HH:MM
  function getCurrentTime() {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  // Lấy danh sách thành viên khi dialog mở
  useEffect(() => {
    if (open && costSharingGroupId) {
      const fetchMembers = async () => {
        setLoadingMembers(true);
        try {
          const membersData = await getCostSharingGroupMembers(costSharingGroupId);
          setMembers(membersData);
          
          // Tự động chọn người dùng hiện tại nếu có trong danh sách
          if (user && membersData.length > 0) {
            const currentUserMember = membersData.find(m => m.user?.id === user.id);
            if (currentUserMember) {
              setParticipantId(currentUserMember.id);
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
  }, [open, costSharingGroupId, user]);

  // Cập nhật số tiền bằng chữ khi số tiền thay đổi
  useEffect(() => {
    if (amount) {
      const numericAmount = Number(amount);
      if (!isNaN(numericAmount)) {
        setAmountInWords(numberToVietnameseWords(numericAmount));
      } else {
        setAmountInWords('');
      }
    } else {
      setAmountInWords('');
    }
  }, [amount]);

  // Xử lý khi số tiền thay đổi
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setAmount(value);
    
    if (value) {
      const numericValue = Number(value);
      if (!isNaN(numericValue)) {
        setFormattedAmount(formatNumberWithCommas(numericValue));
      }
    } else {
      setFormattedAmount('');
    }
  };

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

    if (!date) {
      setErrorMessage('Vui lòng chọn ngày');
      setErrorDialogOpen(true);
      return;
    }

    setLoading(true);
    try {
      // Tạo đối tượng datetime đầy đủ
      const dateObj = new Date(date);
      const [hours, minutes] = time.split(':').map(Number);
      dateObj.setHours(hours, minutes, 0, 0);
      const dateTimeString = dateObj.toISOString();

      // Chuẩn bị dữ liệu gửi đi
      const contributionData = {
        description: description.trim(),
        amount: Number(amount),
        date: dateTimeString,
        costSharingGroupId,
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
              <div className="col-span-3 relative">
                <Input
                  id="amount"
                  placeholder="Nhập số tiền"
                  value={formattedAmount}
                  onChange={handleAmountChange}
                  className="pr-12"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted-foreground">
                  VND
                </div>
              </div>
            </div>

            {amountInWords && (
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-start-2 col-span-3 text-sm text-muted-foreground italic">
                  {amountInWords}
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="participant" className="text-right">
                Người đóng góp
              </Label>
              <Select value={participantId} onValueChange={setParticipantId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn người đóng góp" />
                </SelectTrigger>
                <SelectContent>
                  {loadingMembers ? (
                    <SelectItem value="loading" disabled>
                      Đang tải...
                    </SelectItem>
                  ) : members.length > 0 ? (
                    members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.user?.name || member.name || 'Không có tên'}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="empty" disabled>
                      Không có thành viên
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
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

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                Thời gian
              </Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="col-span-3"
              />
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
