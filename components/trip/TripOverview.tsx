import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Trip } from "../../src/types/trip";
import { Destination } from "../../src/types/destination";
import { useTheme } from "../../src/contexts/ThemeContext";
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
  const { colors } = useTheme();
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} mois`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      if (remainingMonths > 0) {
        return `${years} an${years > 1 ? 's' : ''} ${remainingMonths} mois`;
      }
      return `${years} an${years > 1 ? 's' : ''}`;
    }
  };

  return (
    <View style={styles.container}>
      {/* Carte principale du voyage */}
      <View style={[styles.tripCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, shadowColor: colors.shadow }]}>
        <View style={styles.tripCardHeader}>
          <View style={styles.tripTitleSection}>
            <Text style={[styles.tripTitle, { color: colors.text }]}>{trip.title}</Text>
            {trip.description && (
              <Text style={[styles.tripDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                {trip.description}
              </Text>
            )}
          </View>
          <View style={[styles.destinationsBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.destinationsCount}>
              {destinations.length}
            </Text>
            <Text style={styles.destinationsLabel}>
              {destinations.length > 1 ? "destinations" : "destination"}
            </Text>
          </View>
        </View>

        <View style={styles.tripMeta}>
          <View style={styles.metaRow}>
            <View style={[styles.metaIconContainer, { backgroundColor: colors.primaryLight }]}>
              <Text style={styles.metaIcon}>📅</Text>
            </View>
            <View style={styles.metaContent}>
              <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Dates</Text>
              <Text style={[styles.metaText, { color: colors.text }]}>
                {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={[styles.metaIconContainer, { backgroundColor: colors.primaryLight }]}>
              <Text style={styles.metaIcon}>⏱️</Text>
            </View>
            <View style={styles.metaContent}>
              <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Durée</Text>
              <Text style={[styles.metaText, { color: colors.text }]}>
                {calculateDuration(trip.start_date, trip.end_date)}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={[styles.metaIconContainer, { backgroundColor: colors.primaryLight }]}>
              <Text style={styles.metaIcon}>💰</Text>
            </View>
            <View style={styles.metaContent}>
              <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Budget</Text>
              <Text style={[styles.metaText, { color: colors.text }]}>{trip.budget}€</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Statistiques du voyage */}
      <TripStats tripId={trip.id} tripBudget={trip.budget} />

      {/* Prochaines étapes */}
      <View style={[styles.nextStepsCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, shadowColor: colors.shadow }]}>
        <Text style={[styles.nextStepsTitle, { color: colors.text }]}>Prochaines étapes</Text>
        <View style={styles.stepsList}>
          <View style={styles.stepItem}>
            <View style={[styles.stepIconContainer, { backgroundColor: colors.card }]}>
              <Text style={styles.stepIcon}>🗺️</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>Ajouter des destinations</Text>
              <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                Commencez par planifier vos lieux de visite
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={[styles.stepIconContainer, { backgroundColor: colors.card }]}>
              <Text style={styles.stepIcon}>👥</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>Inviter des participants</Text>
              <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                Partagez votre voyage avec des amis
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={[styles.stepIconContainer, { backgroundColor: colors.card }]}>
              <Text style={styles.stepIcon}>💰</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>Gérer les dépenses</Text>
              <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
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
    gap: 20,
  },
  tripCard: {
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
  tripCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  tripTitleSection: {
    flex: 1,
    marginRight: 16,
  },
  tripTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  tripDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
  destinationsBadge: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
    shadowColor: "#f97316",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  destinationsCount: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
  },
  destinationsLabel: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
    opacity: 0.9,
  },
  tripMeta: {
    gap: 16,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  metaIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  metaIcon: {
    fontSize: 18,
  },
  metaContent: {
    flex: 1,
    paddingTop: 2,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metaText: {
    fontSize: 15,
    fontWeight: "500",
  },
  nextStepsCard: {
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
  nextStepsTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  stepsList: {
    gap: 20,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  stepIcon: {
    fontSize: 20,
  },
  stepContent: {
    flex: 1,
    paddingTop: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});
