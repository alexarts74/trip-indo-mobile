import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Alert } from "react-native";
import { router } from "expo-router";
import TripList from "@/components/TripList";
import AuthScreen from "@/components/AuthScreen";
import { useAuth } from "@/src/contexts/AuthContext";
import { useTrip } from "@/src/contexts/TripContext";
import { useTheme } from "@/src/contexts/ThemeContext";
import { Trip } from "@/src/types/trip";

export default function MainScreen() {
  const { user, loading, signOut } = useAuth();
  const { setSelectedTrip } = useTrip();
  const { theme, toggleTheme, colors } = useTheme();
  const [showMenu, setShowMenu] = useState(false);

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
    elevation: 8,
    borderWidth: 1,
    zIndex: 1000,
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
});
