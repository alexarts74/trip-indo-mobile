import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import TripParticipants from "@/components/trip/TripParticipants";
import { useTrip } from "@/src/contexts/TripContext";
import { useTheme } from "@/src/contexts/ThemeContext";
import { useAuth } from "@/src/contexts/AuthContext";
import { Trip } from "@/src/types/trip";

export default function ParticipantsScreen() {
  const { selectedTrip } = useTrip();
  const { theme, toggleTheme, colors } = useTheme();
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
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

  if (!trip) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Voyage non trouvé</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={theme === "dark" ? "light-content" : "dark-content"} 
        backgroundColor={colors.surface} 
      />
      
      {/* Header moderne avec profil */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border, zIndex: 1000 }]}>
        <View style={styles.headerTop}>
          <View style={styles.profileSection}>
            <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.greeting, { color: colors.textSecondary }]}>Bonjour</Text>
              <Text style={[styles.userName, { color: colors.text }]}>{getUserDisplayName()}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.themeButton, { backgroundColor: colors.card }]}
              onPress={toggleTheme}
              activeOpacity={0.7}
            >
              <Text style={styles.themeIcon}>{theme === "dark" ? "☀️" : "🌙"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuButton, { backgroundColor: colors.card }]}
              onPress={() => setShowMenu(!showMenu)}
              activeOpacity={0.7}
            >
              <Text style={[styles.menuIcon, { color: colors.text }]}>⋯</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {showMenu && (
          <View style={[styles.menuDropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                router.push("/(main)/profile");
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.menuItemText, { color: colors.text }]}>Mon profil</Text>
            </TouchableOpacity>
            <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                router.push("/(main)/invitations");
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.menuItemText, { color: colors.text }]}>Mes invitations</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TripParticipants
          tripId={trip.id}
          tripName={trip.title}
          currentUserId={trip.user_id}
        />
      </ScrollView>
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
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 1000,
    overflow: "visible",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
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
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  profileInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  themeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  themeIcon: {
    fontSize: 20,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  menuIcon: {
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 24,
  },
  menuDropdown: {
    position: "absolute",
    top: 100,
    right: 20,
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 160,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    zIndex: 1001,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "600",
  },
  menuDivider: {
    height: 1,
    marginVertical: 4,
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
