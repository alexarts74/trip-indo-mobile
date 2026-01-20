import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, ChevronRight, Plane, Wallet, MapPin, Sun, Moon, Mail, LogOut } from "lucide-react-native";
import { router } from "expo-router";
import { useTheme } from "@/src/contexts/ThemeContext";
import { useAuth } from "@/src/contexts/AuthContext";
import { supabase } from "@/src/lib/supabaseClient";

export default function ProfileScreen() {
  const { theme, colors, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();
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
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <StatusBar
          barStyle={theme === "dark" ? "light-content" : "dark-content"}
          backgroundColor={colors.surface}
        />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            className="mt-3 text-sm"
            style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
          >
            Chargement du profil...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.surface}
      />

      {/* Header */}
      <View
        className="pb-5 px-5 flex-row items-center border-b"
        style={{
          paddingTop: insets.top + 10,
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.03,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <TouchableOpacity
          className="w-10 h-10 justify-center items-center rounded-full mr-3"
          style={{ backgroundColor: colors.card }}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text
            className="text-[28px] font-bold"
            style={{
              color: colors.text,
              fontFamily: "Ubuntu-Bold",
              letterSpacing: -0.5,
            }}
          >
            Mon profil
          </Text>
        </View>
        <View className="flex-row items-center gap-2.5">
          <TouchableOpacity
            className="w-10 h-10 justify-center items-center rounded-full"
            style={{ backgroundColor: colors.card }}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            {theme === "dark" ? (
              <Sun size={20} color={colors.text} />
            ) : (
              <Moon size={20} color={colors.text} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-5 pb-4"
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Section Profil */}
        <View
          className="rounded-[20px] p-6 mb-6 border"
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
          <View className="flex-row items-center">
            <View
              className="w-20 h-20 rounded-full justify-center items-center mr-4"
              style={{
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <Text
                className="text-white text-[32px] font-bold"
                style={{ fontFamily: "Ubuntu-Bold", letterSpacing: 0.5 }}
              >
                {getInitials()}
              </Text>
            </View>
            <View className="flex-1">
              <Text
                className="text-2xl font-bold mb-1"
                style={{
                  color: colors.text,
                  fontFamily: "Ubuntu-Bold",
                  letterSpacing: -0.3,
                }}
              >
                {getDisplayName()}
              </Text>
              {user?.email && (
                <Text
                  className="text-sm"
                  style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
                >
                  {user.email}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Statistiques */}
        <View className="mb-6">
          <Text
            className="text-xl font-bold mb-4"
            style={{
              color: colors.text,
              fontFamily: "Ubuntu-Bold",
              letterSpacing: -0.3,
            }}
          >
            Statistiques
          </Text>
          <View className="flex-row gap-3">
            <View
              className="flex-1 rounded-2xl p-4 items-center border"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View
                className="w-12 h-12 rounded-full justify-center items-center mb-3"
                style={{ backgroundColor: colors.primary + "20" }}
              >
                <Plane size={24} color={colors.primary} />
              </View>
              <Text
                className="text-2xl font-bold mb-1"
                style={{ color: colors.text, fontFamily: "Ubuntu-Bold" }}
              >
                {stats.totalTrips}
              </Text>
              <Text
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
              >
                Voyages
              </Text>
            </View>

            <View
              className="flex-1 rounded-2xl p-4 items-center border"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View
                className="w-12 h-12 rounded-full justify-center items-center mb-3"
                style={{ backgroundColor: colors.primary + "20" }}
              >
                <Wallet size={24} color={colors.primary} />
              </View>
              <Text
                className="text-2xl font-bold mb-1"
                style={{ color: colors.text, fontFamily: "Ubuntu-Bold" }}
              >
                {stats.totalExpenses}
              </Text>
              <Text
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
              >
                Dépenses
              </Text>
            </View>

            <View
              className="flex-1 rounded-2xl p-4 items-center border"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View
                className="w-12 h-12 rounded-full justify-center items-center mb-3"
                style={{ backgroundColor: colors.primary + "20" }}
              >
                <MapPin size={24} color={colors.primary} />
              </View>
              <Text
                className="text-2xl font-bold mb-1"
                style={{ color: colors.text, fontFamily: "Ubuntu-Bold" }}
              >
                {stats.totalDestinations}
              </Text>
              <Text
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
              >
                Destinations
              </Text>
            </View>
          </View>
        </View>

        {/* Paramètres */}
        <View className="mb-6">
          <Text
            className="text-xl font-bold mb-4"
            style={{
              color: colors.text,
              fontFamily: "Ubuntu-Bold",
              letterSpacing: -0.3,
            }}
          >
            Paramètres
          </Text>

          <View
            className="rounded-2xl border overflow-hidden"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <TouchableOpacity
              className="flex-row items-center justify-between p-4"
              onPress={toggleTheme}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center flex-1">
                <View
                  className="w-10 h-10 rounded-full justify-center items-center mr-3"
                  style={{ backgroundColor: colors.primary + "20" }}
                >
                  {theme === "dark" ? (
                    <Sun size={18} color={colors.primary} />
                  ) : (
                    <Moon size={18} color={colors.primary} />
                  )}
                </View>
                <View className="flex-1">
                  <Text
                    className="text-base font-semibold mb-0.5"
                    style={{ color: colors.text, fontFamily: "Ubuntu-Medium" }}
                  >
                    Thème
                  </Text>
                  <Text
                    className="text-[13px]"
                    style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
                  >
                    {theme === "dark" ? "Mode sombre" : "Mode clair"}
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <View className="h-[1px] mx-4" style={{ backgroundColor: colors.border }} />

            <TouchableOpacity
              className="flex-row items-center justify-between p-4"
              onPress={() => router.push("/(main)/invitations")}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center flex-1">
                <View
                  className="w-10 h-10 rounded-full justify-center items-center mr-3"
                  style={{ backgroundColor: colors.primary + "20" }}
                >
                  <Mail size={18} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-base font-semibold mb-0.5"
                    style={{ color: colors.text, fontFamily: "Ubuntu-Medium" }}
                  >
                    Mes invitations
                  </Text>
                  <Text
                    className="text-[13px]"
                    style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
                  >
                    Gérer mes invitations aux voyages
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Informations */}
        <View className="mb-6">
          <View
            className="rounded-2xl p-5 border"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="mb-4">
              <Text
                className="text-xs font-semibold mb-1 uppercase tracking-wide"
                style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
              >
                Email
              </Text>
              <Text
                className="text-base font-medium"
                style={{ color: colors.text, fontFamily: "Ubuntu-Medium" }}
              >
                {user?.email || "N/A"}
              </Text>
            </View>
            {userProfile?.first_name && (
              <View className="mb-4">
                <Text
                  className="text-xs font-semibold mb-1 uppercase tracking-wide"
                  style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
                >
                  Prénom
                </Text>
                <Text
                  className="text-base font-medium"
                  style={{ color: colors.text, fontFamily: "Ubuntu-Medium" }}
                >
                  {userProfile.first_name}
                </Text>
              </View>
            )}
            {userProfile?.last_name && (
              <View>
                <Text
                  className="text-xs font-semibold mb-1 uppercase tracking-wide"
                  style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
                >
                  Nom
                </Text>
                <Text
                  className="text-base font-medium"
                  style={{ color: colors.text, fontFamily: "Ubuntu-Medium" }}
                >
                  {userProfile.last_name}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Bouton de déconnexion */}
        <TouchableOpacity
          className="flex-row items-center justify-center py-4 rounded-2xl border-[1.5px] gap-2.5"
          style={{
            backgroundColor: colors.error + "15",
            borderColor: colors.error,
          }}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <LogOut size={20} color={colors.error} />
          <Text
            className="text-base font-bold"
            style={{ color: colors.error, fontFamily: "Ubuntu-Bold" }}
          >
            Déconnexion
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
