import React, { useState } from "react";
import { View, Text, TouchableOpacity, StatusBar, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import TripList from "@/components/TripList";
import AuthScreen from "@/components/AuthScreen";
import { useAuth } from "@/src/contexts/AuthContext";
import { useTrip } from "@/src/contexts/TripContext";
import { useTheme } from "@/src/contexts/ThemeContext";
import { Trip } from "@/src/types/trip";
import { Sun, Moon, FilePlus, Inbox } from "lucide-react-native";

export default function MainScreen() {
  const { user, loading, signOut } = useAuth();
  const { setSelectedTrip } = useTrip();
  const { theme, toggleTheme, colors } = useTheme();
  const insets = useSafeAreaInsets();

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
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter ?",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Déconnexion",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error("Erreur lors de la déconnexion:", error);
            }
          },
        },
      ]
    );
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

  if (loading) {
    return (
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: colors.background }}
      >
        <Text
          className="text-base"
          style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
        >
          Chargement...
        </Text>
      </View>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar 
        barStyle={theme === "dark" ? "light-content" : "dark-content"} 
        backgroundColor={colors.surface} 
      />
      
      {/* Header moderne avec profil */}
      <View
        className="pb-3 px-5 rounded-b-[20px] border-b"
        style={{
          paddingTop: insets.top + 10,
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 3,
          zIndex: 1000,
        }}
      >
        <View className="flex-row items-center gap-3">
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
              onPress={() => router.push("/modal")}
              activeOpacity={0.6}
            >
              <FilePlus size={20} color={colors.text} strokeWidth={2} />
            </TouchableOpacity>
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

      <TripList onTripSelect={handleTripSelect} />
    </View>
  );
}
