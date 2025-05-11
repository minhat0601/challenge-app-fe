'use client';

import React, { useMemo } from 'react';
import { Trip, TripExpense, TripIncome, TripExpenseSummary } from '@/types/trip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  DollarSign, 
  PiggyBank, 
  Receipt, 
  CreditCard, 
  Utensils, 
  Car, 
  Ticket, 
  Package,
  TrendingUp,
  TrendingDown,
  AlertCircle
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency } from '@/utils/format';

interface TripExpensesSummaryProps {
  trip: Trip;
  summary: TripExpenseSummary;
}

export default function TripExpensesSummary({ trip, summary }: TripExpensesSummaryProps) {
  // Tính toán phần trăm chi tiêu theo danh mục
  const categoryPercentages = useMemo(() => {
    if (summary.totalExpenses === 0) return {};
    
    return Object.entries(summary.expensesByCategory).reduce((acc, [category, amount]) => {
      acc[category] = (amount / summary.totalExpenses) * 100;
      return acc;
    }, {} as Record<string, number>);
  }, [summary]);

  // Lấy biểu tượng cho từng danh mục
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'accommodation':
        return <CreditCard className="h-4 w-4" />;
      case 'food':
        return <Utensils className="h-4 w-4" />;
      case 'transportation':
        return <Car className="h-4 w-4" />;
      case 'activities':
        return <Ticket className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  // Lấy màu cho từng danh mục
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'accommodation':
        return 'bg-blue-500';
      case 'food':
        return 'bg-green-500';
      case 'transportation':
        return 'bg-yellow-500';
      case 'activities':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Lấy tên hiển thị cho từng danh mục
  const getCategoryName = (category: string) => {
    switch (category) {
      case 'accommodation':
        return 'Chỗ ở';
      case 'food':
        return 'Ăn uống';
      case 'transportation':
        return 'Di chuyển';
      case 'activities':
        return 'Hoạt động';
      default:
        return 'Khác';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Tổng quan chi tiêu */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Receipt className="h-5 w-5 mr-2" />
            Tổng quan chi tiêu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Tổng chi tiêu */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mr-3">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tổng chi tiêu</p>
                  <p className="text-xl font-bold">{formatCurrency(summary.totalExpenses)}</p>
                </div>
              </div>
            </div>

            {/* Tổng thu nhập */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mr-3">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tổng quỹ</p>
                  <p className="text-xl font-bold">{formatCurrency(summary.totalIncomes)}</p>
                </div>
              </div>
            </div>

            {/* Số dư */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mr-3">
                  <DollarSign className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Số dư</p>
                  <p className={`text-xl font-bold ${summary.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(summary.balance)}
                  </p>
                </div>
              </div>
            </div>

            {/* Cảnh báo nếu số dư âm */}
            {summary.balance < 0 && (
              <div className="flex items-center p-3 bg-red-100 dark:bg-red-900/20 rounded-md text-red-500">
                <AlertCircle className="h-5 w-5 mr-2" />
                <p className="text-sm">Quỹ chung không đủ để chi trả cho tất cả các khoản chi tiêu.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chi tiêu theo danh mục */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <PiggyBank className="h-5 w-5 mr-2" />
            Chi tiêu theo danh mục
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(summary.expensesByCategory).length === 0 ? (
              <p className="text-center text-muted-foreground py-6">Chưa có khoản chi tiêu nào</p>
            ) : (
              Object.entries(summary.expensesByCategory).map(([category, amount]) => (
                <div key={category} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getCategoryIcon(category)}
                      <span className="ml-2 text-sm font-medium">{getCategoryName(category)}</span>
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(amount)}</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getCategoryColor(category)}`} 
                      style={{ width: `${categoryPercentages[category] || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    {(categoryPercentages[category] || 0).toFixed(1)}%
                  </p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cân đối thanh toán */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <ArrowRight className="h-5 w-5 mr-2" />
            Cân đối thanh toán
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summary.participantBalances.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">Chưa có người tham gia nào</p>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {summary.participantBalances.map((participant) => (
                  <div key={participant.participantId} className="p-4 border rounded-lg">
                    <div className="flex items-center mb-3">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={trip.participants.find(p => p.id === participant.participantId)?.avatar} />
                        <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{participant.name}</p>
                        <p className={`text-sm ${participant.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {participant.balance >= 0 ? 'Được nhận lại' : 'Cần trả thêm'}: {formatCurrency(Math.abs(participant.balance))}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Đã chi trả:</span>
                        <span>{formatCurrency(participant.paid)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cần chi trả:</span>
                        <span>{formatCurrency(participant.owed)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-6">
                <h3 className="font-medium mb-4">Đề xuất thanh toán</h3>
                {summary.participantBalances.some(p => p.balance < 0) ? (
                  <div className="space-y-3">
                    {summary.participantBalances
                      .filter(p => p.balance < 0)
                      .map(debtor => {
                        const creditors = summary.participantBalances.filter(p => p.balance > 0);
                        return creditors.map(creditor => {
                          // Tính toán số tiền cần trả (đơn giản hóa)
                          const amount = Math.min(Math.abs(debtor.balance), creditor.balance);
                          if (amount <= 0) return null;
                          
                          return (
                            <div key={`${debtor.participantId}-${creditor.participantId}`} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                              <div className="flex items-center">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>{debtor.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <ArrowRight className="h-4 w-4 mx-2" />
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>{creditor.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                              </div>
                              <div className="flex items-center">
                                <span className="font-medium">{formatCurrency(amount)}</span>
                                <Button variant="ghost" size="sm" className="ml-2">
                                  <Receipt className="h-4 w-4" />
                                  <span className="sr-only">Chi tiết</span>
                                </Button>
                              </div>
                            </div>
                          );
                        }).filter(Boolean);
                      })}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">Không có khoản thanh toán nào cần thực hiện</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
