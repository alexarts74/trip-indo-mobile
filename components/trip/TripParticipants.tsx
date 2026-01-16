import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../../src/contexts/ThemeContext";

interface TripParticipantsProps {
  tripId: string;
  tripName: string;
  currentUserId: string;
}

export default function TripParticipants({
  tripId,
  tripName,
  currentUserId,
}: TripParticipantsProps) {
  const { colors } = useTheme();
  
  const handleInviteParticipant = () => {
    // TODO: Implémenter l'invitation de participant
    console.log("Inviter un participant");
  };

  return (
    <View style={styles.container}>
      {/* Carte d'en-tête */}
      <View style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, shadowColor: colors.shadow }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Gestion des participants</Text>
          <Text style={[styles.headerDescription, { color: colors.textSecondary }]}>
            Invitez et gérez les membres de votre équipe de voyage
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.inviteButton, { backgroundColor: colors.primary }]}
          onPress={handleInviteParticipant}
          activeOpacity={0.8}
        >
          <Text style={styles.inviteButtonIcon}>+</Text>
          <Text style={styles.inviteButtonText}>Inviter</Text>
        </TouchableOpacity>
      </View>

      {/* Carte placeholder moderne */}
      <View style={[styles.placeholderCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, shadowColor: colors.shadow }]}>
        <View style={[styles.placeholderIconContainer, { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" }]}>
          <Text style={styles.placeholderIcon}>👥</Text>
        </View>
        <Text style={[styles.placeholderTitle, { color: colors.text }]}>Fonctionnalité à venir</Text>
        <Text style={[styles.placeholderDescription, { color: colors.textSecondary }]}>
          La gestion complète des participants sera bientôt disponible pour{" "}
          <Text style={[styles.tripName, { color: colors.primary }]}>{tripName}</Text>
        </Text>
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIconContainer, { backgroundColor: colors.success + "20" }]}>
              <Text style={[styles.featureIcon, { color: colors.success }]}>✓</Text>
            </View>
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>Invitation par email</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIconContainer, { backgroundColor: colors.success + "20" }]}>
              <Text style={[styles.featureIcon, { color: colors.success }]}>✓</Text>
            </View>
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>Gestion des rôles</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIconContainer, { backgroundColor: colors.success + "20" }]}>
              <Text style={[styles.featureIcon, { color: colors.success }]}>✓</Text>
            </View>
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>Liste des participants</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIconContainer, { backgroundColor: colors.success + "20" }]}>
              <Text style={[styles.featureIcon, { color: colors.success }]}>✓</Text>
            </View>
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>Notifications d'invitation</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  headerCard: {
    borderRadius: 20,
    padding: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
  },
  headerContent: {
    flex: 1,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  headerDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  inviteButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#f97316",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  inviteButtonIcon: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    marginRight: 6,
  },
  inviteButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  placeholderCard: {
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
  placeholderIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 3,
  },
  placeholderIcon: {
    fontSize: 56,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  placeholderDescription: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  tripName: {
    fontWeight: "600",
  },
  featuresList: {
    width: "100%",
    gap: 16,
    marginTop: 8,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  featureIcon: {
    fontSize: 16,
    fontWeight: "700",
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
});
