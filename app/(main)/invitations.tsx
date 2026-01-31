import React, { useState, useEffect, useCallback } from "react";
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
import { ArrowLeft, Mail, UserPlus, ChevronDown, X } from "lucide-react-native";
import { router } from "expo-router";
import { useTheme } from "@/src/contexts/ThemeContext";
import { useAuth } from "@/src/contexts/AuthContext";
import { invitationService, Invitation } from "@/src/services/invitationService";
import { tripService } from "@/src/services/tripService";
import { Trip } from "@/src/types/trip";
import { supabase } from "@/src/lib/supabaseClient";
import InvitationManager from "@/components/trip/InvitationManager";
import { ResponsiveContainer } from "@/src/components/ResponsiveContainer";

export default function InvitationsScreen() {
  const { theme, colors } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // État pour l'envoi d'invitations
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showTripPicker, setShowTripPicker] = useState(false);
  const [loadingTrips, setLoadingTrips] = useState(false);

  // Charger les invitations au montage et écouter les changements en temps réel
  useEffect(() => {
    if (user?.email) {
      fetchInvitations();

      // Subscription pour les nouvelles invitations en temps réel
      const channel = supabase
        .channel('invitations-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'trip_invitations',
            filter: `invitee_email=eq.${user.email.toLowerCase()}`,
          },
          () => {
            // Rafraîchir les invitations quand il y a un changement
            fetchInvitationsQuietly();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchTrips = async () => {
    try {
      setLoadingTrips(true);
      const userTrips = await tripService.getUserTrips();
      setTrips(userTrips);
      if (userTrips.length > 0 && !selectedTrip) {
        setSelectedTrip(userTrips[0]);
      }
    } catch (err: any) {
      // Silently handle error
    } finally {
      setLoadingTrips(false);
    }
  };

  const handleShowInviteForm = () => {
    setShowInviteForm(true);
    fetchTrips();
  };

  const fetchInvitations = async () => {
    if (!user?.email) return;

    try {
      setIsLoading(true);
      setError("");
      const data = await invitationService.getPendingInvitations(user.email);
      setInvitations(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Version silencieuse pour les updates en temps réel (sans loader)
  const fetchInvitationsQuietly = async () => {
    if (!user?.email) return;

    try {
      const data = await invitationService.getPendingInvitations(user.email);
      setInvitations(data);
    } catch (error: any) {
      // Silently handle error
    }
  };

  // Pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (user?.email) {
        const data = await invitationService.getPendingInvitations(user.email);
        setInvitations(data);
      }
      // Rafraîchir aussi la liste des voyages si le formulaire est ouvert
      if (showInviteForm) {
        const userTrips = await tripService.getUserTrips();
        setTrips(userTrips);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setRefreshing(false);
    }
  }, [user, showInviteForm]);

  const handleInvitationResponse = async (
    invitationId: string,
    tripId: string,
    response: "accepted" | "declined"
  ) => {
    if (!user) return;

    setProcessingId(invitationId);
    try {
      if (response === "accepted") {
        await invitationService.acceptInvitation(invitationId, tripId, user.id);
      } else {
        await invitationService.declineInvitation(invitationId);
      }
      await fetchInvitations();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
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
            Chargement des invitations...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ResponsiveContainer containerStyle={{ backgroundColor: colors.background }}>
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <StatusBar
          barStyle={theme === "dark" ? "light-content" : "dark-content"}
          backgroundColor={colors.surface}
        />

        {/* Header */}
        <View
          className="pb-4 px-5 flex-row items-center border-b"
          style={{
            paddingTop: insets.top + 10,
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
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
              className="text-[28px] font-bold mb-1"
              style={{
                color: colors.text,
                fontFamily: "Ubuntu-Bold",
                letterSpacing: -0.5,
              }}
            >
              Mes invitations
            </Text>
            <Text
              className="text-sm"
              style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
            >
              Gérez vos invitations aux voyages
            </Text>
          </View>
        </View>

        <ScrollView
        className="flex-1 px-4 pt-5 pb-4"
        contentContainerStyle={{
          paddingBottom: 16,
          flexGrow: 1,
          justifyContent: invitations.length === 0 && !showInviteForm ? "center" : "flex-start",
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {error && (
          <View
            className="border rounded-xl p-4 mb-5"
            style={{
              backgroundColor: colors.error + "20",
              borderColor: colors.error,
            }}
          >
            <Text
              className="text-sm text-center"
              style={{ color: colors.error, fontFamily: "Ubuntu-Regular" }}
            >
              {error}
            </Text>
          </View>
        )}

        {invitations.length === 0 ? (
          <View className="gap-5" style={{ marginTop: showInviteForm ? 0 : -60 }}>
            {/* Empty state card */}
            <View
              className="rounded-[20px] p-8 items-center border"
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
              <View
                className="w-20 h-20 rounded-full justify-center items-center mb-6"
                style={{ backgroundColor: colors.input }}
              >
                <Mail size={48} color={colors.primary} />
              </View>
              <Text
                className="text-xl font-bold mb-2 text-center"
                style={{ color: colors.text, fontFamily: "Ubuntu-Bold" }}
              >
                Aucune invitation en attente
              </Text>
              <Text
                className="text-[15px] text-center mb-6"
                style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
              >
                Vous n'avez pas d'invitations en attente pour le moment.
              </Text>

              {!showInviteForm && (
                <TouchableOpacity
                  className="flex-row items-center justify-center py-3.5 px-6 rounded-xl gap-2"
                  style={{
                    backgroundColor: colors.primary,
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                  onPress={handleShowInviteForm}
                  activeOpacity={0.8}
                >
                  <UserPlus size={18} color="#ffffff" />
                  <Text
                    className="text-white text-[15px] font-bold"
                    style={{ fontFamily: "Ubuntu-Bold" }}
                  >
                    Inviter quelqu'un
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Formulaire d'invitation */}
            {showInviteForm && (
              <View className="gap-4">
                {/* Header avec bouton fermer */}
                <View className="flex-row items-center justify-between">
                  <Text
                    className="text-lg font-bold"
                    style={{ color: colors.text, fontFamily: "Ubuntu-Bold" }}
                  >
                    Envoyer une invitation
                  </Text>
                  <TouchableOpacity
                    className="w-8 h-8 rounded-full justify-center items-center"
                    style={{ backgroundColor: colors.input }}
                    onPress={() => {
                      setShowInviteForm(false);
                      setSelectedTrip(null);
                    }}
                    activeOpacity={0.7}
                  >
                    <X size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Sélecteur de voyage */}
                {loadingTrips ? (
                  <View className="py-4 items-center">
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text
                      className="mt-2 text-sm"
                      style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
                    >
                      Chargement des voyages...
                    </Text>
                  </View>
                ) : trips.length === 0 ? (
                  <View
                    className="rounded-xl p-4 border"
                    style={{
                      backgroundColor: colors.card,
                      borderColor: colors.cardBorder,
                    }}
                  >
                    <Text
                      className="text-sm text-center"
                      style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
                    >
                      Vous n'avez pas encore de voyage. Créez-en un d'abord pour pouvoir inviter des participants.
                    </Text>
                  </View>
                ) : (
                  <>
                    {/* Trip Picker */}
                    <View>
                      <Text
                        className="text-[15px] font-semibold mb-2"
                        style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
                      >
                        Sélectionnez un voyage
                      </Text>
                      <TouchableOpacity
                        className="flex-row items-center justify-between border-[1.5px] rounded-[14px] px-[18px] py-[15px]"
                        style={{
                          backgroundColor: colors.input,
                          borderColor: colors.inputBorder,
                        }}
                        onPress={() => setShowTripPicker(!showTripPicker)}
                        activeOpacity={0.7}
                      >
                        <Text
                          className="text-base flex-1"
                          style={{
                            color: selectedTrip ? colors.text : colors.textSecondary,
                            fontFamily: "Ubuntu-Regular",
                          }}
                        >
                          {selectedTrip?.title || "Choisir un voyage..."}
                        </Text>
                        <ChevronDown
                          size={20}
                          color={colors.textSecondary}
                          style={{
                            transform: [{ rotate: showTripPicker ? "180deg" : "0deg" }],
                          }}
                        />
                      </TouchableOpacity>

                      {/* Liste déroulante */}
                      {showTripPicker && (
                        <View
                          className="mt-2 rounded-xl border overflow-hidden"
                          style={{
                            backgroundColor: colors.card,
                            borderColor: colors.cardBorder,
                          }}
                        >
                          {trips.map((trip, index) => (
                            <TouchableOpacity
                              key={trip.id}
                              className="px-4 py-3"
                              style={{
                                backgroundColor:
                                  selectedTrip?.id === trip.id
                                    ? colors.primaryLight
                                    : "transparent",
                                borderBottomWidth: index < trips.length - 1 ? 1 : 0,
                                borderBottomColor: colors.border,
                              }}
                              onPress={() => {
                                setSelectedTrip(trip);
                                setShowTripPicker(false);
                              }}
                              activeOpacity={0.7}
                            >
                              <Text
                                className="text-base font-medium"
                                style={{
                                  color:
                                    selectedTrip?.id === trip.id
                                      ? colors.primary
                                      : colors.text,
                                  fontFamily: "Ubuntu-Medium",
                                }}
                              >
                                {trip.title}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>

                    {/* Invitation Manager */}
                    {selectedTrip && (
                      <InvitationManager
                        tripId={selectedTrip.id}
                        tripName={selectedTrip.title}
                        onInvitationSent={() => {
                          // Optionnel: fermer le formulaire après envoi
                        }}
                      />
                    )}
                  </>
                )}
              </View>
            )}
          </View>
        ) : (
          <View className="gap-5">
            {invitations.map((invitation) => (
              <View
                key={invitation.id}
                className="rounded-[20px] p-6 border"
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
                <View className="flex-row items-center mb-4">
                  <View
                    className="w-[50px] h-[50px] rounded-full justify-center items-center mr-3"
                    style={{
                      backgroundColor: colors.primary,
                      shadowColor: colors.primary,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <Text
                      className="text-white text-xl font-bold"
                      style={{ fontFamily: "Ubuntu-Bold" }}
                    >
                      {invitation.profiles?.first_name?.charAt(0).toUpperCase() || "?"}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-xl font-bold mb-1"
                      style={{ color: colors.text, fontFamily: "Ubuntu-Bold" }}
                    >
                      {invitation.trips.title}
                    </Text>
                    <Text
                      className="text-sm"
                      style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
                    >
                      Invitation de {invitation.profiles?.first_name || "Quelqu'un"}{" "}
                      {invitation.profiles?.last_name || ""}
                    </Text>
                  </View>
                </View>

                {invitation.trips.description && (
                  <Text
                    className="text-sm leading-5 mb-4"
                    style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
                  >
                    {invitation.trips.description}
                  </Text>
                )}

                <View
                  className="flex-row justify-between pt-4 border-t mb-3"
                  style={{ borderTopColor: colors.border }}
                >
                  <View className="flex-1">
                    <Text
                      className="text-xs font-semibold mb-1 uppercase"
                      style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
                    >
                      Date de début
                    </Text>
                    <Text
                      className="text-sm font-medium"
                      style={{ color: colors.text, fontFamily: "Ubuntu-Medium" }}
                    >
                      {formatDate(invitation.trips.start_date)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-xs font-semibold mb-1 uppercase"
                      style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
                    >
                      Date de fin
                    </Text>
                    <Text
                      className="text-sm font-medium"
                      style={{ color: colors.text, fontFamily: "Ubuntu-Medium" }}
                    >
                      {formatDate(invitation.trips.end_date)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-xs font-semibold mb-1 uppercase"
                      style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
                    >
                      Budget
                    </Text>
                    <Text
                      className="text-sm font-medium"
                      style={{ color: colors.text, fontFamily: "Ubuntu-Medium" }}
                    >
                      {invitation.trips.budget}€
                    </Text>
                  </View>
                </View>

                <Text
                  className="text-xs mb-4"
                  style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
                >
                  Invitation reçue le {formatDate(invitation.created_at)}
                </Text>

                <View
                  className="flex-row gap-3 pt-4 border-t"
                  style={{ borderTopColor: colors.border }}
                >
                  <TouchableOpacity
                    className={`flex-1 py-3.5 rounded-xl items-center justify-center border ${
                      processingId === invitation.id ? "opacity-60" : ""
                    }`}
                    style={{
                      backgroundColor: colors.input,
                      borderColor: colors.border,
                    }}
                    onPress={() =>
                      handleInvitationResponse(invitation.id, invitation.trip_id, "declined")
                    }
                    disabled={processingId === invitation.id}
                    activeOpacity={0.7}
                  >
                    <Text
                      className="text-[15px] font-semibold"
                      style={{ color: colors.text, fontFamily: "Ubuntu-Medium" }}
                    >
                      Décliner
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className={`flex-1 py-3.5 rounded-xl items-center justify-center ${
                      processingId === invitation.id ? "opacity-60" : ""
                    }`}
                    style={{
                      backgroundColor: colors.primary,
                      shadowColor: colors.primary,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                    onPress={() =>
                      handleInvitationResponse(invitation.id, invitation.trip_id, "accepted")
                    }
                    disabled={processingId === invitation.id}
                    activeOpacity={0.8}
                  >
                    {processingId === invitation.id ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text
                        className="text-white text-[15px] font-bold"
                        style={{ fontFamily: "Ubuntu-Bold" }}
                      >
                        Accepter
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
        </ScrollView>
      </View>
    </ResponsiveContainer>
  );
}
