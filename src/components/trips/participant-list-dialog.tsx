'use client';

import { useState } from 'react';
import { TripParticipant } from '@/types/trip';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Check, X, UserMinus, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { removeTripParticipant, updateParticipantPermissions } from '@/services/trip-service';

interface ParticipantListDialogProps {
  participants: TripParticipant[];
  trigger?: React.ReactNode;
  tripId: string;
  onParticipantRemoved?: () => void;
  onPermissionsUpdated?: () => void;
}

export default function ParticipantListDialog({
  participants,
  trigger,
  tripId,
  onParticipantRemoved,
  onPermissionsUpdated
}: ParticipantListDialogProps) {
  const [open, setOpen] = useState(false);

  const [removingParticipantId, setRemovingParticipantId] = useState<string | null>(null);
  const [updatingPermissionId, setUpdatingPermissionId] = useState<string | null>(null);
  const [updatingPermissionType, setUpdatingPermissionType] = useState<'canPlanning' | 'canManageExpenses' | null>(null);

  // Xử lý khi xóa người tham gia
  const handleRemoveParticipant = async (participantId: string) => {
    try {
      setRemovingParticipantId(participantId);

      // Gọi API xóa người tham gia
      const success = await removeTripParticipant(tripId, participantId);

      if (success) {
        toast.success('Xóa người tham gia thành công');

        if (onParticipantRemoved) {
          onParticipantRemoved();
        }
      } else {
        toast.error('Không thể xóa người tham gia');
      }
    } catch (error) {
      console.error('Error removing participant:', error);
      toast.error('Đã xảy ra lỗi khi xóa người tham gia');
    } finally {
      setRemovingParticipantId(null);
    }
  };

  // Xử lý khi cập nhật quyền
  const handleUpdatePermission = async (participantId: string, permissionType: 'canPlanning' | 'canManageExpenses', newValue: boolean) => {
    try {
      setUpdatingPermissionId(participantId);
      setUpdatingPermissionType(permissionType);

      // Gọi API cập nhật quyền
      const success = await updateParticipantPermissions(tripId, participantId, {
        [permissionType]: newValue
      });

      if (success) {
        toast.success('Cập nhật quyền thành công');

        if (onPermissionsUpdated) {
          onPermissionsUpdated();
        }
      } else {
        toast.error('Không thể cập nhật quyền');
      }
    } catch (error) {
      console.error('Error updating permission:', error);
      toast.error('Đã xảy ra lỗi khi cập nhật quyền');
    } finally {
      setUpdatingPermissionId(null);
      setUpdatingPermissionType(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            Xem tất cả người tham gia
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] p-4 sm:p-6 max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Danh sách người tham gia</DialogTitle>
          <DialogDescription>
            Danh sách tất cả người tham gia trong chuyến đi này.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 overflow-auto">
          {/* Bảng cho màn hình lớn */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">STT</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-center">Lên lịch trình</TableHead>
                  <TableHead className="text-center">Cập nhật chi tiêu</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((participant, index) => (
                  <TableRow key={participant.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{participant.name}</p>
                            {participant.isOrganizer && (
                              <span className="px-1.5 py-0.5 rounded-sm text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
                                Trưởng ban
                              </span>
                            )}
                          </div>
                          {!participant.isAccountHolder && (
                            <p className="text-xs text-muted-foreground">Không có tài khoản</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{participant.email || '-'}</TableCell>
                    <TableCell className="text-center">
                      {participant.isOrganizer ? (
                        <Check className="h-5 w-5 mx-auto text-green-500" />
                      ) : participant.isAccountHolder ? (
                        <div className="flex justify-center">
                          {updatingPermissionId === participant.id && updatingPermissionType === 'canPlanning' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : participant.permissions?.canPlanning ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-green-500 hover:text-red-500 hover:bg-red-50"
                              onClick={() => handleUpdatePermission(participant.id, 'canPlanning', false)}
                              title="Nhấn để hủy quyền"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-green-500 hover:bg-green-50"
                              onClick={() => handleUpdatePermission(participant.id, 'canPlanning', true)}
                              title="Nhấn để cấp quyền"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ) : !participant.isAccountHolder ? (
                        <span className="text-xs text-muted-foreground">-</span>
                      ) : participant.permissions?.canPlanning ? (
                        <Check className="h-5 w-5 mx-auto text-green-500" />
                      ) : (
                        <X className="h-5 w-5 mx-auto text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {participant.isOrganizer ? (
                        <Check className="h-5 w-5 mx-auto text-green-500" />
                      ) : participant.isAccountHolder ? (
                        <div className="flex justify-center">
                          {updatingPermissionId === participant.id && updatingPermissionType === 'canManageExpenses' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : participant.permissions?.canManageExpenses ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-green-500 hover:text-red-500 hover:bg-red-50"
                              onClick={() => handleUpdatePermission(participant.id, 'canManageExpenses', false)}
                              title="Nhấn để hủy quyền"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-green-500 hover:bg-green-50"
                              onClick={() => handleUpdatePermission(participant.id, 'canManageExpenses', true)}
                              title="Nhấn để cấp quyền"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ) : !participant.isAccountHolder ? (
                        <span className="text-xs text-muted-foreground">-</span>
                      ) : participant.permissions?.canManageExpenses ? (
                        <Check className="h-5 w-5 mx-auto text-green-500" />
                      ) : (
                        <X className="h-5 w-5 mx-auto text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell>
                      {!participant.isOrganizer && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Tùy chọn</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleRemoveParticipant(participant.id)}
                              disabled={removingParticipantId === participant.id}
                            >
                              {removingParticipantId === participant.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Đang xóa...
                                </>
                              ) : (
                                <>
                                  <UserMinus className="h-4 w-4 mr-2" />
                                  Xóa khỏi chuyến đi
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Danh sách cho màn hình di động */}
          <div className="md:hidden space-y-4">
            {participants.map((participant) => (
              <div key={participant.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-medium">{participant.name}</p>
                        {participant.isOrganizer && (
                          <span className="px-1.5 py-0.5 rounded-sm text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
                            Trưởng ban
                          </span>
                        )}
                      </div>
                      {!participant.isAccountHolder && (
                        <p className="text-xs text-muted-foreground">Không có tài khoản</p>
                      )}
                      {participant.email && (
                        <p className="text-xs text-muted-foreground">{participant.email}</p>
                      )}
                    </div>
                  </div>
                  {!participant.isOrganizer && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Tùy chọn</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleRemoveParticipant(participant.id)}
                          disabled={removingParticipantId === participant.id}
                        >
                          {removingParticipantId === participant.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Đang xóa...
                            </>
                          ) : (
                            <>
                              <UserMinus className="h-4 w-4 mr-2" />
                              Xóa khỏi chuyến đi
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Lên lịch trình</p>
                    <div className="flex items-center">
                      <div className="w-1/2">
                        {participant.isOrganizer ? (
                          <div className="flex items-center text-green-500">
                            <Check className="h-5 w-5" />
                          </div>
                        ) : !participant.isAccountHolder ? (
                          <div className="flex items-center text-muted-foreground">
                            <span className="text-sm">-</span>
                          </div>
                        ) : participant.permissions?.canPlanning ? (
                            <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-green-500 hover:text-red-500"
                            onClick={() => handleUpdatePermission(participant.id, 'canPlanning', false)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-green-500"
                          onClick={() => handleUpdatePermission(participant.id, 'canPlanning', true)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Cập nhật chi tiêu</p>
                    <div className="flex items-center">
                      <div className="w-1/2">
                        {participant.isOrganizer ? (
                          <div className="flex items-center text-green-500">
                            <Check className="h-5 w-5" />
                          </div>
                        ) : !participant.isAccountHolder ? (
                          <div className="flex items-center text-muted-foreground">
                            <span className="text-sm">-</span>
                          </div>
                        ) : participant.permissions?.canManageExpenses ? (
                          <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-green-500 hover:text-red-500"
                          onClick={() => handleUpdatePermission(participant.id, 'canManageExpenses', false)}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        ) : (
                          <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-green-500"
                          onClick={() => handleUpdatePermission(participant.id, 'canManageExpenses', true)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
