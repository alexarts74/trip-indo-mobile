import React from "react";
import { View, Text } from "react-native";
import { Trip } from "../../src/types/trip";
import { Destination } from "../../src/types/destination";
import { useTheme } from "../../src/contexts/ThemeContext";
import TripStats from "./TripStats";
import { Calendar, Clock, Wallet, Map, Users } from "lucide-react-native";

interface TripOverviewProps {
  trip: Trip;
  destinations: Destination[];
  isLoading: boolean;
  error: string;
}

export default function TripOverview({
  trip,
  destinations,
  isLoading,
  error,
}: TripOverviewProps) {
  const { colors } = useTheme();
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
    
    if (diffDays < 30) {
      return `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} mois`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      if (remainingMonths > 0) {
        return `${years} an${years > 1 ? 's' : ''} ${remainingMonths} mois`;
      }
      return `${years} an${years > 1 ? 's' : ''}`;
    }
  };

  return (
    <View className="gap-5">
      {/* Carte principale du voyage */}
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
        <View className="flex-row justify-between items-start mb-6">
          <View className="flex-1 mr-4">
            <Text
              className="text-[28px] font-bold mb-2"
              style={{ color: colors.text, fontFamily: "Ubuntu-Bold", letterSpacing: -0.5 }}
            >
              {trip.title}
            </Text>
            {trip.description && (
              <Text
                className="text-[15px] leading-[22px]"
                style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
                numberOfLines={2}
              >
                {trip.description}
              </Text>
            )}
          </View>
          <View
            className="rounded-2xl px-4 py-3 items-center justify-center min-w-[80px]"
            style={{
              backgroundColor: colors.primary,
              shadowColor: "#f97316",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text
              className="text-white text-xl font-bold"
              style={{ fontFamily: "Ubuntu-Bold" }}
            >
              {destinations.length}
            </Text>
            <Text
              className="text-white text-[11px] font-medium mt-0.5 opacity-90"
              style={{ fontFamily: "Ubuntu-Medium" }}
            >
              {destinations.length > 1 ? "destinations" : "destination"}
            </Text>
          </View>
        </View>

        <View className="gap-4">
          <View className="flex-row items-start">
            <View
              className="w-10 h-10 rounded-full justify-center items-center mr-3"
              style={{ backgroundColor: colors.primaryLight }}
            >
              <Calendar size={18} color={colors.primary} />
            </View>
            <View className="flex-1 pt-0.5">
              <Text
                className="text-xs font-semibold mb-1 uppercase tracking-wide"
                style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
              >
                Dates
              </Text>
              <Text
                className="text-[15px] font-medium"
                style={{ color: colors.text, fontFamily: "Ubuntu-Medium" }}
              >
                {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
              </Text>
            </View>
          </View>

          <View className="flex-row items-start">
            <View
              className="w-10 h-10 rounded-full justify-center items-center mr-3"
              style={{ backgroundColor: colors.primaryLight }}
            >
              <Clock size={18} color={colors.primary} />
            </View>
            <View className="flex-1 pt-0.5">
              <Text
                className="text-xs font-semibold mb-1 uppercase tracking-wide"
                style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
              >
                Durée
              </Text>
              <Text
                className="text-[15px] font-medium"
                style={{ color: colors.text, fontFamily: "Ubuntu-Medium" }}
              >
                {calculateDuration(trip.start_date, trip.end_date)}
              </Text>
            </View>
          </View>

          <View className="flex-row items-start">
            <View
              className="w-10 h-10 rounded-full justify-center items-center mr-3"
              style={{ backgroundColor: colors.primaryLight }}
            >
              <Wallet size={18} color={colors.primary} />
            </View>
            <View className="flex-1 pt-0.5">
              <Text
                className="text-xs font-semibold mb-1 uppercase tracking-wide"
                style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
              >
                Budget
              </Text>
              <Text
                className="text-[15px] font-medium"
                style={{ color: colors.text, fontFamily: "Ubuntu-Medium" }}
              >
                {trip.budget}€
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Séparateur visuel élégant avec design sophistiqué */}
      <View>
        <View className="flex-row items-center">
          <View 
            className="flex-1 h-[1.5px]" 
            style={{ 
              backgroundColor: colors.border + "40",
            }}
          />
          <View className="mx-6 items-center justify-center">
            {/* Cercle extérieur avec bordure et effet de profondeur */}
            <View 
              className="w-6 h-6 rounded-full border-2 items-center justify-center" 
              style={{ 
                backgroundColor: colors.primary + "20",
                borderColor: colors.primary + "50",
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              {/* Cercle intérieur avec glow */}
              <View 
                className="w-3 h-3 rounded-full" 
                style={{ 
                  backgroundColor: colors.primary,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.6,
                  shadowRadius: 6,
                  elevation: 4,
                }}
              />
            </View>
          </View>
          <View 
            className="flex-1 h-[1.5px]" 
            style={{ 
              backgroundColor: colors.border + "40",
            }}
          />
        </View>
      </View>

      {/* Statistiques du voyage */}
      <TripStats tripId={trip.id} tripBudget={trip.budget} />

      {/* Prochaines étapes */}
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
        <Text
          className="text-xl font-bold mb-5"
          style={{ color: colors.text, fontFamily: "Ubuntu-Bold", letterSpacing: -0.3 }}
        >
          Prochaines étapes
        </Text>
        <View className="gap-5">
          <View className="flex-row items-start">
            <View
              className="w-11 h-11 rounded-full justify-center items-center mr-4"
              style={{ backgroundColor: colors.card }}
            >
              <Map size={20} color={colors.primary} />
            </View>
            <View className="flex-1 pt-1">
              <Text
                className="text-base font-semibold mb-1.5"
                style={{ color: colors.text, fontFamily: "Ubuntu-Medium" }}
              >
                Ajouter des destinations
              </Text>
              <Text
                className="text-sm leading-5"
                style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
              >
                Commencez par planifier vos lieux de visite
              </Text>
            </View>
          </View>

          <View className="flex-row items-start">
            <View
              className="w-11 h-11 rounded-full justify-center items-center mr-4"
              style={{ backgroundColor: colors.card }}
            >
              <Users size={20} color={colors.primary} />
            </View>
            <View className="flex-1 pt-1">
              <Text
                className="text-base font-semibold mb-1.5"
                style={{ color: colors.text, fontFamily: "Ubuntu-Medium" }}
              >
                Inviter des participants
              </Text>
              <Text
                className="text-sm leading-5"
                style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
              >
                Partagez votre voyage avec des amis
              </Text>
            </View>
          </View>

          <View className="flex-row items-start">
            <View
              className="w-11 h-11 rounded-full justify-center items-center mr-4"
              style={{ backgroundColor: colors.card }}
            >
              <Wallet size={20} color={colors.primary} />
            </View>
            <View className="flex-1 pt-1">
              <Text
                className="text-base font-semibold mb-1.5"
                style={{ color: colors.text, fontFamily: "Ubuntu-Medium" }}
              >
                Gérer les dépenses
              </Text>
              <Text
                className="text-sm leading-5"
                style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
              >
                Suivez vos dépenses et remboursements
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
