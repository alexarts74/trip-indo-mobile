import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Sun,
  Moon,
  FilePlus,
  Inbox,
  MapPin,
  Globe,
  Wallet,
  BookOpen,
  Plus,
} from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/src/contexts/ThemeContext";
import { useTrip } from "@/src/contexts/TripContext";
import { useAuth } from "@/src/contexts/AuthContext";
import { Destination } from "@/src/types/destination";
import { JournalEntry } from "@/src/types/journal";
import { destinationsService } from "@/src/services/destinationsService";
import { journalService } from "@/src/services/journalService";
import JournalEntryList from "@/components/trip/JournalEntryList";
import AddJournalEntryModal from "@/components/trip/AddJournalEntryModal";

export default function DestinationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, toggleTheme, colors } = useTheme();
  const { selectedTrip } = useTrip();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [destination, setDestination] = useState<Destination | null>(null);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJournalLoading, setIsJournalLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    if (id && selectedTrip) {
      fetchDestination();
      fetchJournalEntries();
    } else if (!selectedTrip) {
      router.replace("/(main)");
    }
  }, [id, selectedTrip]);

  const fetchDestination = async () => {
    try {
      setIsLoading(true);
      const destinations = await destinationsService.fetchDestinations(
        selectedTrip!.id
      );
      const found = destinations.find((d: Destination) => d.id === id);
      if (found) {
        setDestination(found);
      } else {
        setError("Destination non trouvée");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchJournalEntries = async () => {
    if (!id) return;
    try {
      setIsJournalLoading(true);
      const entries = await journalService.getDestinationJournalEntries(id);
      setJournalEntries(entries);
    } catch (err: any) {
      console.error("Erreur lors de la récupération du journal:", err);
    } finally {
      setIsJournalLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchDestination(), fetchJournalEntries()]);
    setIsRefreshing(false);
  };

  const handleBack = () => {
    router.back();
  };

  const handleJournalEntryAdded = () => {
    fetchJournalEntries();
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await journalService.deleteJournalEntry(entryId);
      fetchJournalEntries();
    } catch (err: any) {
      console.error("Erreur lors de la suppression:", err);
    }
  };

  // Obtenir les initiales pour l'avatar
  const getInitials = () => {
    if (!user?.email) return "U";
    const emailParts = user.email.split("@");
    const name = emailParts[0];
    return name.charAt(0).toUpperCase();
  };

  if (isLoading) {
    return (
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          className="mt-3 text-sm"
          style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
        >
          Chargement...
        </Text>
      </View>
    );
  }

  if (error || !destination) {
    return (
      <View
        className="flex-1 justify-center items-center px-6"
        style={{ backgroundColor: colors.background }}
      >
        <Text
          className="text-base text-center"
          style={{ color: colors.error, fontFamily: "Ubuntu-Regular" }}
        >
          {error || "Destination non trouvée"}
        </Text>
        <TouchableOpacity
          className="mt-4 px-6 py-3 rounded-xl"
          style={{ backgroundColor: colors.primary }}
          onPress={handleBack}
        >
          <Text
            className="text-white text-sm font-semibold"
            style={{ fontFamily: "Ubuntu-Medium" }}
          >
            Retour
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.surface}
      />

      {/* Header identique aux autres pages */}
      <View
        className="pb-4 px-5 rounded-b-[20px]"
        style={{
          paddingTop: insets.top + 12,
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
            className="p-1.5 -ml-1 justify-center items-center"
            onPress={handleBack}
            activeOpacity={0.6}
          >
            <ArrowLeft size={22} color={colors.text} strokeWidth={2} />
          </TouchableOpacity>
          <View className="flex-1 mr-2">
            <Text
              className="text-2xl font-bold leading-7"
              style={{
                color: colors.text,
                fontFamily: "Ubuntu-Bold",
                letterSpacing: -0.3,
              }}
              numberOfLines={1}
            >
              {destination.name}
            </Text>
            {destination.country && (
              <Text
                className="text-sm mt-0.5"
                style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
              >
                {destination.country}
              </Text>
            )}
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

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Infos de la destination */}
        {(destination.description || destination.address || destination.price) && (
          <View className="px-4 pt-5 pb-4">
            {destination.description && (
              <Text
                className="text-sm leading-5 mb-3"
                style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
              >
                {destination.description}
              </Text>
            )}

            <View className="flex-row flex-wrap gap-2">
              {destination.address && (
                <View
                  className="flex-row items-center px-3 py-2 rounded-full"
                  style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
                >
                  <MapPin size={14} color={colors.textSecondary} />
                  <Text
                    className="text-xs ml-1.5"
                    style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
                    numberOfLines={1}
                  >
                    {destination.address}
                  </Text>
                </View>
              )}
              {destination.price !== undefined && destination.price !== null && (
                <View
                  className="flex-row items-center px-3 py-2 rounded-full"
                  style={{ backgroundColor: colors.primary + "15" }}
                >
                  <Wallet size={14} color={colors.primary} />
                  <Text
                    className="text-xs ml-1.5 font-bold"
                    style={{ color: colors.primary, fontFamily: "Ubuntu-Bold" }}
                  >
                    {destination.price}€
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Séparateur avec titre Journal */}
        <View className="px-4 pt-2 pb-4">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <BookOpen size={18} color={colors.text} />
              <Text
                className="text-lg font-bold ml-2"
                style={{ color: colors.text, fontFamily: "Ubuntu-Bold" }}
              >
                Journal
              </Text>
              <View
                className="ml-2 px-2 py-0.5 rounded-full"
                style={{ backgroundColor: colors.textSecondary + "20" }}
              >
                <Text
                  className="text-xs"
                  style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
                >
                  {journalEntries.length}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              className="flex-row items-center px-3 py-2 rounded-xl"
              style={{ backgroundColor: colors.primary }}
              onPress={() => setIsAddModalOpen(true)}
              activeOpacity={0.8}
            >
              <Plus size={16} color="#ffffff" />
              <Text
                className="text-white text-sm font-semibold ml-1"
                style={{ fontFamily: "Ubuntu-Medium" }}
              >
                Ajouter
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Liste des entrées de journal */}
        <View className="px-4">
          <JournalEntryList
            entries={journalEntries}
            isLoading={isJournalLoading}
            currentUserId={user?.id}
            onDeleteEntry={handleDeleteEntry}
            onRefresh={fetchJournalEntries}
          />
        </View>
      </ScrollView>

      {/* Bouton flottant pour ajouter une entrée */}
      {journalEntries.length > 0 && (
        <TouchableOpacity
          className="absolute right-5 bottom-24 w-14 h-14 rounded-full justify-center items-center"
          style={{
            backgroundColor: colors.primary,
            shadowColor: "#f97316",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
          onPress={() => setIsAddModalOpen(true)}
          activeOpacity={0.8}
        >
          <Plus size={24} color="#ffffff" />
        </TouchableOpacity>
      )}

      {/* Modal d'ajout d'entrée */}
      <AddJournalEntryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        destinationId={id!}
        onEntryAdded={handleJournalEntryAdded}
      />
    </View>
  );
}
