import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { tripService } from "../src/services/tripService";
import { Trip } from "../src/types/trip";

interface TripListProps {
  onTripSelect: (trip: Trip) => void;
}

export default function TripList({ onTripSelect }: TripListProps) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setIsLoading(true);
      const data = await tripService.getUserTrips();
      setTrips(data);
      setError("");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateTripPage = () => {
    Alert.alert("Info", "Page de création de voyage à implémenter");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center py-12">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="bg-red-50 border border-red-500 rounded-lg p-4 m-4">
        <Text className="text-red-600 text-center text-sm">
          Erreur: {error}
        </Text>
      </View>
    );
  }

  if (trips.length === 0) {
    return (
      <View className="items-center py-12 px-4">
        <Text className="text-5xl mb-4">🌏</Text>
        <Text className="text-xl font-semibold text-gray-800 mb-2 text-center">
          Aucun voyage créé
        </Text>
        <Text className="text-base text-gray-500 mb-8 text-center">
          Commencez par créer votre premier voyage !
        </Text>
        <TouchableOpacity
          className="bg-orange-500 px-8 py-4 rounded-lg"
          onPress={openCreateTripPage}
        >
          <Text className="text-white font-medium text-base">
            Créer mon premier voyage
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-semibold text-gray-800">Mes voyages</Text>
        <TouchableOpacity
          className="bg-orange-500 px-4 py-2 rounded-lg"
          onPress={openCreateTripPage}
        >
          <Text className="text-white font-medium text-sm">
            + Nouveau voyage
          </Text>
        </TouchableOpacity>
      </View>

      <View className="gap-4">
        {trips.map((trip) => (
          <TouchableOpacity
            key={trip.id}
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
            onPress={() => {
              console.log(
                "🔄 TripList - Clic sur voyage:",
                trip.title,
                "ID:",
                trip.id
              );
              onTripSelect(trip);
            }}
          >
            <View className="flex-row justify-between items-start mb-4">
              <View className="w-10 h-10 bg-orange-500 rounded-full justify-center items-center">
                <Text className="text-base">✈️</Text>
              </View>
              <View className="bg-gray-100 px-3 py-1 rounded-lg">
                <Text className="text-xs text-gray-500">
                  {calculateDuration(trip.start_date, trip.end_date)} jours
                </Text>
              </View>
            </View>

            <Text
              className="text-lg font-semibold text-gray-800 mb-2"
              numberOfLines={2}
            >
              {trip.title}
            </Text>

            {trip.description && (
              <Text className="text-sm text-gray-500 mb-4" numberOfLines={2}>
                {trip.description}
              </Text>
            )}

            <View className="gap-2 mb-4">
              <View className="flex-row items-center">
                <Text className="mr-2 text-sm">📅</Text>
                <Text className="text-sm text-gray-500">
                  {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text className="mr-2 text-sm">💰</Text>
                <Text className="text-sm text-gray-500">
                  Budget: {trip.budget}€
                </Text>
              </View>
            </View>

            <View className="border-t border-gray-100 pt-4">
              <Text className="text-xs text-orange-500 font-medium">
                Cliquez pour voir les détails →
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
