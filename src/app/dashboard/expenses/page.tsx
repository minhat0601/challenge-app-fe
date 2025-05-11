'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PersonalExpenseGroup, PersonalExpenseOverview } from '@/types/personal-expense';
import { getPersonalExpenseGroups, getPersonalExpenseOverview } from '@/services/personal-expense-service';
import { CreateExpenseGroupDialog } from '@/components/expenses/create-expense-group-dialog';
import { CreatePersonalExpenseDialog } from '@/components/expenses/create-personal-expense-dialog';
import { DeletePersonalExpenseDialog } from '@/components/expenses/delete-personal-expense-dialog';
import { toast } from 'sonner';
import {
  DollarSign,
  Plus,
  ArrowLeft,
  Wallet,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  ArrowUp,
  ArrowDown,
  Grid,
  LayoutList,
  Receipt,
} from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { useIsMobile } from '@/hooks/use-media-query';

export default function PersonalExpensesPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [expenseGroups, setExpenseGroups] = useState<PersonalExpenseGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'card' | 'table'>(isMobile ? 'table' : 'card');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Cập nhật viewMode khi kích thước màn hình thay đổi
  useEffect(() => {
    if (isMobile) {
      setViewMode('table');
    }
  }, [isMobile]);

  // Lấy danh sách nhóm chi tiêu
  useEffect(() => {
    const fetchExpenseGroups = async () => {
      setLoading(true);
      try {
        const groups = await getPersonalExpenseGroups();
        if (groups) {
          setExpenseGroups(groups);
          setLoading(false);
        } else {
          setLoading(false);
          toast.error('Không thể tải danh sách nhóm chi tiêu');
        }
      } catch (error) {
        console.error('Error fetching expense groups:', error);
        setLoading(false);
        toast.error('Đã xảy ra lỗi khi tải danh sách nhóm chi tiêu');
      }
    };

    fetchExpenseGroups();
  }, []);

  // Xử lý khi tạo nhóm chi tiêu mới
  const handleExpenseGroupCreated = async () => {
    try {
      const groups = await getPersonalExpenseGroups();
      if (groups) {
        setExpenseGroups(groups);
      }
    } catch (error) {
      console.error('Error refreshing expense groups:', error);
      toast.error('Không thể cập nhật danh sách nhóm chi tiêu');
    }
  };

  // Xử lý khi chọn nhóm chi tiêu
  const handleSelectGroup = (groupId: string) => {
    router.push(`/dashboard/expenses/${groupId}`);
  };

  // Sắp xếp danh sách nhóm chi tiêu
  const getSortedGroups = () => {
    if (!expenseGroups) return [];

    return [...expenseGroups].sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc'
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý quỹ nhóm</h1>
          <p className="text-muted-foreground">Theo dõi và quản lý thu chi chung của nhóm</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại Dashboard
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <div className="flex items-center space-x-2">
          <CreateExpenseGroupDialog
            onExpenseGroupCreated={handleExpenseGroupCreated}
            trigger={
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tạo quỹ nhóm mới
              </Button>
            }
          />
        </div>

        <div className="flex items-center space-x-2">
          {!isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode(viewMode === 'card' ? 'table' : 'card')}
              className="h-8 mr-2"
            >
              {viewMode === 'card' ? (
                <><LayoutList className="h-4 w-4 mr-1" /> Dạng bảng</>
              ) : (
                <><Grid className="h-4 w-4 mr-1" /> Dạng thẻ</>
              )}
            </Button>
          )}

          <div className="text-sm text-muted-foreground mr-2 hidden sm:block">Sắp xếp theo:</div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'name')}
            className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="date">Ngày tạo</option>
            <option value="name">Tên quỹ</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="h-8 px-2"
          >
            {sortOrder === 'asc' ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : expenseGroups.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <Wallet className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Chưa có quỹ nhóm</h3>
          <p className="text-muted-foreground mt-2 mb-6">Tạo quỹ nhóm đầu tiên để bắt đầu theo dõi thu chi chung.</p>
          <CreateExpenseGroupDialog
            onExpenseGroupCreated={handleExpenseGroupCreated}
            trigger={
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tạo quỹ nhóm mới
              </Button>
            }
          />
        </div>
      ) : (
        <>
          {/* Danh sách nhóm chi tiêu */}
          {viewMode === 'card' && !isMobile ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {getSortedGroups().map((group) => (
                <div
                  key={group.id}
                  className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:border-primary cursor-pointer transition-colors"
                  onClick={() => handleSelectGroup(group.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold truncate">{group.name}</h3>
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                      <PiggyBank className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {group.description || 'Không có mô tả'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>
                        {new Date(group.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      <span>{group.createdBy?.name || 'Không xác định'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 w-12 text-center">#</th>
                    <th className="text-left p-3">Tên quỹ</th>
                    <th className="text-left p-3 hidden md:table-cell">Mô tả</th>
                    <th className="text-left p-3 hidden sm:table-cell">Ngày tạo</th>
                    <th className="text-left p-3 hidden md:table-cell">Người tạo</th>
                    <th className="w-12 p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {getSortedGroups().map((group, index) => (
                    <tr
                      key={group.id}
                      className="border-b hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleSelectGroup(group.id)}
                    >
                      <td className="p-3 text-center font-medium">{index + 1}</td>
                      <td className="p-3 font-medium">{group.name}</td>
                      <td className="p-3 hidden md:table-cell">
                        <span className="line-clamp-1">{group.description || 'Không có mô tả'}</span>
                      </td>
                      <td className="p-3 whitespace-nowrap hidden sm:table-cell">
                        {new Date(group.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="p-3 hidden md:table-cell">{group.createdBy?.name || 'Không xác định'}</td>
                      <td className="p-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectGroup(group.id);
                          }}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
