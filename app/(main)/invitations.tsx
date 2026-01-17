import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar
          barStyle={theme === "dark" ? "light-content" : "dark-content"}
          backgroundColor={colors.surface}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Chargement des invitations...
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
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Mes invitations</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Gérez vos invitations aux voyages
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {error && (
          <View
            style={[
              styles.errorContainer,
              {
                backgroundColor: colors.error + "20",
                borderColor: colors.error,
              },
            ]}
          >
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          </View>
        )}

        {invitations.length === 0 ? (
          <View
            style={[
              styles.emptyContainer,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                shadowColor: colors.shadow,
              },
            ]}
          >
            <View style={[styles.emptyIconContainer, { backgroundColor: colors.input }]}>
              <Mail size={48} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Aucune invitation en attente
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Vous n'avez pas d'invitations en attente pour le moment.
            </Text>
          </View>
        ) : (
          <View style={styles.invitationsList}>
            {invitations.map((invitation) => (
              <View
                key={invitation.id}
                style={[
                  styles.invitationCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                    shadowColor: colors.shadow,
                  },
                ]}
              >
                <View style={styles.invitationHeader}>
                  <View
                    style={[
                      styles.avatarContainer,
                      {
                        backgroundColor: colors.primary,
                        shadowColor: colors.primary,
                      },
                    ]}
                  >
                    <Text style={styles.avatarText}>
                      {invitation.profiles.first_name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.invitationInfo}>
                    <Text style={[styles.tripName, { color: colors.text }]}>
                      {invitation.trips.name}
                    </Text>
                    <Text style={[styles.inviterName, { color: colors.textSecondary }]}>
                      Invitation de {invitation.profiles.first_name}{" "}
                      {invitation.profiles.last_name}
                    </Text>
                  </View>
                </View>

                {invitation.trips.description && (
                  <Text style={[styles.tripDescription, { color: colors.textSecondary }]}>
                    {invitation.trips.description}
                  </Text>
                )}

                <View style={[styles.tripDetails, { borderTopColor: colors.border }]}>
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      Date de début
                    </Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {formatDate(invitation.trips.start_date)}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      Date de fin
                    </Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {formatDate(invitation.trips.end_date)}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      Budget
                    </Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {invitation.trips.budget}€
                    </Text>
                  </View>
                </View>

                <Text style={[styles.invitationDate, { color: colors.textSecondary }]}>
                  Invitation reçue le {formatDate(invitation.created_at)}
                </Text>

                <View style={[styles.actionsContainer, { borderTopColor: colors.border }]}>
                  <TouchableOpacity
                    style={[
                      styles.declineButton,
                      {
                        backgroundColor: colors.input,
                        borderColor: colors.border,
                      },
                      processingId === invitation.id && styles.buttonDisabled,
                    ]}
                    onPress={() =>
                      handleInvitationResponse(invitation.id, invitation.trip_id, "declined")
                    }
                    disabled={processingId === invitation.id}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.declineButtonText, { color: colors.text }]}>
                      Décliner
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.acceptButton,
                      {
                        backgroundColor: colors.primary,
                        shadowColor: colors.primary,
                      },
                      processingId === invitation.id && styles.buttonDisabled,
                    ]}
                    onPress={() =>
                      handleInvitationResponse(invitation.id, invitation.trip_id, "accepted")
                    }
                    disabled={processingId === invitation.id}
                    activeOpacity={0.8}
                  >
                    {processingId === invitation.id ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={styles.acceptButtonText}>Accepter</Text>
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
    fontFamily: "Ubuntu-Regular",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
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
    fontFamily: "Ubuntu-Bold",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: "Ubuntu-Regular",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  errorContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Ubuntu-Regular",
  },
  emptyContainer: {
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Ubuntu-Bold",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: "center",
    fontFamily: "Ubuntu-Regular",
  },
  invitationsList: {
    gap: 16,
  },
  invitationCard: {
    borderRadius: 20,
    padding: 24,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
  },
  invitationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Ubuntu-Bold",
  },
  invitationInfo: {
    flex: 1,
  },
  tripName: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Ubuntu-Bold",
    marginBottom: 4,
  },
  inviterName: {
    fontSize: 14,
    fontFamily: "Ubuntu-Regular",
  },
  tripDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    fontFamily: "Ubuntu-Regular",
  },
  tripDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTopWidth: 1,
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Ubuntu-Medium",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Ubuntu-Medium",
  },
  invitationDate: {
    fontSize: 12,
    marginBottom: 16,
    fontFamily: "Ubuntu-Regular",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  declineButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  declineButtonText: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Ubuntu-Medium",
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  acceptButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "Ubuntu-Bold",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
