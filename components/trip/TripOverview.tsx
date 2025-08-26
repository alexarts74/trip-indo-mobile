import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Trip } from "../../src/types/trip";
import { Destination } from "../../src/types/destination";
import {
  colors,
  spacing,
  borderRadius,
  shadows,
} from "../../src/constants/theme";
import TripStats from "./TripStats";

interface TripOverviewProps {
  trip: Trip;
  destinations: Destination[];
  isLoading: boolean;
  error: string;
}

export default function TripOverview({
  trip,
  destinations,
  isLoading,
  error,
}: TripOverviewProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <View style={styles.container}>
      {/* Informations du voyage */}
      <View style={styles.tripInfoCard}>
        <View style={styles.tripHeader}>
          <View style={styles.tripInfo}>
            <Text style={styles.tripTitle}>{trip.title}</Text>
            {trip.description && (
              <Text style={styles.tripDescription}>{trip.description}</Text>
            )}
            <View style={styles.tripMeta}>
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>📅</Text>
                <Text style={styles.metaText}>
                  {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>⏱️</Text>
                <Text style={styles.metaText}>
                  {calculateDuration(trip.start_date, trip.end_date)} jours
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>💰</Text>
                <Text style={styles.metaText}>Budget: {trip.budget}€</Text>
              </View>
            </View>
          </View>
          <View style={styles.destinationsBadge}>
            <Text style={styles.destinationsCount}>
              {destinations.length} destination
              {destinations.length > 1 ? "s" : ""}
            </Text>
          </View>
        </View>
      </View>

      {/* Statistiques du voyage avec TripStats */}
      <TripStats tripId={trip.id} tripBudget={trip.budget} />

      {/* Prochaines étapes */}
      <View style={styles.nextStepsCard}>
        <Text style={styles.nextStepsTitle}>Prochaines étapes</Text>
        <View style={styles.stepsList}>
          <View style={styles.stepItem}>
            <Text style={styles.stepIcon}>🗺️</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Ajouter des destinations</Text>
              <Text style={styles.stepDescription}>
                Commencez par planifier vos lieux de visite
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <Text style={styles.stepIcon}>👥</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Inviter des participants</Text>
              <Text style={styles.stepDescription}>
                Partagez votre voyage avec des amis
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <Text style={styles.stepIcon}>💰</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Gérer les dépenses</Text>
              <Text style={styles.stepDescription}>
                Suivez vos dépenses et remboursements
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  tripInfoCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  tripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  tripInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  tripTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.gray[800],
    marginBottom: spacing.sm,
  },
  tripDescription: {
    fontSize: 16,
    color: colors.gray[600],
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  tripMeta: {
    gap: spacing.sm,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaIcon: {
    marginRight: spacing.sm,
    fontSize: 16,
  },
  metaText: {
    fontSize: 14,
    color: colors.gray[600],
  },
  destinationsBadge: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  destinationsCount: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  statsCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.gray[800],
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statItem: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary[600],
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray[600],
    textAlign: "center",
  },
  budgetProgress: {
    marginTop: spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
    overflow: "hidden",
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontSize: 12,
    color: colors.gray[600],
    textAlign: "center",
  },
  nextStepsCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.gray[800],
    marginBottom: spacing.md,
  },
  stepsList: {
    gap: spacing.md,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepIcon: {
    fontSize: 20,
    marginRight: spacing.md,
    marginTop: 2,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[800],
    marginBottom: spacing.xs,
  },
  stepDescription: {
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 20,
  },
});
