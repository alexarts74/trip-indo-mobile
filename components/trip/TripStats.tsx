import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { supabase } from "../../src/lib/supabaseClient";
import { useTheme } from "../../src/contexts/ThemeContext";
import { AlertTriangle } from "lucide-react-native";

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
    <View className="gap-6" style={{ width: "100%" }}>
      {/* Titre de section */}
      <Text
        className="text-base font-bold"
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
        style={{ 
          color: colors.text, 
          fontFamily: "Ubuntu-Bold",
          flexShrink: 1,
        }}
      >
        Statistiques du voyage
      </Text>

      {/* Cartes de statistiques principales */}
      <View className="gap-3">
        {/* Première rangée */}
        <View className="flex-row gap-3">
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
        <View className="flex-row gap-3">
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
          className="h-3 rounded-md overflow-hidden mb-3"
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
        <View className="flex-row justify-between">
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
      <View className="gap-4">
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
          <Text
            className="text-lg font-bold mb-4"
            style={{ color: colors.text, fontFamily: "Ubuntu-Bold" }}
          >
            Top 5 dépenses
          </Text>
          <View className="gap-3">
            {topExpenses.length > 0 ? (
              topExpenses.map((expense, index) => {
                const name = "name" in expense ? expense.name : expense.title;
                const price = "price" in expense ? expense.price : expense.amount;

                return (
                  <View key={expense.id} className="flex-row items-center py-2">
                    <View
                      className="w-7 h-7 rounded-full justify-center items-center mr-3"
                      style={{ backgroundColor: colors.card }}
                    >
                      <Text
                        className="text-xs font-bold"
                        style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Bold" }}
                      >
                        {index + 1}
                      </Text>
                    </View>
                    <View className="flex-1 mr-2">
                      <Text
                        className="text-sm font-semibold mb-0.5"
                        style={{ color: colors.text, fontFamily: "Ubuntu-Medium" }}
                        numberOfLines={1}
                      >
                        {name}
                      </Text>
                      {"paid_by_user_id" in expense && (
                        <Text
                          className="text-[11px]"
                          style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
                          numberOfLines={1}
                        >
                          {getExpenseDescription(expense)}
                        </Text>
                      )}
                    </View>
                    <Text
                      className="text-[15px] font-bold"
                      style={{ color: colors.primary, fontFamily: "Ubuntu-Bold" }}
                    >
                      {price}€
                    </Text>
                  </View>
                );
              })
            ) : (
              <Text
                className="text-sm italic text-center py-5"
                style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
              >
                Aucune dépense
              </Text>
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
