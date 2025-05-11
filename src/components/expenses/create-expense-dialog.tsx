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

interface CreateExpenseDialogProps {
  costSharingGroupId: string;
  onExpenseCreated: () => void;
  trigger?: React.ReactNode;
  groupBalance?: number; // Số dư quỹ nhóm hiện tại
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

// Hàm tạo chi tiêu mới
async function createExpense(data: {
  description: string;
  amount: number;
  date: string;
  type: 'group' | 'personal';
  costSharingGroupId: string;
  costSharingGroupParticipantId: string;
}): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    console.log('Sending expense data:', data);

    const response = await fetchWithAuth(`${API_BASE_URL}/expenses`, {
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
    console.error('Error creating expense:', error);
    return {
      success: false,
      error: 'Không thể tạo chi tiêu. Vui lòng thử lại sau.'
    };
  }
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

  // Form state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [formattedAmount, setFormattedAmount] = useState('');
  const [date, setDate] = useState(getCurrentDate());
  const [time, setTime] = useState(getCurrentTime());
  const [type, setType] = useState('group'); // Mặc định là chi tiêu nhóm
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

    if (!date) {
      setErrorMessage('Vui lòng chọn ngày');
      setErrorDialogOpen(true);
      return;
    }

    const numericAmount = Number(amount);

    // Kiểm tra số dư quỹ nhóm nếu là chi tiêu nhóm
    if (type === 'group' && numericAmount > groupBalance) {
      setErrorMessage(`Số dư quỹ nhóm (${formatCurrency(groupBalance)}) không đủ để chi trả khoản này.`);
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

      // Xác định người chi tiêu
      const selectedParticipantId = type === 'personal' ? participantId : (
        // Nếu là chi tiêu nhóm, sử dụng người dùng hiện tại hoặc người đầu tiên trong danh sách
        user && members.find(m => m.user?.id === user.id)?.id || members[0]?.id || ''
      );

      // Chuẩn bị dữ liệu gửi đi
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
              Nhập thông tin chi tiêu cho quỹ nhóm.
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
              <Label htmlFor="type" className="text-right">
                Loại chi tiêu
              </Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn loại chi tiêu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="group">Quỹ nhóm</SelectItem>
                  <SelectItem value="personal">Ứng tiền cá nhân</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {type === 'personal' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="participant" className="text-right">
                  Người chi tiêu
                </Label>
                <Select value={participantId} onValueChange={setParticipantId}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Chọn người chi tiêu" />
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
            )}

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

            {type === 'group' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-start-2 col-span-3">
                  <div className="text-sm flex items-center">
                    <span className="text-muted-foreground mr-2">Số dư quỹ nhóm:</span>
                    <span className={`font-medium ${groupBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(groupBalance)}
                    </span>
                  </div>
                </div>
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
