'use client';

import { useState, useEffect, useRef } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { fetchWithAuth } from '@/lib/fetcher';
import envConf from '@/app/config/config';
import { Loader2, Search, UserPlus, Check, X } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

const API_BASE_URL = envConf.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3000';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AddParticipantDialogProps {
  costSharingGroupId: string;
  onParticipantAdded: () => void;
  trigger?: React.ReactNode;
}

export function AddParticipantDialog({
  costSharingGroupId,
  onParticipantAdded,
  trigger,
}: AddParticipantDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [activeTab, setActiveTab] = useState('existing');

  // Tìm kiếm người dùng khi debouncedSearchQuery thay đổi
  useEffect(() => {
    if (debouncedSearchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      setSearchLoading(true);
      try {
        const response = await fetchWithAuth(`${API_BASE_URL}/users/search?key=${encodeURIComponent(debouncedSearchQuery)}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        setSearchResults(data.data || []);
      } catch (error) {
        console.error('Error searching users:', error);
        toast.error('Không thể tìm kiếm người dùng');
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    searchUsers();
  }, [debouncedSearchQuery]);

  // Thêm người tham gia vào nhóm quỹ
  const addParticipant = async (isAccountHolder: boolean) => {
    if (isAccountHolder && !selectedUser) {
      setErrorMessage('Vui lòng chọn người dùng để thêm vào nhóm quỹ');
      setErrorDialogOpen(true);
      return;
    }

    if (!isAccountHolder && !newParticipantName.trim()) {
      setErrorMessage('Vui lòng nhập tên người tham gia');
      setErrorDialogOpen(true);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        costSharingGroupId,
        userId: isAccountHolder ? selectedUser?.id : null,
        name: isAccountHolder ? null : newParticipantName.trim(),
        isAccountHolder
      };

      const response = await fetchWithAuth(`${API_BASE_URL}/cost-sharing/add-participant`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.status}`);
      }

      toast.success('Đã thêm người tham gia thành công');
      setOpen(false);
      onParticipantAdded();
      resetForm();
    } catch (error) {
      console.error('Error adding participant:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Không thể thêm người tham gia');
      setErrorDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUser(null);
    setNewParticipantName('');
    setActiveTab('existing');
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
  };

  const handleAddExistingUser = () => {
    addParticipant(true);
  };

  const handleAddNewParticipant = () => {
    addParticipant(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) resetForm();
      }}>
        <DialogTrigger asChild>
          {trigger || <Button>Thêm người tham gia</Button>}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Thêm người tham gia</DialogTitle>
            <DialogDescription>
              Thêm người tham gia vào nhóm quỹ chi tiêu.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="existing">Người dùng có tài khoản</TabsTrigger>
              <TabsTrigger value="new">Người tham gia mới</TabsTrigger>
            </TabsList>

            <TabsContent value="existing" className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm người dùng theo tên hoặc email"
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchLoading && (
                  <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>

              <div className="border rounded-md overflow-hidden">
                {searchResults.length > 0 ? (
                  <div className="max-h-[200px] overflow-y-auto">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        className={`flex items-center justify-between p-3 hover:bg-muted cursor-pointer ${
                          selectedUser?.id === user.id ? 'bg-muted' : ''
                        }`}
                        onClick={() => handleUserSelect(user)}
                      >
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        {selectedUser?.id === user.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    {debouncedSearchQuery.trim().length < 2
                      ? 'Nhập ít nhất 2 ký tự để tìm kiếm'
                      : searchLoading
                      ? 'Đang tìm kiếm...'
                      : 'Không tìm thấy người dùng'}
                  </div>
                )}
              </div>

              <Button
                onClick={handleAddExistingUser}
                disabled={!selectedUser || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang thêm...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Thêm người dùng
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="new" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Tên
                  </Label>
                  <Input
                    id="name"
                    placeholder="Nhập tên người tham gia"
                    className="col-span-3"
                    value={newParticipantName}
                    onChange={(e) => setNewParticipantName(e.target.value)}
                  />
                </div>
              </div>

              <Button
                onClick={handleAddNewParticipant}
                disabled={!newParticipantName.trim() || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang thêm...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Thêm người tham gia mới
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Hủy
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
