import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { supabase } from "../../src/lib/supabaseClient";
import { useTheme } from "../../src/contexts/ThemeContext";

interface Place {
  id: string;
  name: string;
  price: number;
}

interface Activity {
  id: string;
  name: string;
  price: number;
  destination_id: string;
}

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  paid_by_user_id: string;
  paid_for_user_id: string | null;
  paid_by?: {
    email: string;
    user_metadata: {
      full_name?: string;
    };
  } | null;
  paid_for?: {
    email: string;
    user_metadata: {
      full_name?: string;
    };
  } | null;
}

interface TripStatsProps {
  tripId: string;
  tripBudget: number;
}

export default function TripStats({ tripId, tripBudget }: TripStatsProps) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { colors } = useTheme();

  useEffect(() => {
    fetchData();
  }, [tripId]);

  const fetchData = async () => {
    try {
      // Récupérer les destinations
      const { data: placesData, error: placesError } = await supabase
        .from("destinations")
        .select("id, name, price")
        .eq("trip_id", tripId);

      if (placesError) throw placesError;

      // Récupérer les activités
      const { data: activitiesData, error: activitiesError } = await supabase
        .from("activities")
        .select("id, name, price, destination_id")
        .in("destination_id", placesData?.map((p) => p.id) || []);

      if (activitiesError) throw activitiesError;

      // Récupérer les dépenses
      const { data: expensesData, error: expensesError } = await supabase
        .from("expenses")
        .select(
          "id, title, amount, category, date, paid_by_user_id, paid_for_user_id"
        )
        .eq("trip_id", tripId);

      if (expensesError) throw expensesError;

      setPlaces(placesData || []);
      setActivities(activitiesData || []);
      setExpenses(expensesData || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Chargement des statistiques...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.error + "20", borderColor: colors.error }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>Erreur: {error}</Text>
      </View>
    );
  }

  const totalPlacesCost = places.reduce((acc, place) => acc + place.price, 0);
  const totalActivitiesCost = activities.reduce(
    (acc, activity) => acc + activity.price,
    0
  );
  const totalExpensesCost = expenses.reduce(
    (acc, expense) => acc + expense.amount,
    0
  );
  const totalCost = totalPlacesCost + totalActivitiesCost + totalExpensesCost;
  const remainingBudget = tripBudget - totalCost;
  const budgetUsagePercentage = (totalCost / tripBudget) * 100;

  const topExpenses = [...places, ...activities, ...expenses]
    .sort((a, b) => {
      const priceA = "price" in a ? a.price : a.amount;
      const priceB = "price" in b ? b.price : b.amount;
      return priceB - priceA;
    })
    .slice(0, 5);

  const getExpenseDescription = (expense: Expense) => {
    const paidBy =
      expense.paid_by?.user_metadata?.full_name ||
      expense.paid_by?.email ||
      "Inconnu";

    if (!expense.paid_for_user_id) {
      return `Payé par ${paidBy} pour tout le monde`;
    }

    const paidFor =
      expense.paid_for?.user_metadata?.full_name ||
      expense.paid_for?.email ||
      "Inconnu";
    return `Payé par ${paidBy} pour ${paidFor}`;
  };

  return (
    <View style={styles.container}>
      {/* Titre de section */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Statistiques du voyage</Text>

      {/* Cartes de statistiques principales */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, shadowColor: colors.shadow }]}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Budget total</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{tripBudget}€</Text>
        </View>

        <View style={[
          styles.statCard, 
          { backgroundColor: colors.card, borderColor: colors.primary, borderWidth: 2, shadowColor: colors.shadow }
        ]}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Dépensé</Text>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {totalCost}€
          </Text>
          <Text style={[styles.statPercentage, { color: colors.textSecondary }]}>
            {budgetUsagePercentage.toFixed(1)}% utilisé
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, shadowColor: colors.shadow }]}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Restant</Text>
          <Text
            style={[
              styles.statValue,
              { color: remainingBudget >= 0 ? colors.success : colors.error },
            ]}
          >
            {remainingBudget}€
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, shadowColor: colors.shadow }]}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Éléments</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {places.length + activities.length + expenses.length}
          </Text>
          <Text style={[styles.statSubtext, { color: colors.textSecondary }]}>planifiés</Text>
        </View>
      </View>

      {/* Barre de progression du budget */}
      <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, shadowColor: colors.shadow }]}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressTitle, { color: colors.text }]}>Utilisation du budget</Text>
          <Text style={[styles.progressPercentage, { color: colors.primary }]}>
            {budgetUsagePercentage.toFixed(1)}%
          </Text>
        </View>
        <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.min(budgetUsagePercentage, 100)}%`,
                backgroundColor:
                  budgetUsagePercentage > 100
                    ? colors.error
                    : budgetUsagePercentage > 80
                    ? colors.primaryDark
                    : colors.primary,
              },
            ]}
          />
        </View>
        <View style={styles.progressLabels}>
          <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>0€</Text>
          <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>{tripBudget}€</Text>
        </View>
      </View>

      {/* Répartition et Top dépenses */}
      <View style={styles.detailsRow}>
        <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, shadowColor: colors.shadow }]}>
          <Text style={[styles.detailCardTitle, { color: colors.text }]}>Répartition</Text>
          <View style={styles.distributionList}>
            <View style={styles.distributionItem}>
              <View style={[styles.distributionDot, { backgroundColor: colors.primary }]} />
              <View style={styles.distributionContent}>
                <Text style={[styles.distributionLabel, { color: colors.textSecondary }]}>Destinations</Text>
                <Text style={[styles.distributionValue, { color: colors.text }]}>{totalPlacesCost}€</Text>
              </View>
            </View>
            <View style={styles.distributionItem}>
              <View style={[styles.distributionDot, { backgroundColor: "#fb923c" }]} />
              <View style={styles.distributionContent}>
                <Text style={[styles.distributionLabel, { color: colors.textSecondary }]}>Activités</Text>
                <Text style={[styles.distributionValue, { color: colors.text }]}>{totalActivitiesCost}€</Text>
              </View>
            </View>
            <View style={styles.distributionItem}>
              <View style={[styles.distributionDot, { backgroundColor: "#fdba74" }]} />
              <View style={styles.distributionContent}>
                <Text style={[styles.distributionLabel, { color: colors.textSecondary }]}>Dépenses</Text>
                <Text style={[styles.distributionValue, { color: colors.text }]}>{totalExpensesCost}€</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, shadowColor: colors.shadow }]}>
          <Text style={[styles.detailCardTitle, { color: colors.text }]}>Top 5 dépenses</Text>
          <View style={styles.topExpensesList}>
            {topExpenses.length > 0 ? (
              topExpenses.map((expense, index) => {
                const name = "name" in expense ? expense.name : expense.title;
                const price = "price" in expense ? expense.price : expense.amount;

                return (
                  <View key={expense.id} style={styles.topExpenseItem}>
                    <View style={[styles.topExpenseRank, { backgroundColor: colors.card }]}>
                      <Text style={[styles.topExpenseRankText, { color: colors.textSecondary }]}>{index + 1}</Text>
                    </View>
                    <View style={styles.topExpenseContent}>
                      <Text style={[styles.topExpenseName, { color: colors.text }]} numberOfLines={1}>
                        {name}
                      </Text>
                      {"paid_by_user_id" in expense && (
                        <Text style={[styles.topExpenseDescription, { color: colors.textSecondary }]} numberOfLines={1}>
                          {getExpenseDescription(expense)}
                        </Text>
                      )}
                    </View>
                    <Text style={[styles.topExpensePrice, { color: colors.primary }]}>{price}€</Text>
                  </View>
                );
              })
            ) : (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aucune dépense</Text>
            )}
          </View>
        </View>
      </View>

      {/* Alertes */}
      {budgetUsagePercentage > 100 && (
        <View style={[styles.alertCardError, { backgroundColor: colors.error + "20", borderColor: colors.error }]}>
          <Text style={styles.alertIcon}>⚠️</Text>
          <View style={styles.alertContent}>
            <Text style={[styles.alertTitle, { color: colors.error }]}>Budget dépassé !</Text>
            <Text style={[styles.alertText, { color: colors.error }]}>
              Vous avez dépassé votre budget de {Math.abs(remainingBudget)}€.
              Considérez ajuster vos plans ou augmenter votre budget.
            </Text>
          </View>
        </View>
      )}

      {budgetUsagePercentage > 80 && budgetUsagePercentage <= 100 && (
        <View style={[styles.alertCardWarning, { backgroundColor: colors.primaryLight + "40", borderColor: colors.primary }]}>
          <Text style={styles.alertIcon}>⚠️</Text>
          <View style={styles.alertContent}>
            <Text style={[styles.alertTitle, { color: colors.primaryDark }]}>Budget presque épuisé</Text>
            <Text style={[styles.alertText, { color: colors.primaryDark }]}>
              Vous avez utilisé {budgetUsagePercentage.toFixed(1)}% de votre budget.
              Il ne vous reste que {remainingBudget}€.
            </Text>
          </View>
        </View>
      )}
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
  },
  errorContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  errorText: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    borderRadius: 16,
    padding: 16,
    flex: 1,
    minWidth: "47%",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  statPercentage: {
    fontSize: 12,
    marginTop: 4,
  },
  statSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  progressCard: {
    borderRadius: 20,
    padding: 24,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: "700",
  },
  progressBarContainer: {
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 6,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabel: {
    fontSize: 12,
  },
  detailsRow: {
    flexDirection: "row",
    gap: 12,
  },
  detailCard: {
    borderRadius: 20,
    padding: 20,
    flex: 1,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
  },
  detailCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  distributionList: {
    gap: 16,
  },
  distributionItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  distributionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  distributionContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  distributionLabel: {
    fontSize: 14,
  },
  distributionValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  topExpensesList: {
    gap: 12,
  },
  topExpenseItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  topExpenseRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  topExpenseRankText: {
    fontSize: 12,
    fontWeight: "700",
  },
  topExpenseContent: {
    flex: 1,
    marginRight: 8,
  },
  topExpenseName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  topExpenseDescription: {
    fontSize: 11,
  },
  topExpensePrice: {
    fontSize: 15,
    fontWeight: "700",
  },
  emptyText: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 20,
  },
  alertCardError: {
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    borderWidth: 1,
  },
  alertCardWarning: {
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    borderWidth: 1,
  },
  alertIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  alertText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
