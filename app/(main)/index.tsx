import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import TripList from "@/components/TripList";
import AuthScreen from "@/components/AuthScreen";
import { useAuth } from "@/src/contexts/AuthContext";
import { useTrip } from "@/src/contexts/TripContext";
import { Trip } from "@/src/types/trip";

export default function MainScreen() {
  const { user, loading, signOut } = useAuth();
  const { setSelectedTrip } = useTrip();

  const handleTripSelect = (trip: Trip) => {
    console.log(
      "🔄 MainScreen - handleTripSelect appelé avec:",
      trip.title,
      "ID:",
      trip.id
    );
    // Sauvegarder le voyage dans le contexte et naviguer
    setSelectedTrip(trip);
    router.replace("/(tabs)");
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-lg text-gray-600">Chargement...</Text>
      </View>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="p-5 pt-10 bg-white border-b border-gray-200">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-gray-800 mb-2">
              TripMate
            </Text>
            <Text className="text-base text-gray-500 mb-2">
              Gérez vos voyages simplement
            </Text>
            <Text className="text-sm text-orange-600 italic">
              Connecté en tant que {user.email}
            </Text>
          </View>
          <TouchableOpacity
            className="bg-gray-200 px-4 py-2 rounded-lg"
            onPress={handleSignOut}
          >
            <Text className="text-gray-700 text-sm font-medium">
              Déconnexion
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TripList onTripSelect={handleTripSelect} />
    </View>
  );
}
