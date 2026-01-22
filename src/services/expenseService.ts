import { supabase } from "../lib/supabaseClient";
import {
  getTripParticipantTokens,
  sendPushNotification,
} from "./notificationService";

export interface Expense {
  id: string;
  trip_id: string;
  paid_by_user_id: string;
  category_id: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  date: string;
  is_split: boolean;
  created_at: string;
  paid_by_user?: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
  category?: {
    name: string;
    icon: string;
    color: string;
  };
  shares?: ExpenseShare[];
}

export interface ExpenseShare {
  id: string;
  expense_id: string;
  user_id: string;
  share_amount: number;
  share_percentage?: number;
  user?: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

/**
 * Envoie une notification push aux autres participants après ajout d'une dépense
 */
async function notifyExpenseAdded(
  tripId: string,
  currentUserId: string,
  userName: string,
  amount: number
): Promise<void> {
  try {
    const tokens = await getTripParticipantTokens(tripId, currentUserId);
    if (tokens.length > 0) {
      await sendPushNotification(
        tokens,
        "Nouvelle dépense",
        `${userName} a ajouté une dépense de ${amount.toFixed(2)}€`,
        { type: "expense", tripId }
      );
    }
  } catch (error) {
    // Silently handle error
  }
}

export const expenseService = {
  // Récupérer toutes les dépenses d'un voyage
  async getTripExpenses(tripId: string): Promise<Expense[]> {
    try {
      // Récupérer les dépenses de base
      const { data: expensesData, error: expensesError } = await supabase
        .from("expenses")
        .select("*")
        .eq("trip_id", tripId)
        .order("date", { ascending: false });

      if (expensesError) throw expensesError;

      if (!expensesData || expensesData.length === 0) {
        return [];
      }

      // Récupérer les shares séparément
      const expenseIds = expensesData.map((e: any) => e.id);
      const { data: sharesData } = await supabase
        .from("expense_shares")
        .select("*")
        .in("expense_id", expenseIds);

      // Récupérer les catégories si elles existent
      const categoryIds = expensesData
        .map((e: any) => e.category_id)
        .filter((id: string) => id);
      const uniqueCategoryIds = [...new Set(categoryIds)];

      let categoriesMap: Record<string, any> = {};
      if (uniqueCategoryIds.length > 0) {
        try {
          const { data: categoriesData } = await supabase
            .from("expense_categories")
            .select("*")
            .in("id", uniqueCategoryIds);

          if (categoriesData) {
            categoriesMap = categoriesData.reduce((acc: any, cat: any) => {
              acc[cat.id] = cat;
              return acc;
            }, {});
          }
        } catch (catError) {
          // Silently handle error
        }
      }

      // Assembler les données
      const expensesWithDetails = await Promise.all(
        expensesData.map(async (expense: any) => {
          // Récupérer l'utilisateur qui a payé
          let paidByUser = null;
          if (expense.paid_by_user_id) {
            try {
              const { data: profileData } = await supabase
                .from("profiles")
                .select("email, first_name, last_name")
                .eq("id", expense.paid_by_user_id)
                .single();

              if (profileData) {
                paidByUser = profileData;
              }
            } catch (profileError) {
              // Silently handle error
            }
          }

          // Récupérer les shares pour cette dépense
          const expenseShares = (sharesData || []).filter(
            (share: any) => share.expense_id === expense.id
          );

          // Récupérer les informations utilisateur pour les shares
          const sharesWithUsers = await Promise.all(
            expenseShares.map(async (share: any) => {
              let user = null;
              if (share.user_id) {
                try {
                  const { data: profileData } = await supabase
                    .from("profiles")
                    .select("email, first_name, last_name")
                    .eq("id", share.user_id)
                    .single();

                  if (profileData) {
                    user = profileData;
                  }
                } catch (profileError) {
                  // Silently handle error
                }
              }
              return { ...share, user };
            })
          );

          // Récupérer la catégorie
          const category = expense.category_id
            ? categoriesMap[expense.category_id] || null
            : null;

          return {
            ...expense,
            paid_by_user: paidByUser,
            category: category,
            shares: sharesWithUsers,
          };
        })
      );

      return expensesWithDetails;
    } catch (error: any) {
      throw error;
    }
  },

  // Supprimer une dépense
  async deleteExpense(expenseId: string): Promise<void> {
    try {
      // Supprimer d'abord les parts de dépense
      const { error: sharesError } = await supabase
        .from("expense_shares")
        .delete()
        .eq("expense_id", expenseId);

      if (sharesError) throw sharesError;

      // Puis supprimer la dépense
      const { error: expenseError } = await supabase
        .from("expenses")
        .delete()
        .eq("id", expenseId);

      if (expenseError) throw expenseError;
    } catch (error: any) {
      throw error;
    }
  },

  // Notifier les participants après ajout d'une dépense
  notifyExpenseAdded,
};
