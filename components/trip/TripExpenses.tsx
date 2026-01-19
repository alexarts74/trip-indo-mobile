import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useTheme } from "../../src/contexts/ThemeContext";
import { expenseService, Expense } from "../../src/services/expenseService";
import AddExpenseModal from "./AddExpenseModal";
import { Wallet, Calendar, User, Tag, Trash2 } from "lucide-react-native";

interface TripExpensesProps {
  tripId: string;
  tripName: string;
}

export default function TripExpenses({ tripId, tripName }: TripExpensesProps) {
  const { colors } = useTheme();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, [tripId]);

  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await expenseService.getTripExpenses(tripId);
      setExpenses(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExpense = () => {
    setIsAddModalOpen(true);
  };

  const handleExpenseAdded = () => {
    fetchExpenses();
  };

  const handleDeleteExpense = async (expenseId: string) => {
    Alert.alert(
      "Supprimer la dépense",
      "Êtes-vous sûr de vouloir supprimer cette dépense ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            setDeletingExpenseId(expenseId);
            try {
              await expenseService.deleteExpense(expenseId);
              await fetchExpenses();
            } catch (error: any) {
              Alert.alert("Erreur", "Erreur lors de la suppression de la dépense");
            } finally {
              setDeletingExpenseId(null);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <View className="gap-5">
        <View className="p-10 items-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            className="mt-3 text-sm"
            style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
          >
            Chargement des dépenses...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="gap-5">
        <View
          className="border rounded-xl p-4"
          style={{
            backgroundColor: colors.error + "20",
            borderColor: colors.error,
          }}
        >
          <Text
            className="text-sm text-center"
            style={{ color: colors.error, fontFamily: "Ubuntu-Regular" }}
          >
            Erreur: {error}
          </Text>
        </View>
      </View>
    );
  }

  const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);

  return (
    <View className="gap-5">
      {/* Carte d'en-tête */}
      <View
        className="rounded-[20px] p-6 flex-row justify-between items-start border"
        style={{
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        <View className="flex-1 mr-4">
          <Text
            className="text-2xl font-bold mb-2"
            style={{ color: colors.text, fontFamily: "Ubuntu-Bold", letterSpacing: -0.3 }}
          >
            Gestion des dépenses
          </Text>
          <Text
            className="text-sm leading-5"
            style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
          >
            Suivez et gérez toutes les dépenses de votre voyage
          </Text>
        </View>
        <TouchableOpacity
          className="flex-row items-center px-4 py-3 rounded-xl"
          style={{
            backgroundColor: colors.primary,
            shadowColor: "#f97316",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
          }}
          onPress={handleAddExpense}
          activeOpacity={0.8}
        >
          <Text
            className="text-white text-lg font-bold mr-1.5"
            style={{ fontFamily: "Ubuntu-Bold" }}
          >
            +
          </Text>
          <Text
            className="text-white text-sm font-semibold"
            style={{ fontFamily: "Ubuntu-Medium" }}
          >
            Ajouter
          </Text>
        </TouchableOpacity>
      </View>

      {expenses.length === 0 ? (
        <View
          className="rounded-[20px] p-8 items-center border"
          style={{
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          <Wallet size={64} color={colors.primary} />
          <Text
            className="text-xl font-bold mb-2 text-center"
            style={{ color: colors.text, fontFamily: "Ubuntu-Bold" }}
          >
            Aucune dépense enregistrée
          </Text>
          <Text
            className="text-[15px] text-center"
            style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
          >
            Commencez par ajouter vos premières dépenses pour ce voyage !
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 16, paddingBottom: 20 }}
        >
          {expenses.map((expense) => (
            <View
              key={expense.id}
              className="rounded-[20px] p-5 border"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 4,
              }}
            >
              <View className="flex-row items-start">
                <View
                  className="w-12 h-12 rounded-full justify-center items-center mr-3"
                  style={{
                    backgroundColor: expense.category?.color || colors.primary,
                  }}
                >
                  <Wallet size={20} color="#ffffff" />
                </View>
                <View className="flex-1 mr-3">
                  <Text
                    className="text-lg font-bold mb-1"
                    style={{ color: colors.text, fontFamily: "Ubuntu-Bold" }}
                  >
                    {expense.title}
                  </Text>
                  {expense.description && (
                    <Text
                      className="text-sm leading-5 mb-2"
                      style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
                    >
                      {expense.description}
                    </Text>
                  )}
                  <View className="flex-row flex-wrap gap-3">
                    <View className="flex-row items-center gap-1">
                      <Calendar size={12} color={colors.textSecondary} />
                      <Text
                        className="text-xs"
                        style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
                      >
                        {formatDate(expense.date)}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <User size={12} color={colors.textSecondary} />
                      <Text
                        className="text-xs"
                        style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
                      >
                        {expense.paid_by_user?.first_name ||
                          expense.paid_by_user?.email ||
                          "Inconnu"}
                      </Text>
                    </View>
                    {expense.category && (
                      <View className="flex-row items-center gap-1">
                        <Tag size={12} color={colors.textSecondary} />
                        <Text
                          className="text-xs"
                          style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
                        >
                          {expense.category.name}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <View className="items-end gap-2">
                  <Text
                    className="text-xl font-bold"
                    style={{ color: colors.text, fontFamily: "Ubuntu-Bold" }}
                  >
                    {formatAmount(expense.amount)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteExpense(expense.id)}
                    disabled={deletingExpenseId === expense.id}
                    className="p-2"
                    activeOpacity={0.7}
                  >
                    {deletingExpenseId === expense.id ? (
                      <ActivityIndicator size="small" color={colors.error} />
                    ) : (
                      <Trash2 size={18} color={colors.error} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Participants et parts */}
              {expense.shares && expense.shares.length > 0 && (
                <View
                  className="mt-4 pt-4 border-t"
                  style={{
                    backgroundColor: colors.input,
                    borderTopColor: colors.border,
                  }}
                >
                  <Text
                    className="text-xs font-semibold mb-2"
                    style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
                  >
                    Répartition entre {expense.shares.length} participant(s) :
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {expense.shares.map((share) => (
                      <View
                        key={share.id}
                        className="px-3 py-1.5 rounded-xl border"
                        style={{
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                        }}
                      >
                        <Text
                          className="text-xs"
                          style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
                        >
                          {share.user?.first_name || share.user?.email} :{" "}
                          {formatAmount(share.share_amount)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          ))}

          {/* Résumé des dépenses */}
          <View
            className="rounded-[20px] p-5 border mt-2"
            style={{
              backgroundColor: colors.primaryLight + "40",
              borderColor: colors.primary,
            }}
          >
            <View className="flex-row justify-between items-center">
              <View>
                <Text
                  className="text-lg font-bold mb-1"
                  style={{ color: colors.primaryDark, fontFamily: "Ubuntu-Bold" }}
                >
                  Total des dépenses
                </Text>
                <Text
                  className="text-sm"
                  style={{ color: colors.primaryDark, fontFamily: "Ubuntu-Regular" }}
                >
                  {expenses.length} dépense{expenses.length > 1 ? "s" : ""} enregistrée
                  {expenses.length > 1 ? "s" : ""}
                </Text>
              </View>
              <Text
                className="text-2xl font-bold"
                style={{ color: colors.primaryDark, fontFamily: "Ubuntu-Bold" }}
              >
                {formatAmount(totalExpenses)}
              </Text>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Modal d'ajout de dépense */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        tripId={tripId}
        onExpenseAdded={handleExpenseAdded}
      />
    </View>
  );
}
