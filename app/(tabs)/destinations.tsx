import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import TripDestinations from "@/components/trip/TripDestinations";
import { useTrip } from "@/src/contexts/TripContext";
import { Trip } from "@/src/types/trip";
import { Destination } from "@/src/types/destination";
import { destinationsService } from "@/src/services/destinationsService";

export default function DestinationsScreen() {
  const { selectedTrip } = useTrip();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("🔄 useEffect - selectedTrip:", selectedTrip?.title);
    if (selectedTrip) {
      console.log(
        "✅ useEffect - selectedTrip trouvé, chargement des destinations"
      );
      setTrip(selectedTrip);
      fetchDestinations(selectedTrip.id);
    } else {
      console.log(
        "⚠️ useEffect - selectedTrip est undefined, redirection vers l'écran principal"
      );
      router.replace("/(main)");
    }
  }, [selectedTrip]);

  const fetchDestinations = async (tripId: string) => {
    try {
      setIsLoading(true);
      console.log("🔄 fetchDestinations - Début pour le voyage:", tripId);
      const destinations = await destinationsService.fetchDestinations(tripId);
      setDestinations(destinations);
      console.log("✅ fetchDestinations - Succès:", destinations);
      setError("");
    } catch (error: any) {
      console.error("❌ fetchDestinations - Erreur:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToTrips = () => {
    router.replace("/(main)");
  };

  if (isLoading) {
    console.log("🔄 Rendu - isLoading = true, affichage du loading");
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-lg text-gray-600">Chargement...</Text>
      </View>
    );
  }

  if (!trip) {
    console.log("🔄 Rendu - trip = null, affichage 'Voyage non trouvé'");
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-lg text-gray-600">Voyage non trouvé</Text>
      </View>
    );
  }

  console.log(
    "🔄 Rendu - Affichage du contenu principal, trip:",
    trip?.title,
    "destinations:",
    destinations.length
  );
  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white pt-12 pb-4 px-5 border-b border-gray-200">
        <View className="flex-row items-center mb-3">
          <TouchableOpacity
            className="p-2 mr-4 rounded-lg bg-gray-100"
            onPress={handleBackToTrips}
          >
            <Text className="text-orange-600 text-base font-medium">
              ← Retour aux voyages
            </Text>
          </TouchableOpacity>
        </View>
        <Text className="text-xl font-bold text-gray-800">Destinations</Text>
        <Text className="text-sm text-gray-500 mt-1">
          Gérez les lieux et activités de votre voyage
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        <TripDestinations
          trip={trip}
          destinations={destinations}
          isLoading={isLoading}
          error={error}
          onDestinationsUpdate={() => fetchDestinations(trip.id)}
        />
      </ScrollView>
    </View>
  );
}
