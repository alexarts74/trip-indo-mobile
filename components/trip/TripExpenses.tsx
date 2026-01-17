import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
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
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Chargement des dépenses...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View
          style={[
            styles.errorContainer,
            {
              backgroundColor: colors.error + "20",
              borderColor: colors.error,
            },
          ]}
        >
          <Text style={[styles.errorText, { color: colors.error }]}>Erreur: {error}</Text>
        </View>
      </View>
    );
  }

  const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);

  return (
    <View style={styles.container}>
      {/* Carte d'en-tête */}
      <View
        style={[
          styles.headerCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Gestion des dépenses</Text>
          <Text style={[styles.headerDescription, { color: colors.textSecondary }]}>
            Suivez et gérez toutes les dépenses de votre voyage
        </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleAddExpense}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addButtonText}>Ajouter</Text>
        </TouchableOpacity>
      </View>

      {expenses.length === 0 ? (
        <View
          style={[
            styles.emptyContainer,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <Wallet size={64} color={colors.primary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Aucune dépense enregistrée
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Commencez par ajouter vos premières dépenses pour ce voyage !
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.expensesList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.expensesListContent}
        >
          {expenses.map((expense) => (
            <View
              key={expense.id}
              style={[
                styles.expenseCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                  shadowColor: colors.shadow,
                },
              ]}
            >
              <View style={styles.expenseHeader}>
                <View
                  style={[
                    styles.categoryIconContainer,
                    {
                      backgroundColor: expense.category?.color || colors.primary,
                    },
                  ]}
                >
                  <Wallet size={20} color="#ffffff" />
                </View>
                <View style={styles.expenseInfo}>
                  <Text style={[styles.expenseTitle, { color: colors.text }]}>
                    {expense.title}
                  </Text>
                  {expense.description && (
                    <Text style={[styles.expenseDescription, { color: colors.textSecondary }]}>
                      {expense.description}
                    </Text>
                  )}
                  <View style={styles.expenseMeta}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Calendar size={12} color={colors.textSecondary} />
                      <Text style={[styles.expenseMetaText, { color: colors.textSecondary }]}>
                        {formatDate(expense.date)}
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <User size={12} color={colors.textSecondary} />
                      <Text style={[styles.expenseMetaText, { color: colors.textSecondary }]}>
                        {expense.paid_by_user?.first_name ||
                          expense.paid_by_user?.email ||
                          "Inconnu"}
                      </Text>
                    </View>
                    {expense.category && (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Tag size={12} color={colors.textSecondary} />
                        <Text style={[styles.expenseMetaText, { color: colors.textSecondary }]}>
                          {expense.category.name}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.expenseActions}>
                  <Text style={[styles.expenseAmount, { color: colors.text }]}>
                    {formatAmount(expense.amount)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteExpense(expense.id)}
                    disabled={deletingExpenseId === expense.id}
                    style={styles.deleteButton}
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
                  style={[
                    styles.sharesContainer,
                    {
                      backgroundColor: colors.input,
                      borderTopColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.sharesTitle, { color: colors.textSecondary }]}>
                    Répartition entre {expense.shares.length} participant(s) :
                  </Text>
                  <View style={styles.sharesList}>
                    {expense.shares.map((share) => (
                      <View
                        key={share.id}
                        style={[
                          styles.shareBadge,
                          {
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <Text style={[styles.shareText, { color: colors.textSecondary }]}>
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
            style={[
              styles.summaryCard,
              {
                backgroundColor: colors.primaryLight + "40",
                borderColor: colors.primary,
              },
            ]}
          >
            <View style={styles.summaryContent}>
              <View>
                <Text style={[styles.summaryTitle, { color: colors.primaryDark }]}>
                  Total des dépenses
                </Text>
                <Text style={[styles.summarySubtitle, { color: colors.primaryDark }]}>
                  {expenses.length} dépense{expenses.length > 1 ? "s" : ""} enregistrée
                  {expenses.length > 1 ? "s" : ""}
                </Text>
              </View>
              <Text style={[styles.summaryAmount, { color: colors.primaryDark }]}>
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

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: "Ubuntu-Regular",
  },
  errorContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Ubuntu-Regular",
  },
  headerCard: {
    borderRadius: 20,
    padding: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
  },
  headerContent: {
    flex: 1,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Ubuntu-Bold",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  headerDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Ubuntu-Regular",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#f97316",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonIcon: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Ubuntu-Bold",
    marginRight: 6,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Ubuntu-Medium",
  },
  emptyContainer: {
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Ubuntu-Bold",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: "center",
    fontFamily: "Ubuntu-Regular",
  },
  expensesList: {
    flex: 1,
  },
  expensesListContent: {
    gap: 16,
    paddingBottom: 20,
  },
  expenseCard: {
    borderRadius: 20,
    padding: 20,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
  },
  expenseHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  expenseInfo: {
    flex: 1,
    marginRight: 12,
  },
  expenseTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Ubuntu-Bold",
    marginBottom: 4,
  },
  expenseDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
    fontFamily: "Ubuntu-Regular",
  },
  expenseMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  expenseMetaText: {
    fontSize: 12,
    fontFamily: "Ubuntu-Regular",
  },
  expenseActions: {
    alignItems: "flex-end",
    gap: 8,
  },
  expenseAmount: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Ubuntu-Bold",
  },
  deleteButton: {
    padding: 8,
  },
  sharesContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  sharesTitle: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Ubuntu-Medium",
    marginBottom: 8,
  },
  sharesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  shareBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  shareText: {
    fontSize: 12,
    fontFamily: "Ubuntu-Regular",
  },
  summaryCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginTop: 8,
  },
  summaryContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Ubuntu-Bold",
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 14,
    fontFamily: "Ubuntu-Regular",
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "Ubuntu-Bold",
  },
});
