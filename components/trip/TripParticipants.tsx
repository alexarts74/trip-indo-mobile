import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  colors,
  spacing,
  borderRadius,
  shadows,
} from "../../src/constants/theme";

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
  return (
    <View style={styles.container}>
      <View style={styles.placeholderCard}>
        <Text style={styles.placeholderIcon}>👥</Text>
        <Text style={styles.placeholderTitle}>Gestion des participants</Text>
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
  placeholderIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.gray[800],
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  placeholderDescription: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: "center",
  },
});
