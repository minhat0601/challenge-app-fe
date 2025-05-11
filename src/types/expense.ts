export interface User {
  id: string;
  name: string;
}

export interface CostSharingGroupParticipant {
  id: string;
  createdAt: string;
  userId: string | null;
  name: string | null;
  isAccountHolder: boolean;
  tripParticipantId: string | null;
  costSharingGroupId: string;
}

export interface Expense {
  id: string;
  amount: string;
  description: string;
  date: string;
  type: 'group' | 'personal';
  costSharingGroupParticipantId: string;
  paiderName: string | null;
  user: User | null;
  createdBy: User;
  costSharingGroupParticipant?: CostSharingGroupParticipant;
}

export interface Contribution {
  id: string;
  amount: string;
  description: string;
  date: string;
  paiderName: string | null;
  costSharingGroupParticipantId: string;
  user: User | null;
  createdBy: User;
  costSharingGroupParticipant?: CostSharingGroupParticipant;
}

export interface Settlement {
  from: string;
  fromName?: string;
  to: string;
  toName?: string;
  amount: number;
}

export interface BalanceInfo {
  costSharingGroupParticipantId: string;
  name: string;
  paid: number;
  shouldPay: number;
  balance: number;
}

export interface CostSharingOverview {
  id: string;
  name: string;
  expenses: Expense[];
  contributions: Contribution[];
  participants: CostSharingGroupParticipant[];
  totalGroupExpense: number;
  totalPersonalExpense: number;
  totalExpense: number;
  totalContributions: number;
  countExpenses: number;
  countContributions: number;
  members: string[];
  settlements: Settlement[];
  balances?: Record<string, BalanceInfo>;
}
