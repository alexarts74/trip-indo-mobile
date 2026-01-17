import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Alert } from "react-native";
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
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Chargement...</Text>
      </View>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={theme === "dark" ? "light-content" : "dark-content"} 
        backgroundColor={colors.surface} 
      />
      
      {/* Header moderne avec profil */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <View style={styles.profileInfo}>
            <Text 
              style={[styles.greeting, { color: colors.text }]}
            >
              Bonjour,{" "}
              <Text 
                style={[styles.userName, { color: colors.textSecondary }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {getUserDisplayName()}!
              </Text>
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionIcon}
              onPress={() => router.push("/modal")}
              activeOpacity={0.6}
            >
              <FilePlus size={20} color={colors.text} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionIcon}
              onPress={() => router.push("/(main)/invitations")}
              activeOpacity={0.6}
            >
              <Inbox size={20} color={colors.text} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionIcon}
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
              style={styles.actionIcon}
              onPress={() => router.push("/(main)/profile")}
              activeOpacity={0.6}
            >
              <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>{getInitials()}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TripList onTripSelect={handleTripSelect} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "Ubuntu-Regular",
  },
  header: {
    paddingTop: 45,
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 1000,
    overflow: "visible",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  profileInfo: {
    flex: 1,
    marginRight: 8,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#f97316",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Ubuntu-Bold",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Ubuntu-Bold",
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  userName: {
    fontSize: 16,
    fontWeight: "400",
    fontFamily: "Ubuntu-Regular",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionIcon: {
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
  },
});
