import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import TripParticipants from "@/components/trip/TripParticipants";
import { useTrip } from "@/src/contexts/TripContext";
import { Trip } from "@/src/types/trip";

export default function ParticipantsScreen() {
  const { selectedTrip } = useTrip();
  const [trip, setTrip] = useState<Trip | null>(null);

  useEffect(() => {
    console.log("🔄 useEffect - selectedTrip:", selectedTrip?.title);
    if (selectedTrip) {
      console.log("✅ useEffect - selectedTrip trouvé");
      setTrip(selectedTrip);
    } else {
      console.log(
        "⚠️ useEffect - selectedTrip est undefined, redirection vers l'écran principal"
      );
      router.replace("/(main)");
    }
  }, [selectedTrip]);

  const handleBackToTrips = () => {
    router.replace("/(main)");
  };

  if (!trip) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-lg text-gray-600">Voyage non trouvé</Text>
      </View>
    );
  }

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
        <Text className="text-xl font-bold text-gray-800">Participants</Text>
        <Text className="text-sm text-gray-500 mt-1">
          Gérez l'équipe de votre voyage
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        <TripParticipants
          tripId={trip.id}
          tripName={trip.title}
          currentUserId={trip.user_id}
        />
      </ScrollView>
    </View>
  );
}
