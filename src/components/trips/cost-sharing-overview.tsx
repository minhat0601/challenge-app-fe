'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CostSharingOverview } from '@/types/expense';
import { formatCurrency } from '@/utils/format';
import { CreateExpenseDialog } from '@/components/trips/create-expense-dialog';
import { CreateContributionDialog } from '@/components/trips/create-contribution-dialog';
import { DeleteExpenseDialog } from '@/components/trips/delete-expense-dialog';
import { useMediaQuery } from '@/hooks/use-media-query';

// Hàm định dạng ngày tháng đơn giản thay thế cho date-fns
function formatDate(dateString: string): string {
  const date = new Date(dateString);

  // Định dạng ngày tháng: dd/MM/yyyy HH:mm
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}
import { Receipt, PiggyBank, MoreVertical, Plus, ArrowRight, ArrowLeft } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CostSharingOverviewComponentProps {
  data: CostSharingOverview;
  onRefresh: () => Promise<void>;
}

export function CostSharingOverviewComponent({ data, onRefresh }: CostSharingOverviewComponentProps) {
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleDeleteExpense = (expenseId: string) => {
    setDeleteExpenseId(expenseId);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{data.name}</CardTitle>
          <CardDescription>
            Tổng quan về chi tiêu và đóng góp của nhóm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-200 dark:border-green-900/30">
              <div className="text-sm text-green-600 dark:text-green-400 mb-1">Tổng đóng góp</div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {formatCurrency(data.totalContributions)}
              </div>
              <div className="text-xs text-green-500 dark:text-green-500 mt-1">
                {data.countContributions} khoản đóng góp
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-200 dark:border-red-900/30">
              <div className="text-sm text-red-600 dark:text-red-400 mb-1">Tổng chi tiêu nhóm</div>
              <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                {formatCurrency(data.totalGroupExpense)}
              </div>
              <div className="text-xs text-red-500 dark:text-red-500 mt-1">
                {data.expenses.filter(e => e.type === 'group').length} khoản chi nhóm
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-200 dark:border-blue-900/30">
              <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Số dư quỹ nhóm</div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {formatCurrency(data.totalContributions - data.totalGroupExpense)}
              </div>
              <div className="text-xs text-blue-500 dark:text-blue-500 mt-1">
                {data.participants.length} thành viên
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs cho chi tiêu và đóng góp */}
      <Tabs defaultValue="expenses" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="expenses">Các khoản chi ra</TabsTrigger>
          <TabsTrigger value="contributions">Các khoản đóng quỹ</TabsTrigger>
        </TabsList>

        {/* Tab chi tiêu */}
        <TabsContent value="expenses" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Button
                variant={viewMode === 'card' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('card')}
                className="h-8"
              >
                Thẻ
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="h-8"
              >
                Bảng
              </Button>
            </div>
            <CreateExpenseDialog
              costSharingGroupId={data.id}
              groupBalance={data.totalContributions - data.totalGroupExpense}
              onExpenseCreated={onRefresh}
              trigger={
                <Button size="sm" className="h-8">
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Thêm chi tiêu
                </Button>
              }
            />
          </div>

          {data.expenses.length > 0 ? (
            <>
              {viewMode === 'card' && !isMobile ? (
                <div className="space-y-3">
                  {data.expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 ${
                        expense.type === 'group'
                          ? 'bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 border-red-200 dark:border-red-900/30'
                          : 'bg-orange-50 dark:bg-orange-900/10 hover:bg-orange-100 dark:hover:bg-orange-900/20 border-orange-200 dark:border-orange-900/30'
                      } rounded-lg border transition-colors`}
                    >
                      <div className="flex items-start">
                        <Avatar className={`h-10 w-10 mr-3 flex-shrink-0 ${
                          expense.type === 'group'
                            ? 'border-2 border-red-200 dark:border-red-800'
                            : 'border-2 border-orange-200 dark:border-orange-800'
                        }`}>
                          <AvatarFallback className={`font-medium ${
                            expense.type === 'group'
                              ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                          }`}>
                            {expense.paiderName?.charAt(0) || expense.user?.name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{expense.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(expense.date)}
                            {' • '}
                            {expense.type === 'group' ? 'Quỹ nhóm' : 'Ứng tiền cá nhân'}
                            {' • '}
                            Chi bởi: {expense.paiderName || expense.user?.name || 'Không xác định'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center mt-2 sm:mt-0">
                        <div className={`font-bold mr-4 ${
                          expense.type === 'group'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-orange-600 dark:text-orange-400'
                        }`}>
                          {formatCurrency(parseInt(expense.amount))}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDeleteExpense(expense.id)}>
                              Xóa khoản chi
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-12 text-center">#</TableHead>
                        <TableHead>Mô tả</TableHead>
                        <TableHead>Ngày giờ</TableHead>
                        <TableHead>Loại</TableHead>
                        <TableHead>Người chi</TableHead>
                        <TableHead className="text-right">Số tiền</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.expenses.map((expense, index) => (
                        <TableRow key={expense.id}>
                          <TableCell className="text-center font-medium">{index + 1}</TableCell>
                          <TableCell className="font-medium">{expense.description}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {formatDate(expense.date)}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              expense.type === 'group'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                            }`}>
                              {expense.type === 'group' ? 'Quỹ nhóm' : 'Ứng tiền cá nhân'}
                            </span>
                          </TableCell>
                          <TableCell>{expense.paiderName || expense.user?.name || 'Không xác định'}</TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(parseInt(expense.amount))}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteExpense(expense.id)}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-10 border border-dashed rounded-lg">
              <Receipt className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Chưa có khoản chi ra nào</p>
              <CreateExpenseDialog
                costSharingGroupId={data.id}
                groupBalance={data.totalContributions - data.totalGroupExpense}
                onExpenseCreated={onRefresh}
                trigger={
                  <Button variant="outline" className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm khoản chi
                  </Button>
                }
              />
            </div>
          )}
        </TabsContent>

        {/* Tab đóng góp */}
        <TabsContent value="contributions" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Button
                variant={viewMode === 'card' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('card')}
                className="h-8"
              >
                Thẻ
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="h-8"
              >
                Bảng
              </Button>
            </div>
            <CreateContributionDialog
              costSharingGroupId={data.id}
              onContributionCreated={onRefresh}
              trigger={
                <Button size="sm" className="h-8">
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Thêm đóng góp
                </Button>
              }
            />
          </div>

          {data.contributions.length > 0 ? (
            <>
              {viewMode === 'card' && !isMobile ? (
                <div className="space-y-3">
                  {data.contributions.map((contribution) => (
                    <div
                      key={contribution.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-900/30 transition-colors"
                    >
                      <div className="flex items-start">
                        <Avatar className="h-10 w-10 mr-3 border-2 border-green-200 dark:border-green-800 flex-shrink-0">
                          <AvatarFallback className="bg-green-100 text-green-600 font-medium dark:bg-green-900/30 dark:text-green-400">
                            {contribution.paiderName?.charAt(0) || contribution.user?.name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{contribution.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(contribution.date)}
                            {' • '}
                            Đóng góp bởi: {contribution.paiderName || contribution.user?.name || 'Không xác định'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center mt-2 sm:mt-0">
                        <div className="font-bold text-green-600 dark:text-green-400 mr-4">
                          {formatCurrency(parseInt(contribution.amount))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-12 text-center">#</TableHead>
                        <TableHead>Mô tả</TableHead>
                        <TableHead>Ngày giờ</TableHead>
                        <TableHead>Người đóng góp</TableHead>
                        <TableHead className="text-right">Số tiền</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.contributions.map((contribution, index) => (
                        <TableRow key={contribution.id}>
                          <TableCell className="text-center font-medium">{index + 1}</TableCell>
                          <TableCell className="font-medium">{contribution.description}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {formatDate(contribution.date)}
                          </TableCell>
                          <TableCell>{contribution.paiderName || contribution.user?.name || 'Không xác định'}</TableCell>
                          <TableCell className="text-right font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(parseInt(contribution.amount))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-10 border border-dashed rounded-lg">
              <PiggyBank className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Chưa có khoản đóng quỹ nào</p>
              <CreateContributionDialog
                costSharingGroupId={data.id}
                onContributionCreated={onRefresh}
                trigger={
                  <Button variant="outline" className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm đóng góp
                  </Button>
                }
              />
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog xóa chi tiêu */}
      {deleteExpenseId && (
        <DeleteExpenseDialog
          expenseId={deleteExpenseId}
          open={!!deleteExpenseId}
          onOpenChange={(open) => {
            if (!open) setDeleteExpenseId(null);
          }}
          onExpenseDeleted={onRefresh}
        />
      )}
    </div>
  );
}
