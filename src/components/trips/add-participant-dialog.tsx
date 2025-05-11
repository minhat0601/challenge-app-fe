'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { UserSearchResult, addTripParticipant } from '@/services/trip-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
// Command components đã được thay thế bằng các component tùy chỉnh
import { toast } from 'sonner';
import { Loader2, Plus, Search, User, UserPlus, X } from 'lucide-react';
import { searchUsers } from '@/services/trip-service';

interface AddParticipantDialogProps {
  tripId: string;
  onParticipantAdded?: () => void;
  trigger?: React.ReactNode;
}

export default function AddParticipantDialog({
  tripId,
  onParticipantAdded,
  trigger
}: AddParticipantDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('existing');

  // Trạng thái cho tab người dùng hiện có
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [searching, setSearching] = useState(false);

  // Trạng thái cho tab người dùng mới
  const [newParticipantName, setNewParticipantName] = useState('');

  // Trạng thái chung
  const [canPlanning, setCanPlanning] = useState(false);
  const [canManageExpenses, setCanManageExpenses] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tìm kiếm người dùng khi từ khóa thay đổi
  useEffect(() => {
    const fetchUsers = async () => {
      if (debouncedSearchTerm.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        const results = await searchUsers(debouncedSearchTerm);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching users:', error);
        toast.error('Không thể tìm kiếm người dùng');
      } finally {
        setSearching(false);
      }
    };

    fetchUsers();
  }, [debouncedSearchTerm]);

  // Reset form khi đóng dialog
  const resetForm = useCallback(() => {
    setSearchTerm('');
    setSelectedUser(null);
    setNewParticipantName('');
    setCanPlanning(false);
    setCanManageExpenses(false);
    setActiveTab('existing');
  }, []);

  // Xử lý khi đóng dialog
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  // Xử lý khi chọn người dùng từ kết quả tìm kiếm
  const handleSelectUser = (user: UserSearchResult) => {
    setSelectedUser(user);
    setSearchTerm(`${user.name} (${user.email})`);
  };

  // Xử lý khi xóa người dùng đã chọn
  const handleClearSelectedUser = () => {
    setSelectedUser(null);
    setSearchTerm('');
  };

  // Xử lý khi thêm người tham gia
  const handleAddParticipant = async () => {
    // Kiểm tra dữ liệu đầu vào
    if (activeTab === 'existing' && !selectedUser) {
      toast.error('Vui lòng chọn người dùng');
      return;
    }

    if (activeTab === 'new' && !newParticipantName.trim()) {
      toast.error('Vui lòng nhập tên người tham gia');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await addTripParticipant(tripId, {
        userId: activeTab === 'existing' ? selectedUser?.id : undefined,
        name: activeTab === 'new' ? newParticipantName : undefined,
        isAccountHolder: activeTab === 'existing',
        canPlanning: activeTab === 'existing' ? canPlanning : false,
        canManageExpenses: activeTab === 'existing' ? canManageExpenses : false,
      });

      if (success) {
        const successMessage = activeTab === 'existing'
          ? `Đã thêm ${selectedUser?.name} vào chuyến đi thành công`
          : `Đã thêm ${newParticipantName} vào chuyến đi thành công`;

        toast.success(successMessage);
        setOpen(false);
        resetForm();
        if (onParticipantAdded) {
          onParticipantAdded();
        }
      } else {
        const errorMessage = activeTab === 'existing'
          ? 'Không thể thêm người tham gia. Người dùng này có thể đã được thêm vào chuyến đi.'
          : 'Không thể thêm người tham gia. Vui lòng thử lại sau.';

        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error adding participant:', error);
      toast.error('Đã xảy ra lỗi khi thêm người tham gia');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Thêm người tham gia
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-4 sm:p-6 max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Thêm người tham gia</DialogTitle>
          <DialogDescription>
            Thêm người tham gia vào chuyến đi của bạn. Bạn có thể thêm người dùng đã có tài khoản hoặc thêm người tham gia mới.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">Người dùng hiện có</TabsTrigger>
            <TabsTrigger value="new">Người tham gia mới</TabsTrigger>
          </TabsList>

          <TabsContent value="existing" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="user-search">Tìm kiếm người dùng</Label>
              <div className="relative">
                {selectedUser ? (
                  <div className="flex items-center justify-between border rounded-md p-2 bg-accent/10 transition-all">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{selectedUser.name}</span>
                      <span className="text-muted-foreground text-sm">({selectedUser.email})</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={handleClearSelectedUser}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Xóa</span>
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-lg border shadow-md transition-all overflow-hidden">
                    <div className="flex items-center border-b px-3">
                      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      <input
                        className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Tìm theo tên hoặc email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    {/* Trạng thái đang tìm kiếm */}
                    {searching && (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
                        <span className="text-sm text-muted-foreground">Đang tìm kiếm...</span>
                      </div>
                    )}

                    {/* Danh sách kết quả */}
                    <div className="max-h-[300px] overflow-y-auto overflow-x-hidden">
                      {/* Trường hợp chưa nhập đủ ký tự */}
                      {!searching && searchTerm.trim().length < 2 && (
                        <div className="py-6 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <Search className="h-8 w-8 text-muted-foreground opacity-50" />
                            <p className="text-sm font-medium">Tìm kiếm người dùng</p>
                            <p className="text-xs text-muted-foreground">Nhập ít nhất 2 ký tự để bắt đầu tìm kiếm</p>
                          </div>
                        </div>
                      )}

                      {/* Trường hợp không tìm thấy kết quả */}
                      {!searching && searchTerm.trim().length >= 2 && searchResults.length === 0 && (
                        <div className="py-6 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <User className="h-8 w-8 text-muted-foreground opacity-50" />
                            <p className="text-sm font-medium">Không tìm thấy người dùng</p>
                            <p className="text-xs text-muted-foreground">Thử tìm kiếm với từ khóa khác hoặc thêm người tham gia mới</p>
                          </div>
                        </div>
                      )}

                      {/* Danh sách kết quả tìm kiếm */}
                      {!searching && searchResults.length > 0 && (
                        <div className="p-1">
                          {searchResults.map((user) => (
                            <div
                              key={user.id}
                              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground transition-colors duration-200 active:bg-accent/80 border border-transparent hover:border-accent"
                              onClick={() => handleSelectUser(user)}
                            >
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span>{user.name}</span>
                                <span className="text-muted-foreground text-sm">({user.email})</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="new" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="participant-name">Tên người tham gia</Label>
              <Input
                id="participant-name"
                placeholder="Nhập tên người tham gia"
                value={newParticipantName}
                onChange={(e) => setNewParticipantName(e.target.value)}
                className="transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-1">
                Người tham gia chưa có tài khoản sẽ không có quyền chỉnh sửa lịch trình hoặc quản lý chi tiêu.
              </p>
            </div>
          </TabsContent>

          {activeTab === 'existing' && (
            <div className="space-y-4 mt-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="can-planning"
                  checked={canPlanning}
                  onCheckedChange={(checked) => setCanPlanning(checked as boolean)}
                />
                <Label htmlFor="can-planning">Cho phép chỉnh sửa lịch trình</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="can-manage-expenses"
                  checked={canManageExpenses}
                  onCheckedChange={(checked) => setCanManageExpenses(checked as boolean)}
                />
                <Label htmlFor="can-manage-expenses">Cho phép quản lý chi tiêu</Label>
              </div>
            </div>
          )}
        </Tabs>

        <DialogFooter className="mt-6 flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="w-full sm:w-auto"
          >
            Hủy
          </Button>
          <Button
            onClick={handleAddParticipant}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Thêm người tham gia
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
