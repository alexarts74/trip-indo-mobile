import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Trip } from "../../src/types/trip";
import { Destination } from "../../src/types/destination";

interface TripDestinationsProps {
  trip: Trip;
  destinations: Destination[];
  isLoading: boolean;
  error: string;
  onDestinationsUpdate: () => void;
}

export default function TripDestinations({
  trip,
  destinations,
  isLoading,
  error,
  onDestinationsUpdate,
}: TripDestinationsProps) {
  const handleAddDestination = () => {
    // TODO: Implémenter l'ajout de destination
    console.log("Ajouter une destination");
  };

  if (isLoading) {
    return (
      <View className="items-center py-12">
        <Text className="text-base text-gray-600">
          Chargement des destinations...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="bg-red-50 border border-red-500 rounded-md p-4">
        <Text className="text-red-600 text-center text-sm">
          Erreur: {error}
        </Text>
      </View>
    );
  }

  if (destinations.length === 0) {
    return (
      <View className="items-center py-12 px-4">
        <Text className="text-5xl mb-4">🗺️</Text>
        <Text className="text-xl font-semibold text-gray-800 mb-2 text-center">
          Aucune destination ajoutée
        </Text>
        <Text className="text-base text-gray-500 mb-8 text-center">
          Commencez par ajouter vos premières destinations !
        </Text>
        <TouchableOpacity
          className="bg-orange-500 px-6 py-3 rounded-md"
          onPress={handleAddDestination}
        >
          <Text className="text-white font-medium text-base">
            Ajouter ma première destination
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="gap-4">
      {/* En-tête des destinations */}
      <View className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex-row justify-between items-start">
        <View className="flex-1 mr-4">
          <Text className="text-xl font-semibold text-gray-800 mb-2">
            Destinations du voyage
          </Text>
          <Text className="text-base text-gray-600">
            Gérez vos lieux de visite et leurs activités
          </Text>
        </View>
        <TouchableOpacity
          className="bg-orange-500 px-4 py-2 rounded-md"
          onPress={handleAddDestination}
        >
          <Text className="text-white font-medium text-sm">
            + Ajouter une destination
          </Text>
        </TouchableOpacity>
      </View>

      {/* Liste des destinations */}
      <View className="gap-4">
        {destinations.map((destination) => (
          <View
            key={destination.id}
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
          >
            <View className="flex-row justify-between items-start">
              <View className="flex-1 mr-4">
                <Text className="text-lg font-semibold text-gray-800 mb-2">
                  {destination.name}
                </Text>
                {destination.description && (
                  <Text className="text-sm text-gray-600 mb-4 leading-5">
                    {destination.description}
                  </Text>
                )}
                <View className="gap-2">
                  <Text className="text-sm text-gray-500">
                    📍 {destination.address}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    💰 {destination.price}€
                  </Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-xl font-bold text-gray-800 mb-1">
                  {destination.price}€
                </Text>
                <Text className="text-xs text-gray-500 text-right">
                  {((destination.price / trip.budget) * 100).toFixed(1)}% du
                  budget
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
