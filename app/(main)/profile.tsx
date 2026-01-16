import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "@/src/contexts/ThemeContext";
import { useAuth } from "@/src/contexts/AuthContext";
import { supabase } from "@/src/lib/supabaseClient";

export default function ProfileScreen() {
  const { theme, colors, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalExpenses: 0,
    totalDestinations: 0,
  });

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchUserStats();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      // Essayer de récupérer depuis la table profiles
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (profileData) {
        setUserProfile(profileData);
      } else {
        // Si pas de profil, créer un profil basique depuis les infos auth
        setUserProfile({
          email: user?.email,
          first_name: user?.user_metadata?.first_name || "",
          last_name: user?.user_metadata?.last_name || "",
        });
      }
    } catch (error) {
      console.log("Erreur récupération profil:", error);
      setUserProfile({
        email: user?.email,
        first_name: user?.user_metadata?.first_name || "",
        last_name: user?.user_metadata?.last_name || "",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      // Compter les voyages
      const { count: tripsCount } = await supabase
        .from("trips")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id);

      // Compter les dépenses
      const { count: expensesCount } = await supabase
        .from("expenses")
        .select("*", { count: "exact", head: true })
        .eq("paid_by_user_id", user?.id);

      // Compter les destinations (via les voyages)
      const { data: userTrips } = await supabase
        .from("trips")
        .select("id")
        .eq("user_id", user?.id);

      const tripIds = userTrips?.map((t) => t.id) || [];
      let destinationsCount = 0;
      if (tripIds.length > 0) {
        const { count: destCount } = await supabase
          .from("destinations")
          .select("*", { count: "exact", head: true })
          .in("trip_id", tripIds);
        destinationsCount = destCount || 0;
      }

      setStats({
        totalTrips: tripsCount || 0,
        totalExpenses: expensesCount || 0,
        totalDestinations: destinationsCount,
      });
    } catch (error) {
      console.log("Erreur récupération stats:", error);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Déconnexion",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
              router.replace("/(main)");
            } catch (error: any) {
              Alert.alert("Erreur", "Impossible de se déconnecter");
            }
          },
        },
      ]
    );
  };

  const getInitials = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return (
        userProfile.first_name.charAt(0).toUpperCase() +
        userProfile.last_name.charAt(0).toUpperCase()
      );
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const getDisplayName = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`;
    }
    if (userProfile?.first_name) {
      return userProfile.first_name;
    }
    if (user?.email) {
      const emailParts = user.email.split("@");
      return emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1);
    }
    return "Utilisateur";
  };


  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar
          barStyle={theme === "dark" ? "light-content" : "dark-content"}
          backgroundColor={colors.surface}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Chargement du profil...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.surface}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.card }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Mon profil</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.themeButton, { backgroundColor: colors.card }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <Text style={styles.themeIcon}>{theme === "dark" ? "☀️" : "🌙"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section Profil */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <View style={styles.profileHeader}>
            <View
              style={[
                styles.avatarContainer,
                {
                  backgroundColor: colors.primary,
                  shadowColor: colors.primary,
                },
              ]}
            >
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>
                {getDisplayName()}
              </Text>
              {user?.email && (
                <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
                  {user.email}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Statistiques */}
        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Statistiques</Text>
          <View style={styles.statsGrid}>
            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                  shadowColor: colors.shadow,
                },
              ]}
            >
              <View style={[styles.statIconContainer, { backgroundColor: colors.primary + "20" }]}>
                <Text style={styles.statIcon}>✈️</Text>
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalTrips}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Voyages</Text>
            </View>

            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                  shadowColor: colors.shadow,
                },
              ]}
            >
              <View style={[styles.statIconContainer, { backgroundColor: colors.primary + "20" }]}>
                <Text style={styles.statIcon}>💰</Text>
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stats.totalExpenses}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Dépenses</Text>
            </View>

            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                  shadowColor: colors.shadow,
                },
              ]}
            >
              <View style={[styles.statIconContainer, { backgroundColor: colors.primary + "20" }]}>
                <Text style={styles.statIcon}>📍</Text>
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stats.totalDestinations}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Destinations
              </Text>
            </View>
          </View>
        </View>

        {/* Paramètres */}
        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Paramètres</Text>

          <View
            style={[
              styles.settingsCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                shadowColor: colors.shadow,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.settingItem}
              onPress={toggleTheme}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconContainer, { backgroundColor: colors.primary + "20" }]}>
                  <Text style={styles.settingIcon}>{theme === "dark" ? "☀️" : "🌙"}</Text>
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>Thème</Text>
                  <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                    {theme === "dark" ? "Mode sombre" : "Mode clair"}
                  </Text>
                </View>
              </View>
              <Text style={[styles.settingArrow, { color: colors.textSecondary }]}>→</Text>
            </TouchableOpacity>

            <View style={[styles.settingDivider, { backgroundColor: colors.border }]} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push("/(main)/invitations")}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconContainer, { backgroundColor: colors.primary + "20" }]}>
                  <Text style={styles.settingIcon}>📬</Text>
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>Mes invitations</Text>
                  <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                    Gérer mes invitations aux voyages
                  </Text>
                </View>
              </View>
              <Text style={[styles.settingArrow, { color: colors.textSecondary }]}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Informations */}
        <View style={styles.infoSection}>
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                shadowColor: colors.shadow,
              },
            ]}
          >
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{user?.email || "N/A"}</Text>
            </View>
            {userProfile?.first_name && (
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Prénom</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {userProfile.first_name}
                </Text>
              </View>
            )}
            {userProfile?.last_name && (
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Nom</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {userProfile.last_name}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Bouton de déconnexion */}
        <TouchableOpacity
          style={[
            styles.signOutButton,
            {
              backgroundColor: colors.error + "15",
              borderColor: colors.error,
            },
          ]}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <Text style={styles.signOutIcon}>🚪</Text>
          <Text style={[styles.signOutText, { color: colors.error }]}>Déconnexion</Text>
        </TouchableOpacity>
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
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  profileCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  profileEmail: {
    fontSize: 14,
  },
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 24,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  settingsSection: {
    marginBottom: 24,
  },
  settingsCard: {
    borderRadius: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingIcon: {
    fontSize: 18,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
  },
  settingArrow: {
    fontSize: 18,
    fontWeight: "600",
  },
  settingDivider: {
    height: 1,
    marginHorizontal: 16,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
  },
  infoItem: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 10,
  },
  signOutIcon: {
    fontSize: 20,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
