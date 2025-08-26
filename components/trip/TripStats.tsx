import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { supabase } from "../../src/lib/supabaseClient";

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

      // Récupérer les dépenses (sans les relations complexes pour l'instant)
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
      <View className="items-center p-10">
        <Text className="text-gray-600">Chargement des statistiques...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="bg-error-50 border-error-500 border-2 rounded-lg p-4">
        <Text className="text-error-600">Erreur: {error}</Text>
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
    <View className="gap-4">
      <Text className="text-lg font-bold text-gray-800 mb-2">
        Statistiques du voyage
      </Text>

      {/* Vue d'ensemble du budget */}
      <View className="flex-row flex-wrap gap-2">
        <View className="bg-white border-gray-200 border-2 rounded-lg p-4">
          <Text className="text-sm font-medium text-gray-600 mb-1">
            Budget total
          </Text>
          <Text className="text-lg font-bold text-gray-800 mb-1">
            {tripBudget}€
          </Text>
        </View>

        <View className="bg-white border-gray-200 border-2 rounded-lg p-4">
          <Text className="text-sm font-medium text-gray-600 mb-1">
            Dépensé
          </Text>
          <Text className="text-lg font-bold text-primary-600 mb-1">
            {totalCost}€
          </Text>
          <Text className="text-sm text-gray-500">
            {budgetUsagePercentage.toFixed(1)}% utilisé
          </Text>
        </View>

        <View className="bg-white border-gray-200 border-2 rounded-lg p-4">
          <Text className="text-sm font-medium text-gray-600 mb-1">
            Restant
          </Text>
          <Text
            className={`text-lg font-bold ${
              remainingBudget >= 0 ? "text-success-600" : "text-error-600"
            }`}
          >
            {remainingBudget}€
          </Text>
        </View>

        <View className="bg-white border-gray-200 border-2 rounded-lg p-4">
          <Text className="text-sm font-medium text-gray-600 mb-1">Total</Text>
          <Text className="text-lg font-bold text-primary-400 mb-1">
            {places.length + activities.length + expenses.length}
          </Text>
          <Text className="text-gray-500">éléments planifiés</Text>
        </View>
      </View>

      {/* Barre de progression du budget */}
      <View className="bg-white border-gray-200 border-2 rounded-lg p-4">
        <Text className="text-lg font-bold text-gray-800 mb-2">
          Utilisation du budget
        </Text>
        <View className="gap-2">
          <View className="flex-row justify-between items-center">
            <Text className="text-sm text-gray-600">Progression</Text>
            <Text className="text-sm text-gray-600">
              {budgetUsagePercentage.toFixed(1)}%
            </Text>
          </View>
          <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <View
              className={`h-2 bg-gray-200 rounded-full overflow-hidden ${
                budgetUsagePercentage > 100
                  ? "bg-error-500"
                  : budgetUsagePercentage > 80
                  ? "bg-primary-600"
                  : "bg-primary-500"
              }`}
            />
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-sm text-gray-500">0€</Text>
            <Text className="text-sm text-gray-500">{tripBudget}€</Text>
          </View>
        </View>
      </View>

      {/* Répartition des coûts */}
      <View className="flex-row gap-2">
        <View className="bg-white border-gray-200 border-2 rounded-lg p-4">
          <Text className="text-lg font-bold text-gray-800 mb-2">
            Répartition des coûts
          </Text>
          <View className="gap-2">
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-600">Destinations</Text>
              <View className="flex-row items-center gap-2">
                <View className="w-2 h-2 rounded-full bg-primary-500" />
                <Text className="text-gray-800">{totalPlacesCost}€</Text>
              </View>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Activités</Text>
              <View className="flex-row items-center gap-2">
                <View className="w-2 h-2 rounded-full bg-primary-400" />
                <Text className="text-gray-800">{totalActivitiesCost}€</Text>
              </View>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Dépenses</Text>
              <View className="flex-row items-center gap-2">
                <View className="w-2 h-2 rounded-full bg-primary-300" />
                <Text className="text-gray-800">{totalExpensesCost}€</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="bg-white border-gray-200 border-2 rounded-lg p-4">
          <Text className="text-lg font-bold text-gray-800 mb-2">
            Top 5 des dépenses
          </Text>
          <View className="gap-1">
            {topExpenses.map((expense, index) => {
              const name = "name" in expense ? expense.name : expense.title;
              const price = "price" in expense ? expense.price : expense.amount;

              return (
                <View key={expense.id} className="gap-1">
                  <View className="flex-row justify-between items-start">
                    <Text className="text-sm text-gray-600" numberOfLines={1}>
                      {index + 1}. {name}
                    </Text>
                    <Text className="text-sm text-gray-600">{price}€</Text>
                  </View>
                  {"paid_by_user_id" in expense && (
                    <Text className="text-sm text-gray-500 ml-6">
                      {getExpenseDescription(expense)}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Alertes */}
      {budgetUsagePercentage > 100 && (
        <View className="bg-error-50 border-error-500 border-2 rounded-lg p-4">
          <View className="flex-row items-start">
            <Text className="text-2xl mr-2 mt-1">⚠️</Text>
            <View className="flex-1">
              <Text className="text-lg font-bold text-error-800 mb-2">
                Budget dépassé !
              </Text>
              <Text className="text-sm text-error-700">
                Vous avez dépassé votre budget de {Math.abs(remainingBudget)}€.
                Considérez ajuster vos plans ou augmenter votre budget.
              </Text>
            </View>
          </View>
        </View>
      )}

      {budgetUsagePercentage > 80 && budgetUsagePercentage <= 100 && (
        <View className="bg-primary-50 border-primary-200 border-2 rounded-lg p-4">
          <View className="flex-row items-start">
            <Text className="text-2xl mr-2 mt-1">⚠️</Text>
            <View className="flex-1">
              <Text className="text-lg font-bold text-primary-800 mb-2">
                Budget presque épuisé
              </Text>
              <Text className="text-sm text-primary-700">
                Vous avez utilisé {budgetUsagePercentage.toFixed(1)}% de votre
                budget. Il ne vous reste que {remainingBudget}€.
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
