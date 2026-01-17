import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from "react-native";
import { ArrowLeft, Sun, Moon, FilePlus, Inbox } from "lucide-react-native";
import { router } from "expo-router";
import TripExpenses from "@/components/trip/TripExpenses";
import { useTrip } from "@/src/contexts/TripContext";
import { useTheme } from "@/src/contexts/ThemeContext";
import { useAuth } from "@/src/contexts/AuthContext";
import { Trip } from "@/src/types/trip";

export default function ExpensesScreen() {
  const { selectedTrip } = useTrip();
  const { theme, toggleTheme, colors } = useTheme();
  const { user } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);

  useEffect(() => {
    console.log("🔄 useEffect - selectedTrip:", selectedTrip?.title);
    if (selectedTrip) {
      console.log("✅ useEffect - selectedTrip trouvé");
      setTrip(selectedTrip);
    } else {
      console.log(
        "⚠️ useEffect - selectedTrip est undefined, redirection vers l'écran principal"
      );
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={theme === "dark" ? "light-content" : "dark-content"} 
        backgroundColor={colors.surface} 
      />
      
      {/* Header principal avec greeting et actions */}
      <View style={[styles.mainHeader, { backgroundColor: colors.surface }]}>
        <View style={styles.mainHeaderContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToTrips}
            activeOpacity={0.6}
          >
            <ArrowLeft size={20} color={colors.text} strokeWidth={2} />
          </TouchableOpacity>
          <View style={styles.greetingSection}>
            <Text 
              style={[styles.mainGreeting, { color: colors.text }]}
            >
              Bonjour,{" "}
              <Text 
                style={[styles.userNameGreeting, { color: colors.textSecondary }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {getUserDisplayName()}!
              </Text>
            </Text>
          </View>
          <View style={styles.headerActionsRow}>
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {trip && <TripExpenses tripId={trip.id} tripName={trip.title} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainHeader: {
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
  mainHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    padding: 4,
    marginLeft: -4,
    justifyContent: "center",
    alignItems: "center",
  },
  greetingSection: {
    flex: 1,
    marginRight: 8,
  },
  mainGreeting: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Ubuntu-Bold",
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  userNameGreeting: {
    fontSize: 16,
    fontWeight: "400",
    fontFamily: "Ubuntu-Regular",
  },
  headerActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionIcon: {
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
});
