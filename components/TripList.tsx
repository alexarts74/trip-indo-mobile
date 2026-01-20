import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { tripService } from "../src/services/tripService";
import { Trip } from "../src/types/trip";
import { useTheme } from "../src/contexts/ThemeContext";
import { useAuth } from "../src/contexts/AuthContext";
import { supabase } from "../src/lib/supabaseClient";
import { ChevronRight, Plane, Globe, Calendar, Wallet } from "lucide-react-native";

interface TripListProps {
  onTripSelect: (trip: Trip) => void;
}

export default function TripList({ onTripSelect }: TripListProps) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const { colors } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    fetchTrips();

    // Subscription pour les changements de voyages en temps réel
    if (user?.id) {
      const channel = supabase
        .channel('trips-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'trips',
          },
          () => {
            // Rafraîchir les voyages quand il y a un changement
            fetchTripsQuietly();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'trip_participants',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            // Rafraîchir quand l'utilisateur est ajouté/retiré d'un voyage
            fetchTripsQuietly();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

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

  // Version silencieuse pour les updates en temps réel (sans loader)
  const fetchTripsQuietly = async () => {
    try {
      const data = await tripService.getUserTrips();
      setTrips(data);
    } catch (error: any) {
      console.error("Erreur rafraîchissement voyages:", error);
    }
  };

  // Pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await tripService.getUserTrips();
      setTrips(data);
      setError("");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const openCreateTripPage = () => {
    router.push("/modal");
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

  if (isLoading) {
    return (
      <View 
        className="flex-1 justify-center items-center py-12"
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View
        className="border rounded-xl p-4 m-4"
        style={{
          backgroundColor: colors.error + "20",
          borderColor: colors.error,
        }}
      >
        <Text
          className="text-center text-sm"
          style={{ color: colors.error, fontFamily: "Ubuntu-Regular" }}
        >
          Erreur: {error}
        </Text>
      </View>
    );
  }

  if (trips.length === 0) {
    return (
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: colors.background, marginTop: -60 }}
      >
        <Globe size={64} color={colors.primary} />
        <Text
          className="text-2xl font-bold mb-2 text-center mt-4"
          style={{ color: colors.text, fontFamily: "Ubuntu-Bold" }}
        >
          Aucun voyage créé
        </Text>
        <Text
          className="text-[15px] mb-8 text-center"
          style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
        >
          Commencez par créer votre premier voyage !
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
          onPress={openCreateTripPage}
          activeOpacity={0.8}
        >
          <Text
            className="text-white text-base font-semibold"
            style={{ fontFamily: "Ubuntu-Medium" }}
          >
            Créer mon premier voyage
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 px-4 pt-5 pb-4"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 16 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      <View className="flex-row justify-between items-center mb-5">
        <Text
          className="text-2xl font-bold"
          style={{ color: colors.text, fontFamily: "Ubuntu-Bold", letterSpacing: -0.3 }}
        >
          Mes voyages
        </Text>
        <TouchableOpacity
          className="px-4 py-2.5 rounded-xl"
          style={{
            backgroundColor: colors.primary,
            shadowColor: "#f97316",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
          }}
          onPress={openCreateTripPage}
          activeOpacity={0.8}
        >
          <Text
            className="text-white text-sm font-semibold"
            style={{ fontFamily: "Ubuntu-Medium" }}
          >
            + Nouveau
          </Text>
        </TouchableOpacity>
      </View>

      <View className="gap-4">
        {trips.map((trip, index) => (
          <TouchableOpacity
            key={trip.id}
            className={`rounded-2xl p-5 border mb-4 ${
              index === trips.length - 1 ? "mb-0" : ""
            }`}
            style={{
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}
            onPress={() => {
              console.log(
                "🔄 TripList - Clic sur voyage:",
                trip.title,
                "ID:",
                trip.id
              );
              onTripSelect(trip);
            }}
            activeOpacity={0.7}
          >
            <View className="flex-row justify-between items-start mb-4">
              <View
                className="w-12 h-12 rounded-full justify-center items-center border-2"
                style={{
                  backgroundColor: colors.primaryLight,
                  borderColor: colors.primary,
                }}
              >
                <Plane size={24} color={colors.primary} />
              </View>
              <View
                className="px-3 py-1.5 rounded-[20px] border"
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
                >
                  {calculateDuration(trip.start_date, trip.end_date)}
                </Text>
              </View>
            </View>

            <Text
              className="text-xl font-bold mb-2 leading-[26px]"
              style={{ color: colors.text, fontFamily: "Ubuntu-Bold" }}
              numberOfLines={2}
            >
              {trip.title}
            </Text>

            {trip.description && (
              <Text
                className="text-sm mb-4 leading-5"
                style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
                numberOfLines={2}
              >
                {trip.description}
              </Text>
            )}

            <View className="gap-2.5 mb-4">
              <View className="flex-row items-center">
                <Calendar size={16} color={colors.textSecondary} style={{ marginRight: 10 }} />
                <Text
                  className="text-sm flex-1"
                  style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
                >
                  {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Wallet size={16} color={colors.textSecondary} style={{ marginRight: 10 }} />
                <Text
                  className="text-sm flex-1"
                  style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
                >
                  Budget: {trip.budget}€
                </Text>
              </View>
            </View>

            <View
              className="border-t pt-4 mt-1 flex-row items-center gap-1"
              style={{ borderTopColor: colors.border }}
            >
              <Text
                className="text-[13px] font-semibold"
                style={{ color: colors.primary, fontFamily: "Ubuntu-Medium" }}
              >
                Voir les détails
              </Text>
              <ChevronRight size={18} color={colors.primary} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
