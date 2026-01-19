import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { ArrowLeft, Mail } from "lucide-react-native";
import { router } from "expo-router";
import { useTheme } from "@/src/contexts/ThemeContext";
import { useAuth } from "@/src/contexts/AuthContext";
import { invitationService, Invitation } from "@/src/services/invitationService";
import { supabase } from "@/src/lib/supabaseClient";

export default function InvitationsScreen() {
  const { theme, colors } = useTheme();
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email) {
      fetchInvitations();
    }
  }, [user]);

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
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.surface}
      />

      {/* Header */}
      <View
        className="pt-[50px] pb-4 px-5 flex-row items-center border-b"
        style={{
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
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
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
              className="text-[15px] text-center"
              style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
            >
              Vous n'avez pas d'invitations en attente pour le moment.
            </Text>
          </View>
        ) : (
          <View className="gap-4">
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
                      {invitation.profiles.first_name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-xl font-bold mb-1"
                      style={{ color: colors.text, fontFamily: "Ubuntu-Bold" }}
                    >
                      {invitation.trips.name}
                    </Text>
                    <Text
                      className="text-sm"
                      style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
                    >
                      Invitation de {invitation.profiles.first_name}{" "}
                      {invitation.profiles.last_name}
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
  );
}
