import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  colors,
  spacing,
  borderRadius,
  shadows,
} from "../../src/constants/theme";
import { Mail } from "lucide-react-native";

interface TripInvitationsProps {
  tripId: string;
  tripName: string;
  currentUserId: string;
}

export default function TripInvitations({
  tripId,
  tripName,
  currentUserId,
}: TripInvitationsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.placeholderCard}>
        <Mail size={48} color={colors.gray[600]} />
        <Text style={styles.placeholderTitle}>Gestion des invitations</Text>
        <Text style={styles.placeholderDescription}>
          Fonctionnalité à implémenter pour {tripName}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  placeholderCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xxxl,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.gray[200],
    alignItems: "center",
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "Ubuntu-Medium",
    color: colors.gray[800],
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  placeholderDescription: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: "center",
    fontFamily: "Ubuntu-Regular",
  },
});
