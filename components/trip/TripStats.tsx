import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { supabase } from "../../src/lib/supabaseClient";
import { useTheme } from "../../src/contexts/ThemeContext";
import { AlertTriangle, Trophy, Medal, Award } from "lucide-react-native";

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
  const { colors, theme } = useTheme();

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
      <View className="p-10 items-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          className="mt-3 text-sm"
          style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
        >
          Chargement des statistiques...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        className="border rounded-xl p-4"
        style={{
          backgroundColor: colors.error + "20",
          borderColor: colors.error,
        }}
      >
        <Text
          className="text-sm"
          style={{ color: colors.error, fontFamily: "Ubuntu-Regular" }}
        >
          Erreur: {error}
        </Text>
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
    <View className="gap-5">
      {/* Titre de section */}
      <Text
        className="text-[28px] text-center font-bold" 
        style={{ 
          color: colors.text, 
          fontFamily: "Ubuntu-Bold",
          letterSpacing: -0.5,
        }}
      >
        Statistiques du voyage
      </Text>

      {/* Cartes de statistiques principales */}
      <View className="gap-4">
        {/* Première rangée */}
        <View className="flex-row gap-4">
          <View
            className="rounded-2xl p-4 flex-1 border"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text
              className="text-xs font-semibold mb-2 uppercase tracking-wide"
              style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
            >
              Budget total
            </Text>
            <Text
              className="text-2xl font-bold"
              style={{ color: colors.text, fontFamily: "Ubuntu-Bold", letterSpacing: -0.5 }}
            >
              {tripBudget}€
            </Text>
          </View>

          <View
            className="rounded-2xl p-4 flex-1 border-2"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.primary,
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text
              className="text-xs font-semibold mb-2 uppercase tracking-wide"
              style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
            >
              Dépensé
            </Text>
            <Text
              className="text-2xl font-bold"
              style={{ color: colors.primary, fontFamily: "Ubuntu-Bold", letterSpacing: -0.5 }}
            >
              {totalCost}€
            </Text>
            <Text
              className="text-xs mt-1"
              style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
            >
              {budgetUsagePercentage.toFixed(1)}% utilisé
            </Text>
          </View>
        </View>

        {/* Deuxième rangée */}
        <View className="flex-row gap-4">
          <View
            className="rounded-2xl p-4 flex-1 border"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text
              className="text-xs font-semibold mb-2 uppercase tracking-wide"
              style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
            >
              Restant
            </Text>
            <Text
              className="text-2xl font-bold"
              style={{
                color: remainingBudget >= 0 ? colors.success : colors.error,
                fontFamily: "Ubuntu-Bold",
                letterSpacing: -0.5,
              }}
            >
              {remainingBudget}€
            </Text>
          </View>

          <View
            className="rounded-2xl p-4 flex-1 border"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text
              className="text-xs font-semibold mb-2 uppercase tracking-wide"
              style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
            >
              Éléments
            </Text>
            <Text
              className="text-2xl font-bold"
              style={{ color: colors.text, fontFamily: "Ubuntu-Bold", letterSpacing: -0.5 }}
            >
              {places.length + activities.length + expenses.length}
            </Text>
            <Text
              className="text-xs mt-1"
              style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
            >
              planifiés
            </Text>
          </View>
        </View>
      </View>

      {/* Barre de progression du budget */}
      <View
        className="rounded-[20px] p-6 border"
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
        <View className="flex-row justify-between items-center mb-4">
          <Text
            className="text-lg font-bold"
            style={{ color: colors.text, fontFamily: "Ubuntu-Bold" }}
          >
            Utilisation du budget
          </Text>
          <Text
            className="text-lg font-bold"
            style={{ color: colors.primary, fontFamily: "Ubuntu-Bold" }}
          >
            {budgetUsagePercentage.toFixed(1)}%
          </Text>
        </View>
        <View
          className="h-3.5 rounded-md overflow-hidden mb-3"
          style={{ backgroundColor: colors.border }}
        >
          <View
            className="h-full rounded-md"
            style={{
              width: `${Math.min(budgetUsagePercentage, 100)}%`,
              backgroundColor:
                budgetUsagePercentage > 100
                  ? colors.error
                  : budgetUsagePercentage > 80
                    ? colors.primaryDark
                    : colors.primary,
            }}
          />
        </View>
        <View className="flex-row justify-between items-center">
          <Text
            className="text-xs"
            style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
          >
            0€
          </Text>
          <Text
            className="text-xs"
            style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
          >
            {tripBudget}€
          </Text>
        </View>
      </View>

      {/* Répartition et Top dépenses */}
      <View className="gap-5">
        <View
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
          <Text
            className="text-lg font-bold mb-4"
            style={{ color: colors.text, fontFamily: "Ubuntu-Bold" }}
          >
            Répartition
          </Text>
          <View className="gap-4">
            <View className="flex-row items-center">
              <View
                className="w-3 h-3 rounded-full mr-3"
                style={{ backgroundColor: colors.primary }}
              />
              <View className="flex-1 flex-row justify-between items-center">
                <Text
                  className="text-sm"
                  style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
                >
                  Destinations
                </Text>
                <Text
                  className="text-[15px] font-semibold"
                  style={{ color: colors.text, fontFamily: "Ubuntu-Medium" }}
                >
                  {totalPlacesCost}€
                </Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <View
                className="w-3 h-3 rounded-full mr-3"
                style={{ backgroundColor: "#fb923c" }}
              />
              <View className="flex-1 flex-row justify-between items-center">
                <Text
                  className="text-sm"
                  style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
                >
                  Activités
                </Text>
                <Text
                  className="text-[15px] font-semibold"
                  style={{ color: colors.text, fontFamily: "Ubuntu-Medium" }}
                >
                  {totalActivitiesCost}€
                </Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <View
                className="w-3 h-3 rounded-full mr-3"
                style={{ backgroundColor: "#fdba74" }}
              />
              <View className="flex-1 flex-row justify-between items-center">
                <Text
                  className="text-sm"
                  style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
                >
                  Dépenses
                </Text>
                <Text
                  className="text-[15px] font-semibold"
                  style={{ color: colors.text, fontFamily: "Ubuntu-Medium" }}
                >
                  {totalExpensesCost}€
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View
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
          <View className="flex-row items-center mb-5">
            <View
              className="w-10 h-10 rounded-full justify-center items-center mr-3"
              style={{ backgroundColor: colors.primary + "20" }}
            >
              <Trophy size={20} color={colors.primary} />
            </View>
            <Text
              className="text-lg font-bold"
              style={{ color: colors.text, fontFamily: "Ubuntu-Bold" }}
            >
              Top 5 dépenses
            </Text>
          </View>
          <View className="gap-1">
            {topExpenses.length > 0 ? (
              topExpenses.map((expense, index) => {
                const name = "name" in expense ? expense.name : expense.title;
                const price = "price" in expense ? expense.price : expense.amount;
                const maxPrice = topExpenses[0] ? ("price" in topExpenses[0] ? topExpenses[0].price : topExpenses[0].amount) : 1;
                const percentage = (price / maxPrice) * 100;

                // Couleurs et icônes pour les médailles (adaptées au thème)
                const getRankStyle = (rank: number) => {
                  const isDark = theme === "dark";
                  switch (rank) {
                    case 0: // Or
                      return {
                        bgColor: isDark ? "#78350F" : "#FEF3C7",
                        iconColor: isDark ? "#FBBF24" : "#D97706",
                        borderColor: isDark ? "#B45309" : "#F59E0B",
                        iconBgColor: isDark ? "#292524" : "white",
                        icon: Trophy,
                      };
                    case 1: // Argent
                      return {
                        bgColor: isDark ? "#374151" : "#F3F4F6",
                        iconColor: isDark ? "#D1D5DB" : "#6B7280",
                        borderColor: isDark ? "#6B7280" : "#9CA3AF",
                        iconBgColor: isDark ? "#1F2937" : "white",
                        icon: Medal,
                      };
                    case 2: // Bronze
                      return {
                        bgColor: isDark ? "#7C2D12" : "#FED7AA",
                        iconColor: isDark ? "#FB923C" : "#C2410C",
                        borderColor: isDark ? "#C2410C" : "#EA580C",
                        iconBgColor: isDark ? "#292524" : "white",
                        icon: Award,
                      };
                    default:
                      return {
                        bgColor: colors.background,
                        iconColor: colors.textSecondary,
                        borderColor: colors.border,
                        iconBgColor: colors.card,
                        icon: null,
                      };
                  }
                };

                const rankStyle = getRankStyle(index);
                const IconComponent = rankStyle.icon;

                return (
                  <View
                    key={expense.id}
                    className="rounded-xl p-3 mb-2"
                    style={{
                      backgroundColor: index < 3 ? rankStyle.bgColor : colors.background,
                      borderWidth: index < 3 ? 1 : 0,
                      borderColor: rankStyle.borderColor,
                    }}
                  >
                    <View className="flex-row items-center">
                      {/* Rang / Médaille */}
                      <View
                        className="w-9 h-9 rounded-full justify-center items-center mr-3"
                        style={{
                          backgroundColor: rankStyle.iconBgColor,
                          shadowColor: index < 3 ? rankStyle.iconColor : "transparent",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.2,
                          shadowRadius: 4,
                          elevation: index < 3 ? 2 : 0,
                        }}
                      >
                        {IconComponent ? (
                          <IconComponent size={18} color={rankStyle.iconColor} />
                        ) : (
                          <Text
                            className="text-sm font-bold"
                            style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Bold" }}
                          >
                            {index + 1}
                          </Text>
                        )}
                      </View>

                      {/* Nom et description */}
                      <View className="flex-1 mr-3">
                        <Text
                          className="text-[15px] font-semibold"
                          style={{ color: colors.text, fontFamily: "Ubuntu-Medium" }}
                          numberOfLines={1}
                        >
                          {name}
                        </Text>
                        {"paid_by_user_id" in expense && (
                          <Text
                            className="text-[11px] mt-0.5"
                            style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
                            numberOfLines={1}
                          >
                            {getExpenseDescription(expense)}
                          </Text>
                        )}
                      </View>

                      {/* Prix */}
                      <View className="items-end">
                        <Text
                          className="text-base font-bold"
                          style={{
                            color: index < 3 ? rankStyle.iconColor : colors.primary,
                            fontFamily: "Ubuntu-Bold",
                          }}
                        >
                          {price}€
                        </Text>
                      </View>
                    </View>

                    {/* Barre de progression */}
                    <View
                      className="h-1.5 rounded-full mt-3 overflow-hidden"
                      style={{
                        backgroundColor: index < 3
                          ? (theme === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)")
                          : colors.border,
                      }}
                    >
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: index < 3 ? rankStyle.iconColor : colors.primary,
                        }}
                      />
                    </View>
                  </View>
                );
              })
            ) : (
              <View className="py-8 items-center">
                <View
                  className="w-16 h-16 rounded-full justify-center items-center mb-3"
                  style={{ backgroundColor: colors.background }}
                >
                  <Trophy size={28} color={colors.textSecondary} />
                </View>
                <Text
                  className="text-sm text-center"
                  style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
                >
                  Aucune dépense enregistrée
                </Text>
                <Text
                  className="text-xs text-center mt-1"
                  style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
                >
                  Ajoutez des dépenses pour voir le classement
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Alertes */}
      {budgetUsagePercentage > 100 && (
        <View
          className="rounded-2xl p-5 flex-row border"
          style={{
            backgroundColor: colors.error + "20",
            borderColor: colors.error,
          }}
        >
          <AlertTriangle size={20} color={colors.error} style={{ marginRight: 12, marginTop: 2 }} />
          <View className="flex-1">
            <Text
              className="text-base font-bold mb-1.5"
              style={{ color: colors.error, fontFamily: "Ubuntu-Bold" }}
            >
              Budget dépassé !
            </Text>
            <Text
              className="text-sm leading-5"
              style={{ color: colors.error, fontFamily: "Ubuntu-Regular" }}
            >
              Vous avez dépassé votre budget de {Math.abs(remainingBudget)}€.
              Considérez ajuster vos plans ou augmenter votre budget.
            </Text>
          </View>
        </View>
      )}

      {budgetUsagePercentage > 80 && budgetUsagePercentage <= 100 && (
        <View
          className="rounded-2xl p-5 flex-row border"
          style={{
            backgroundColor: colors.primaryLight + "40",
            borderColor: colors.primary,
          }}
        >
          <AlertTriangle size={20} color={colors.primaryDark} style={{ marginRight: 12, marginTop: 2 }} />
          <View className="flex-1">
            <Text
              className="text-base font-bold mb-1.5"
              style={{ color: colors.primaryDark, fontFamily: "Ubuntu-Bold" }}
            >
              Budget presque épuisé
            </Text>
            <Text
              className="text-sm leading-5"
              style={{ color: colors.primaryDark, fontFamily: "Ubuntu-Regular" }}
            >
              Vous avez utilisé {budgetUsagePercentage.toFixed(1)}% de votre budget.
              Il ne vous reste que {remainingBudget}€.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
