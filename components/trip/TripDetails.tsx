import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Trip } from "../../src/types/trip";
import { Destination } from "../../src/types/destination";
import TripOverview from "./TripOverview";
import TripDestinations from "./TripDestinations";
import TripExpenses from "./TripExpenses";
import TripParticipants from "./TripParticipants";

interface TripDetailsProps {
  trip: Trip;
  onBack: () => void;
}

type TabType = "overview" | "destinations" | "expenses" | "participants";

export default function TripDetails({ trip, onBack }: TripDetailsProps) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  useEffect(() => {
    fetchDestinations();
  }, [trip.id]);

  const fetchDestinations = async () => {
    try {
      // TODO: Implémenter l'appel au service
      setIsLoading(false);
    } catch (error: any) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  const tabs = [
    {
      id: "overview" as TabType,
      name: "Vue d'ensemble",
      icon: "📊",
    },
    {
      id: "destinations" as TabType,
      name: "Destinations",
      icon: "🗺️",
    },
    {
      id: "expenses" as TabType,
      name: "Dépenses",
      icon: "💰",
    },
    {
      id: "participants" as TabType,
      name: "Participants",
      icon: "👥",
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <TripOverview
            trip={trip}
            destinations={destinations}
            isLoading={isLoading}
            error={error}
          />
        );
      case "destinations":
        return (
          <TripDestinations
            trip={trip}
            destinations={destinations}
            isLoading={isLoading}
            error={error}
            onDestinationsUpdate={fetchDestinations}
          />
        );
      case "expenses":
        return <TripExpenses tripId={trip.id} tripName={trip.title} />;
      case "participants":
        return (
          <TripParticipants
            tripId={trip.id}
            tripName={trip.title}
            currentUserId={trip.user_id}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header avec bouton retour */}
      <View className="bg-white pt-12 pb-4 px-5 border-b border-gray-200 flex-row items-center">
        <TouchableOpacity
          className="p-2 mr-4 rounded-lg bg-gray-100"
          onPress={onBack}
        >
          <Text className="text-orange-600 text-base font-medium">
            ← Retour
          </Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800 flex-1">
          {trip.title}
        </Text>
      </View>

      {/* Navbar fixe */}
      <View className="bg-white border-b border-gray-200">
        <View className="flex-row">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              className={`flex-1 items-center py-4 border-b-2 ${
                activeTab === tab.id
                  ? "border-orange-500 bg-orange-50"
                  : "border-transparent"
              }`}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text className="text-lg mb-1">{tab.icon}</Text>
              <Text
                className={`text-xs font-medium text-center ${
                  activeTab === tab.id ? "text-orange-600" : "text-gray-500"
                }`}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Contenu de l'onglet actif */}
      <ScrollView
        className="flex-1 px-4 py-4"
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {renderTabContent()}
      </ScrollView>
    </View>
  );
}
