import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { supabase } from "../lib/supabaseClient";
import { tripService } from "./tripService";
import { destinationsService } from "./destinationsService";
import { expenseService, Expense } from "./expenseService";
import { generatePDFHTML } from "../templates/pdfTemplate";
import {
  TripExportData,
  TripSummary,
  ParticipantInfo,
  ExpenseByCategory,
} from "../types/export";
import { Trip } from "../types/trip";
import { Destination } from "../types/destination";

async function fetchTripParticipants(tripId: string): Promise<ParticipantInfo[]> {
  try {
    // Fetch participants from trip_participants table with profile info
    const { data: participantsData, error: participantsError } = await supabase
      .from("trip_participants")
      .select("*")
      .eq("trip_id", tripId);

    if (participantsError) throw participantsError;

    if (!participantsData || participantsData.length === 0) {
      return [];
    }

    // Fetch profile info for each participant
    const participantsWithProfiles = await Promise.all(
      participantsData.map(async (participant) => {
        let profile = null;
        try {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("email, first_name, last_name")
            .eq("id", participant.user_id)
            .single();

          if (profileData) {
            profile = profileData;
          }
        } catch (profileError) {
          // Log removed("Could not fetch profile for participant:", profileError);
        }

        return {
          id: participant.id,
          user_id: participant.user_id,
          email: profile?.email || "unknown@email.com",
          first_name: profile?.first_name || undefined,
          last_name: profile?.last_name || undefined,
          role: participant.role as "creator" | "participant",
          totalPaid: 0,
          totalOwed: 0,
          balance: 0,
        };
      })
    );

    return participantsWithProfiles;
  } catch (error) {
    // Error removed("Error fetching participants:", error);
    return [];
  }
}

function calculateParticipantBalances(
  participants: ParticipantInfo[],
  expenses: Expense[]
): ParticipantInfo[] {
  // Create a map for quick participant lookup
  const participantMap = new Map<string, ParticipantInfo>();
  participants.forEach((p) => {
    participantMap.set(p.user_id, { ...p, totalPaid: 0, totalOwed: 0, balance: 0 });
  });

  // Calculate totals for each participant
  expenses.forEach((expense) => {
    // Add amount paid to the payer
    const payer = participantMap.get(expense.paid_by_user_id);
    if (payer) {
      payer.totalPaid += expense.amount;
    }

    // Add share amounts to each participant who owes
    if (expense.shares && expense.shares.length > 0) {
      expense.shares.forEach((share) => {
        const participant = participantMap.get(share.user_id);
        if (participant) {
          participant.totalOwed += share.share_amount;
        }
      });
    } else if (expense.is_split && participants.length > 0) {
      // If no shares defined but is_split is true, divide equally
      const shareAmount = expense.amount / participants.length;
      participants.forEach((p) => {
        const participant = participantMap.get(p.user_id);
        if (participant) {
          participant.totalOwed += shareAmount;
        }
      });
    }
  });

  // Calculate balance (what you paid - what you owe)
  participantMap.forEach((participant) => {
    participant.balance = participant.totalPaid - participant.totalOwed;
  });

  return Array.from(participantMap.values());
}

function groupExpensesByCategory(expenses: Expense[]): ExpenseByCategory[] {
  const categoryMap = new Map<string, ExpenseByCategory>();

  expenses.forEach((expense) => {
    const categoryId = expense.category_id || "uncategorized";
    const existing = categoryMap.get(categoryId);

    if (existing) {
      existing.total += expense.amount;
      existing.count += 1;
    } else {
      categoryMap.set(categoryId, {
        category_id: categoryId,
        category_name: expense.category?.name || "Autre",
        category_icon: expense.category?.icon || "💰",
        category_color: expense.category?.color || "#64748b",
        total: expense.amount,
        count: 1,
      });
    }
  });

  // Sort by total descending
  return Array.from(categoryMap.values()).sort((a, b) => b.total - a.total);
}

function calculateTripSummary(
  trip: Trip,
  destinations: Destination[],
  expenses: Expense[],
  participants: ParticipantInfo[]
): TripSummary {
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remaining = trip.budget - totalSpent;
  const budgetUsagePercent = trip.budget > 0 ? (totalSpent / trip.budget) * 100 : 0;

  return {
    totalBudget: trip.budget,
    totalSpent,
    remaining,
    budgetUsagePercent,
    destinationCount: destinations.length,
    expenseCount: expenses.length,
    participantCount: participants.length,
  };
}

async function collectTripData(tripId: string, trip: Trip): Promise<TripExportData> {
  // Fetch all data in parallel
  const [destinations, expenses, participants] = await Promise.all([
    destinationsService.fetchDestinations(tripId),
    expenseService.getTripExpenses(tripId),
    fetchTripParticipants(tripId),
  ]);

  // Calculate participant balances with expense data
  const participantsWithBalances = calculateParticipantBalances(
    participants,
    expenses
  );

  // Group expenses by category
  const expensesByCategory = groupExpensesByCategory(expenses);

  // Calculate summary
  const summary = calculateTripSummary(
    trip,
    destinations || [],
    expenses,
    participantsWithBalances
  );

  return {
    trip,
    destinations: destinations || [],
    expenses,
    expensesByCategory,
    participants: participantsWithBalances,
    summary,
    generatedAt: new Date(),
  };
}

async function generatePDF(data: TripExportData): Promise<string> {
  const html = generatePDFHTML(data);

  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  });

  return uri;
}

async function sharePDF(fileUri: string): Promise<void> {
  const isAvailable = await Sharing.isAvailableAsync();

  if (!isAvailable) {
    throw new Error("Le partage n'est pas disponible sur cet appareil");
  }

  await Sharing.shareAsync(fileUri, {
    mimeType: "application/pdf",
    dialogTitle: "Partager le voyage",
    UTI: "com.adobe.pdf",
  });
}

export async function exportTripToPDF(trip: Trip): Promise<void> {
  // Collect all trip data
  const exportData = await collectTripData(trip.id, trip);

  // Generate PDF
  const pdfUri = await generatePDF(exportData);

  // Share PDF
  await sharePDF(pdfUri);
}

export const pdfExportService = {
  exportTripToPDF,
  collectTripData,
  generatePDF,
  sharePDF,
};
