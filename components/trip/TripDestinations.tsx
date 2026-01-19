import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Trip } from "../../src/types/trip";
import { Destination } from "../../src/types/destination";
import { useTheme } from "../../src/contexts/ThemeContext";
import AddDestinationModal from "./AddDestinationModal";
import { Map, MapPin, Globe, Wallet } from "lucide-react-native";

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
  const { colors } = useTheme();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const handleAddDestination = () => {
    setIsAddModalOpen(true);
  };

  const handleDestinationAdded = () => {
    onDestinationsUpdate();
  };

  if (isLoading) {
    return (
      <View className="p-10 items-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          className="mt-3 text-sm"
          style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
        >
          Chargement des destinations...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        className="border rounded-2xl p-4"
        style={{
          backgroundColor: colors.error + "20",
          borderColor: colors.error,
        }}
      >
        <Text
          className="text-sm text-center"
          style={{ color: colors.error, fontFamily: "Ubuntu-Regular" }}
        >
          Erreur: {error}
        </Text>
      </View>
    );
  }

  if (destinations.length === 0) {
    return (
      <View className="items-center py-16 px-6">
        <Map size={64} color={colors.primary} />
        <Text
          className="text-2xl font-bold mb-2 text-center"
          style={{ color: colors.text, fontFamily: "Ubuntu-Bold" }}
        >
          Aucune destination ajoutée
        </Text>
        <Text
          className="text-[15px] mb-8 text-center"
          style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
        >
          Commencez par ajouter vos premières destinations !
        </Text>
        <TouchableOpacity
          className="px-8 py-3.5 rounded-xl"
          style={{
            backgroundColor: colors.primary,
            shadowColor: "#f97316",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}
          onPress={handleAddDestination}
          activeOpacity={0.8}
        >
          <Text
            className="text-white text-base font-semibold"
            style={{ fontFamily: "Ubuntu-Medium" }}
          >
            Ajouter ma première destination
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="gap-5">
      {/* En-tête des destinations */}
      <View
        className="rounded-[20px] p-6 flex-row justify-between items-start border"
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
        <View className="flex-1 mr-4">
          <Text
            className="text-2xl font-bold mb-2"
            style={{ color: colors.text, fontFamily: "Ubuntu-Bold", letterSpacing: -0.3 }}
          >
            Destinations du voyage
          </Text>
          <Text
            className="text-sm leading-5"
            style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
          >
            Gérez vos lieux de visite et leurs activités
          </Text>
        </View>
        <TouchableOpacity
          className="flex-row items-center px-4 py-3 rounded-xl"
          style={{
            backgroundColor: colors.primary,
            shadowColor: "#f97316",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
          }}
          onPress={handleAddDestination}
          activeOpacity={0.8}
        >
          <Text
            className="text-white text-lg font-bold mr-1.5"
            style={{ fontFamily: "Ubuntu-Bold" }}
          >
            +
          </Text>
          <Text
            className="text-white text-sm font-semibold"
            style={{ fontFamily: "Ubuntu-Medium" }}
          >
            Ajouter
          </Text>
        </TouchableOpacity>
      </View>

      {/* Liste des destinations */}
      <View className="gap-5">
        {destinations.map((destination) => (
          <View
            key={destination.id}
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
            <View className="gap-4">
              <View className="flex-row justify-between items-start">
                <View className="flex-1 mr-4">
                  <Text
                    className="text-2xl font-bold mb-2"
                    style={{ color: colors.text, fontFamily: "Ubuntu-Bold", letterSpacing: -0.3 }}
                  >
                    {destination.name}
                  </Text>
                  {destination.description && (
                    <Text
                      className="text-sm leading-5"
                      style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
                      numberOfLines={2}
                    >
                      {destination.description}
                    </Text>
                  )}
                </View>
                <View className="items-end">
                  <Text
                    className="text-2xl font-bold mb-1"
                    style={{ color: colors.text, fontFamily: "Ubuntu-Bold", letterSpacing: -0.5 }}
                  >
                    {destination.price || 0}€
                  </Text>
                  {destination.price && (
                    <Text
                      className="text-xs font-medium"
                      style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
                    >
                      {((destination.price / trip.budget) * 100).toFixed(1)}% du budget
                    </Text>
                  )}
                </View>
              </View>

              <View
                className="gap-3 pt-4 border-t"
                style={{ borderTopColor: colors.border }}
              >
                <View className="flex-row items-center">
                  <View
                    className="w-9 h-9 rounded-full justify-center items-center mr-3"
                    style={{ backgroundColor: colors.card }}
                  >
                    <MapPin size={16} color={colors.textSecondary} />
                  </View>
                  <Text
                    className="flex-1 text-sm font-medium"
                    style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
                    numberOfLines={1}
                  >
                    {destination.address || "Adresse non renseignée"}
                  </Text>
                </View>
                {destination.country && (
                  <View className="flex-row items-center">
                    <View
                      className="w-9 h-9 rounded-full justify-center items-center mr-3"
                      style={{ backgroundColor: colors.card }}
                    >
                      <Globe size={16} color={colors.textSecondary} />
                    </View>
                    <Text
                      className="flex-1 text-sm font-medium"
                      style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
                    >
                      {destination.country}
                    </Text>
                  </View>
                )}
                {destination.price && (
                  <View className="flex-row items-center">
                    <View
                      className="w-9 h-9 rounded-full justify-center items-center mr-3"
                      style={{ backgroundColor: colors.card }}
                    >
                      <Wallet size={16} color={colors.textSecondary} />
                    </View>
                    <Text
                      className="flex-1 text-sm font-medium"
                      style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
                    >
                      {destination.price}€
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Modal d'ajout de destination */}
      <AddDestinationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        tripId={trip.id}
        onDestinationAdded={handleDestinationAdded}
      />
    </View>
  );
}
