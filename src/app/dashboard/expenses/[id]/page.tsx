'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PersonalExpenseOverview } from '@/types/personal-expense';
import { getPersonalExpenseOverview } from '@/services/personal-expense-service';
import { CreateExpenseDialog } from '@/components/expenses/create-expense-dialog';
import { CreateContributionDialog } from '@/components/expenses/create-contribution-dialog';
import { DeletePersonalExpenseDialog } from '@/components/expenses/delete-personal-expense-dialog';
import { AddParticipantDialog } from '@/components/expenses/add-participant-dialog';
import { DeleteParticipantDialog } from '@/components/expenses/delete-participant-dialog';
import { toast } from 'sonner';
import {
  DollarSign,
  Plus,
  ArrowLeft,
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
  Scale,
  Users,
  ArrowRight,
} from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { useIsMobile } from '@/hooks/use-media-query';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { fetchWithAuth } from '@/lib/fetcher';
import envConf from '@/app/config/config';

const API_BASE_URL = envConf.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3000';

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

export default function ExpenseGroupDetailPage() {
  const router = useRouter();
  const params = useParams();
  const isMobile = useIsMobile();
  const [expenseOverview, setExpenseOverview] = useState<PersonalExpenseOverview | null>(null);
  const [members, setMembers] = useState<CostSharingGroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'table'>(isMobile ? 'table' : 'card');
  const [expenseSortBy, setExpenseSortBy] = useState<'date' | 'amount'>('date');
  const [expenseSortOrder, setExpenseSortOrder] = useState<'asc' | 'desc'>('desc');
  const [incomeSortBy, setIncomeSortBy] = useState<'date' | 'amount'>('date');
  const [incomeSortOrder, setIncomeSortOrder] = useState<'asc' | 'desc'>('desc');

  // Lấy id từ params một cách an toàn
  const expenseGroupId = typeof params?.id === 'string' ? params.id : '';

  // Cập nhật viewMode khi kích thước màn hình thay đổi
  useEffect(() => {
    if (isMobile) {
      setViewMode('table');
    }
  }, [isMobile]);

  // Lấy chi tiết tổng quan chi tiêu
  const fetchExpenseOverview = useCallback(async () => {
    setLoading(true);
    try {
      const overview = await getPersonalExpenseOverview(expenseGroupId);
      if (overview) {
        setExpenseOverview(overview);
      } else {
        toast.error('Không thể tải thông tin chi tiêu');
      }
    } catch (error) {
      console.error('Error fetching expense overview:', error);
      toast.error('Đã xảy ra lỗi khi tải thông tin chi tiêu');
    } finally {
      setLoading(false);
    }
  }, [expenseGroupId]);

  // Lấy danh sách thành viên
  const fetchMembers = useCallback(async () => {
    setLoadingMembers(true);
    try {
      const membersData = await getCostSharingGroupMembers(expenseGroupId);
      setMembers(membersData);

      // Cập nhật lại tổng quan chi tiêu khi danh sách thành viên thay đổi
      fetchExpenseOverview();
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Không thể tải danh sách thành viên');
    } finally {
      setLoadingMembers(false);
    }
  }, [expenseGroupId, fetchExpenseOverview]);

  useEffect(() => {
    if (expenseGroupId) {
      fetchExpenseOverview();
      fetchMembers();
    }
  }, [expenseGroupId, fetchExpenseOverview, fetchMembers]);

  // Sắp xếp danh sách chi tiêu
  const getSortedExpenses = () => {
    if (!expenseOverview || !expenseOverview.expenses) return [];

    return [...expenseOverview.expenses].sort((a, b) => {
      if (expenseSortBy === 'date') {
        return expenseSortOrder === 'asc'
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return expenseSortOrder === 'asc'
          ? Number(a.amount) - Number(b.amount)
          : Number(b.amount) - Number(a.amount);
      }
    });
  };

  // Sắp xếp danh sách thu nhập (đóng góp)
  const getSortedIncomes = () => {
    if (!expenseOverview || !expenseOverview.contributions) return [];

    return [...expenseOverview.contributions].sort((a, b) => {
      if (incomeSortBy === 'date') {
        return incomeSortOrder === 'asc'
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return incomeSortOrder === 'asc'
          ? Number(a.amount) - Number(b.amount)
          : Number(b.amount) - Number(a.amount);
      }
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!expenseOverview) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>
        <div className="text-center py-12 border rounded-lg">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <DollarSign className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Không tìm thấy thông tin chi tiêu</h3>
          <p className="text-muted-foreground mt-2 mb-6">Thông tin chi tiêu này không tồn tại hoặc bạn không có quyền truy cập.</p>
          <Button onClick={() => router.push('/dashboard/expenses')}>
            Quay lại danh sách quỹ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6 bg-background text-foreground">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">{expenseOverview.name}</h1>
        <p className="text-muted-foreground">{expenseOverview.description || 'Không có mô tả'}</p>
      </div>

      {/* Tổng quan chi tiêu */}
      <div className="bg-card rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-primary" />
          Tổng quan chi tiêu
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card/50 rounded-lg p-4 shadow-sm border flex flex-col">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full bg-red-900/20 flex items-center justify-center mr-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
              </div>
              <span className="text-sm font-medium">Tổng chi tiêu</span>
            </div>
            <span className="text-xl font-bold text-red-500">{formatCurrency(expenseOverview.totalExpense)}</span>
            <div className="mt-2 text-xs text-slate-400">
              <span className="inline-flex items-center mr-3">
                <Users className="h-3 w-3 mr-1" />
                Nhóm: {formatCurrency(expenseOverview.totalGroupExpense || 0)}
              </span>
              <span className="inline-flex items-center">
                <User className="h-3 w-3 mr-1" />
                Cá nhân: {formatCurrency(expenseOverview.totalPersonalExpense || 0)}
              </span>
            </div>
          </div>

          <div className="bg-card/50 rounded-lg p-4 shadow-sm border flex flex-col">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full bg-green-900/20 flex items-center justify-center mr-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <span className="text-sm font-medium">Tổng đóng góp</span>
            </div>
            <span className="text-xl font-bold text-green-500">{formatCurrency(expenseOverview.totalContributions)}</span>
            <div className="mt-2 text-xs text-slate-400">
              <span className="inline-flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {expenseOverview.countContributions} khoản đóng góp
              </span>
            </div>
          </div>

          <div className="bg-card/50 rounded-lg p-4 shadow-sm border flex flex-col">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-900/20 flex items-center justify-center mr-2">
                <PiggyBank className="h-4 w-4 text-blue-500" />
              </div>
              <span className="text-sm font-medium">Số dư</span>
            </div>
            <span className={`text-xl font-bold ${(expenseOverview.totalContributions - expenseOverview.totalGroupExpense) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(expenseOverview.totalContributions - expenseOverview.totalGroupExpense)}
            </span>
            <div className="mt-2 text-xs text-slate-400">
              <span className="inline-flex items-center">
                {(expenseOverview.totalContributions - expenseOverview.totalGroupExpense) >= 0 ? (
                  <>
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    Còn dư
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                    Thiếu hụt
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs chi tiêu, đóng góp, thành viên và cân đối */}
      <Tabs defaultValue="expenses" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="expenses">Chi tiêu</TabsTrigger>
          <TabsTrigger value="incomes">Đóng quỹ</TabsTrigger>
          <TabsTrigger value="members">Thành viên</TabsTrigger>
          <TabsTrigger value="balance">Cân đối</TabsTrigger>
        </TabsList>

        {/* Tab chi tiêu */}
        <TabsContent value="expenses" className="mt-6">
          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
              <h3 className="text-lg font-semibold flex items-center">
                <Receipt className="h-5 w-5 mr-2 text-primary" />
                Các khoản chi ra
                <Badge className="ml-2">
                  {expenseOverview.countExpenses} khoản
                </Badge>
              </h3>

              <div className="flex items-center space-x-2">
                <CreateExpenseDialog
                  costSharingGroupId={expenseGroupId}
                  groupBalance={expenseOverview.totalContributions - expenseOverview.totalGroupExpense}
                  onExpenseCreated={fetchExpenseOverview}
                  trigger={
                    <Button size="sm" className="h-8 mr-2">
                      <Plus className="h-4 w-4 mr-1" />
                      Thêm chi tiêu
                    </Button>
                  }
                />

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
                  value={expenseSortBy}
                  onChange={(e) => setExpenseSortBy(e.target.value as 'date' | 'amount')}
                  className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="date">Ngày</option>
                  <option value="amount">Số tiền</option>
                </select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpenseSortOrder(expenseSortOrder === 'asc' ? 'desc' : 'asc')}
                  className="h-8 px-2"
                >
                  {expenseSortOrder === 'asc' ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {expenseOverview.expenses && expenseOverview.expenses.length > 0 ? (
              <>
                {viewMode === 'card' && !isMobile ? (
                  <div className="space-y-2">
                    {getSortedExpenses().map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-4 bg-card/50 hover:bg-card/70 rounded-lg border transition-colors"
                      >
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarFallback>
                              {expense.type === 'group' ? 'U' : 'B'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{expense.description}</p>
                              <Badge className={`${expense.type === 'group' ? 'bg-blue-900/50 text-blue-400 border-blue-800' : 'bg-purple-900/50 text-purple-400 border-purple-800'} text-xs`}>
                                {expense.type === 'group' ? 'Quỹ nhóm' : 'Ứng tiền cá nhân'}
                              </Badge>
                            </div>
                            <div className="flex items-center text-xs text-slate-400 mt-1">
                              <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="mr-3">{new Date(expense.date).toLocaleDateString('vi-VN')}</span>

                              <span className="mr-3">
                                Chi bởi: {expense.type === 'personal' && expense.participant
                                  ? (expense.participant.user?.name || expense.participant.name || 'Không xác định')
                                  : (expense.createdBy?.name || 'Không xác định')}
                              </span>

                              <span>Tạo bởi: {expense.createdBy?.name || 'Không xác định'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <p className="font-medium text-red-500 text-lg mr-3">{formatCurrency(Number(expense.amount))}</p>
                          <DeletePersonalExpenseDialog
                            expenseId={expense.id}
                            expenseName={expense.description}
                            expenseType="expense"
                            onExpenseDeleted={fetchExpenseOverview}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted">
                          <th className="p-3 w-12 text-center text-muted-foreground">#</th>
                          <th className="text-left p-3 text-muted-foreground">Mô tả</th>
                          <th className="text-left p-3 text-muted-foreground">Ngày</th>
                          <th className="text-left p-3 text-muted-foreground">Người tạo/chi</th>
                          <th className="text-right p-3 text-muted-foreground">Số tiền</th>
                          <th className="w-12 p-3"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {getSortedExpenses().map((expense, index) => (
                          <tr key={expense.id} className="border-b hover:bg-muted/50">
                            <td className="p-3 text-center font-medium text-muted-foreground">{index + 1}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{expense.description}</span>
                                <Badge className={`${expense.type === 'group' ? 'bg-blue-900/50 text-blue-400 border-blue-800' : 'bg-purple-900/50 text-purple-400 border-purple-800'} text-xs`}>
                                  {expense.type === 'group' ? 'Quỹ nhóm' : 'Ứng tiền cá nhân'}
                                </Badge>
                              </div>
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              {new Date(expense.date).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="p-3">
                              <div className="flex flex-col">
                                <span>
                                  Chi bởi: {expense.type === 'personal' && expense.participant
                                    ? (expense.participant.user?.name || expense.participant.name || 'Không xác định')
                                    : (expense.createdBy?.name || 'Không xác định')}
                                </span>
                                <span className="text-xs text-slate-400">
                                  Tạo bởi: {expense.createdBy?.name || 'Không xác định'}
                                </span>
                              </div>
                            </td>
                            <td className="p-3 text-right font-medium text-red-500">
                              {formatCurrency(Number(expense.amount))}
                            </td>
                            <td className="p-3">
                              <DeletePersonalExpenseDialog
                                expenseId={expense.id}
                                expenseName={expense.description}
                                expenseType="expense"
                                onExpenseDeleted={fetchExpenseOverview}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-10 border border-dashed rounded-lg">
                <Receipt className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Chưa có khoản chi tiêu nào</p>
                <CreateExpenseDialog
                  costSharingGroupId={expenseGroupId}
                  groupBalance={expenseOverview.totalContributions - expenseOverview.totalGroupExpense}
                  onExpenseCreated={fetchExpenseOverview}
                  trigger={
                    <Button variant="outline" className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm khoản chi tiêu đầu tiên
                    </Button>
                  }
                />
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab thu nhập */}
        <TabsContent value="incomes" className="mt-6">
          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
              <h3 className="text-lg font-semibold flex items-center">
                <PiggyBank className="h-5 w-5 mr-2 text-primary" />
                Các khoản đóng quỹ
                <Badge className="ml-2">
                  {expenseOverview.countContributions} khoản
                </Badge>
              </h3>

              <div className="flex items-center space-x-2">
                <CreateContributionDialog
                  costSharingGroupId={expenseGroupId}
                  onContributionCreated={fetchExpenseOverview}
                  trigger={
                    <Button size="sm" className="h-8 mr-2 bg-green-600 hover:bg-green-700 text-white">
                      <Plus className="h-4 w-4 mr-1" />
                      Thêm đóng quỹ
                    </Button>
                  }
                />

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
                  value={incomeSortBy}
                  onChange={(e) => setIncomeSortBy(e.target.value as 'date' | 'amount')}
                  className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="date">Ngày</option>
                  <option value="amount">Số tiền</option>
                </select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIncomeSortOrder(incomeSortOrder === 'asc' ? 'desc' : 'asc')}
                  className="h-8 px-2"
                >
                  {incomeSortOrder === 'asc' ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {expenseOverview.contributions && expenseOverview.contributions.length > 0 ? (
              <>
                {viewMode === 'card' && !isMobile ? (
                  <div className="space-y-2">
                    {getSortedIncomes().map((income) => (
                      <div
                        key={income.id}
                        className="flex items-center justify-between p-4 bg-card/50 hover:bg-card/70 rounded-lg border transition-colors"
                      >
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarFallback>
                              {(income.participant?.name?.charAt(0) || income.participant?.user?.name?.charAt(0) || 'U')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{income.description}</p>
                              <Badge className="bg-green-900/50 text-green-400 border-green-800 text-xs">
                                Đóng quỹ
                              </Badge>
                            </div>
                            <div className="flex items-center text-xs text-slate-400 mt-1">
                              <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="mr-3">{new Date(income.date).toLocaleDateString('vi-VN')}</span>

                              <span className="mr-3">
                                Đóng bởi: {income.participant && (income.participant.user?.name || income.participant.name)
                                  ? (income.participant.user?.name || income.participant.name)
                                  : (income.createdBy?.name || 'Không xác định')}
                              </span>

                              <span>Tạo bởi: {income.createdBy?.name || 'Không xác định'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <p className="font-medium text-green-500 text-lg mr-3">{formatCurrency(Number(income.amount))}</p>
                          <DeletePersonalExpenseDialog
                            expenseId={income.id}
                            expenseName={income.description}
                            expenseType="income"
                            onExpenseDeleted={fetchExpenseOverview}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted">
                          <th className="p-3 w-12 text-center text-muted-foreground">#</th>
                          <th className="text-left p-3 text-muted-foreground">Mô tả</th>
                          <th className="text-left p-3 text-muted-foreground">Ngày</th>
                          <th className="text-left p-3 text-muted-foreground">Người đóng/tạo</th>
                          <th className="text-right p-3 text-muted-foreground">Số tiền</th>
                          <th className="w-12 p-3"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {getSortedIncomes().map((income, index) => (
                          <tr key={income.id} className="border-b hover:bg-muted/50">
                            <td className="p-3 text-center font-medium text-muted-foreground">{index + 1}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{income.description}</span>
                                <Badge className="bg-green-900/50 text-green-400 border-green-800 text-xs">
                                  Đóng quỹ
                                </Badge>
                              </div>
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              {new Date(income.date).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="p-3">
                              <div className="flex flex-col">
                                <span>Đóng bởi: {income.participant && (income.participant.user?.name || income.participant.name)
                                  ? (income.participant.user?.name || income.participant.name)
                                  : (income.createdBy?.name || 'Không xác định')}</span>
                                <span className="text-xs text-slate-400">
                                  Tạo bởi: {income.createdBy?.name || 'Không xác định'}
                                </span>
                              </div>
                            </td>
                            <td className="p-3 text-right font-medium text-green-500">
                              {formatCurrency(Number(income.amount))}
                            </td>
                            <td className="p-3">
                              <DeletePersonalExpenseDialog
                                expenseId={income.id}
                                expenseName={income.description}
                                expenseType="income"
                                onExpenseDeleted={fetchExpenseOverview}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-10 border border-dashed rounded-lg">
                <PiggyBank className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Chưa có khoản đóng quỹ nào</p>
                <CreateContributionDialog
                  costSharingGroupId={expenseGroupId}
                  onContributionCreated={fetchExpenseOverview}
                  trigger={
                    <Button variant="outline" className="mt-4 bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/30">
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm khoản đóng quỹ đầu tiên
                    </Button>
                  }
                />
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab thành viên */}
        <TabsContent value="members" className="mt-6">
          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
              <h3 className="text-lg font-semibold flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary" />
                Thành viên quỹ nhóm
                <Badge className="ml-2">
                  {members.length} thành viên
                </Badge>
              </h3>

              <div className="flex items-center space-x-2">
                <AddParticipantDialog
                  costSharingGroupId={expenseGroupId}
                  onParticipantAdded={fetchMembers}
                  trigger={
                    <Button size="sm" className="h-8 mr-2">
                      <Plus className="h-4 w-4 mr-1" />
                      Thêm thành viên
                    </Button>
                  }
                />
              </div>
            </div>

            {loadingMembers ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : members.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="bg-card/50 p-4 rounded-lg border flex items-center"
                  >
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarFallback>
                        {(member.user?.name || member.name || '?').charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">
                        {member.user?.name || member.name || 'Không xác định'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.user ? 'Có tài khoản' : 'Không có tài khoản'}
                      </p>
                    </div>
                    <DeleteParticipantDialog
                      participantId={member.id}
                      participantName={member.user?.name || member.name || 'Không xác định'}
                      onParticipantDeleted={fetchMembers}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed rounded-lg">
                <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Chưa có thành viên nào trong quỹ nhóm</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab cân đối */}
        <TabsContent value="balance" className="mt-6">
          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
              <h3 className="text-lg font-semibold flex items-center">
                <Scale className="h-5 w-5 mr-2 text-primary" />
                Cân đối chi tiêu
                <Badge className="ml-2">
                  {expenseOverview.participants?.length || 0} thành viên
                </Badge>
              </h3>
            </div>

            {expenseOverview.balances && Object.keys(expenseOverview.balances).length > 0 ? (
              <div className="space-y-6">
                {/* Thông tin cân đối */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.values(expenseOverview.balances).map((balance) => (
                    <div
                      key={balance.costSharingGroupParticipantId}
                      className="bg-card/50 p-4 rounded-lg border"
                    >
                      <div className="flex items-center mb-3">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarFallback>{balance.name?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{balance.name || 'Không xác định'}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Đã chi:</span>
                          <span className="font-medium">{formatCurrency(balance.paid)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cần trả:</span>
                          <span className="font-medium">{formatCurrency(balance.shouldPay)}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t">
                          <span className="text-muted-foreground">Cân đối:</span>
                          <span className={`font-medium ${balance.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(balance.balance)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Thanh toán đề xuất */}
                {expenseOverview.settlements && expenseOverview.settlements.length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-base font-medium mb-4">Thanh toán đề xuất</h4>
                    <div className="space-y-3">
                      {expenseOverview.settlements.map((settlement, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-card/50 rounded-lg border">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{settlement.fromName?.charAt(0) || '?'}</AvatarFallback>
                            </Avatar>
                            <ArrowRight className="h-4 w-4 mx-2" />
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{settlement.toName?.charAt(0) || '?'}</AvatarFallback>
                            </Avatar>
                            <span className="ml-2 text-sm font-medium">
                              {settlement.fromName || 'Không xác định'} cần trả {settlement.toName || 'Không xác định'}
                            </span>
                          </div>
                          <span className="font-medium">{formatCurrency(settlement.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed rounded-lg">
                <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Chưa có thông tin cân đối chi tiêu</p>
                <p className="text-xs text-muted-foreground mt-2">Thêm khoản chi tiêu và đóng góp để xem thông tin cân đối</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
