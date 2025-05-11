export interface PersonalExpenseGroup {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
}

export interface PersonalExpense {
  id: string;
  description: string;
  amount: string;
  date: string;
  type: 'income' | 'expense';
  personalExpenseGroupId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
}

export interface PersonalExpenseOverview {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;

  // Các trường từ API mới
  expenses: import('@/types/expense').Expense[];
  contributions: import('@/types/expense').Contribution[];
  participants: import('@/types/expense').CostSharingGroupParticipant[];
  totalGroupExpense: number;
  totalPersonalExpense: number;
  totalExpense: number;
  totalContributions: number;
  countExpenses: number;
  countContributions: number;
  balances?: Record<string, import('@/types/expense').BalanceInfo>;
  settlements: import('@/types/expense').Settlement[];

  // Các trường cũ để tương thích với code hiện tại
  totalIncome?: number;
  totalExpense?: number;
  balance?: number;
  countIncomes?: number;
  incomes?: PersonalExpense[];
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
}
