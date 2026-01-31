import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Sun, Moon, Inbox } from "lucide-react-native";
import { router } from "expo-router";
import TripExpenses from "@/components/trip/TripExpenses";
import { useTrip } from "@/src/contexts/TripContext";
import { useTheme } from "@/src/contexts/ThemeContext";
import { useAuth } from "@/src/contexts/AuthContext";
import { Trip } from "@/src/types/trip";
import { ResponsiveContainer } from "@/src/components/ResponsiveContainer";

export default function ExpensesScreen() {
  const { selectedTrip } = useTrip();
  const { theme, toggleTheme, colors } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [trip, setTrip] = useState<Trip | null>(null);

  useEffect(() => {
    if (selectedTrip) {
      setTrip(selectedTrip);
    } else {
      router.replace("/(main)");
    }
  }, [selectedTrip]);

  const handleBackToTrips = () => {
    router.replace("/(main)");
  };

  // Extraire le nom d'utilisateur de l'email
  const getUserDisplayName = () => {
    if (!user?.email) return "Utilisateur";
    const emailParts = user.email.split("@");
    return emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1);
  };

  // Obtenir les initiales pour l'avatar
  const getInitials = () => {
    if (!user?.email) return "U";
    const emailParts = user.email.split("@");
    const name = emailParts[0];
    return name.charAt(0).toUpperCase();
  };

  return (
    <ResponsiveContainer containerStyle={{ backgroundColor: colors.background }}>
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <StatusBar
          barStyle={theme === "dark" ? "light-content" : "dark-content"}
          backgroundColor={colors.surface}
        />

        {/* Header principal avec greeting et actions */}
        <View
          className="pb-3 px-5 rounded-b-[20px]"
          style={{
            paddingTop: insets.top + 10,
            backgroundColor: colors.surface,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
            zIndex: 1000,
          }}
        >
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              className="p-1 -ml-1 justify-center items-center"
              onPress={handleBackToTrips}
              activeOpacity={0.6}
            >
              <ArrowLeft size={20} color={colors.text} strokeWidth={2} />
            </TouchableOpacity>
            <View className="flex-1 mr-2">
              <Text
                className="text-2xl font-bold leading-7"
                style={{
                  color: colors.text,
                  fontFamily: "Ubuntu-Bold",
                  letterSpacing: -0.3,
                }}
              >
                Bonjour,{" "}
                <Text
                  className="text-base font-normal"
                  style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {getUserDisplayName()}!
                </Text>
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <TouchableOpacity
                className="p-0.5 justify-center items-center"
                onPress={() => router.push("/(main)/invitations")}
                activeOpacity={0.6}
              >
                <Inbox size={20} color={colors.text} strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity
                className="p-0.5 justify-center items-center"
                onPress={toggleTheme}
                activeOpacity={0.6}
              >
                {theme === "dark" ? (
                  <Sun size={20} color={colors.text} strokeWidth={2} />
                ) : (
                  <Moon size={20} color={colors.text} strokeWidth={2} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                className="p-0.5 justify-center items-center"
                onPress={() => router.push("/(main)/profile")}
                activeOpacity={0.6}
              >
                <View
                  className="w-9 h-9 rounded-full justify-center items-center"
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
                    className="text-base font-bold text-white"
                    style={{ fontFamily: "Ubuntu-Bold", letterSpacing: 0.5 }}
                  >
                    {getInitials()}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ScrollView
          className="flex-1 px-4 pt-5 pb-4"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {trip && <TripExpenses tripId={trip.id} tripName={trip.title} />}
        </ScrollView>
      </View>
    </ResponsiveContainer>
  );
}
