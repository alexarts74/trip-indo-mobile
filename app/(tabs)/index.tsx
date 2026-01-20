import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Sun, Moon, FilePlus, Inbox, FileDown } from "lucide-react-native";
import { router } from "expo-router";
import TripOverview from "@/components/trip/TripOverview";
import { useAuth } from "@/src/contexts/AuthContext";
import { useTrip } from "@/src/contexts/TripContext";
import { useTheme } from "@/src/contexts/ThemeContext";
import { Trip } from "@/src/types/trip";
import { Destination } from "@/src/types/destination";
import { pdfExportService } from "@/src/services/pdfExportService";

export default function OverviewScreen() {
  const { user, loading, signOut } = useAuth();
  const { selectedTrip } = useTrip();
  const { theme, toggleTheme, colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!selectedTrip) {
      console.log(
        "⚠️ Overview - selectedTrip est undefined, redirection vers l'écran principal"
      );
      router.replace("/(main)");
    } else {
      console.log("✅ Overview - selectedTrip trouvé:", selectedTrip.title);
      setTrip(selectedTrip);
      // Charger les destinations directement
      fetchDestinations(selectedTrip.id);
    }
  }, [selectedTrip]);

  const fetchDestinations = async (tripId: string) => {
    try {
      setIsLoading(true);
      // TODO: Implémenter l'appel au service des destinations
      console.log(
        "🔄 Overview - Chargement des destinations pour le voyage:",
        tripId
      );
      // Pour l'instant, on met un tableau vide
      setDestinations([]);
      setError("");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToTrips = () => {
    console.log("handleBackToTrips");
    router.replace("/(main)");
  };

  const handleExportPDF = async () => {
    if (!trip) return;
    setIsExporting(true);
    try {
      await pdfExportService.exportTripToPDF(trip);
    } catch (error: any) {
      console.error("Error exporting PDF:", error);
      Alert.alert("Erreur", "Impossible d'exporter le voyage en PDF");
    } finally {
      setIsExporting(false);
    }
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
    return (
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: colors.background }}
      >
        <Text
          className="text-base"
          style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
        >
          Veuillez vous connecter
        </Text>
      </View>
    );
  }

  if (!trip) {
    console.log("trip", trip);
    return (
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: colors.background }}
      >
        <Text
          className="text-base"
          style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
        >
          Voyage non trouvé
        </Text>
      </View>
    );
  }

  return (
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
              onPress={handleExportPDF}
              activeOpacity={0.6}
              disabled={isExporting}
            >
              {isExporting ? (
                <ActivityIndicator size="small" color={colors.text} />
              ) : (
                <FileDown size={20} color={colors.text} strokeWidth={2} />
              )}
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
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <TripOverview
          trip={trip}
          destinations={destinations}
          isLoading={isLoading}
          error={error}
        />
      </ScrollView>
    </View>
  );
}
