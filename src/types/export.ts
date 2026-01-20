import { Trip } from "./trip";
import { Destination } from "./destination";
import { Expense } from "../services/expenseService";

export interface ParticipantInfo {
  id: string;
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: "creator" | "participant";
  totalPaid: number;
  totalOwed: number;
  balance: number;
}

export interface ExpenseByCategory {
  category_id: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  total: number;
  count: number;
}

export interface TripSummary {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  budgetUsagePercent: number;
  destinationCount: number;
  expenseCount: number;
  participantCount: number;
}

export interface TripExportData {
  trip: Trip;
  destinations: Destination[];
  expenses: Expense[];
  expensesByCategory: ExpenseByCategory[];
  participants: ParticipantInfo[];
  summary: TripSummary;
  generatedAt: Date;
}
