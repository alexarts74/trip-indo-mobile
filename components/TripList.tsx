import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { tripService } from "../src/services/tripService";
import { Trip } from "../src/types/trip";
import { useTheme } from "../src/contexts/ThemeContext";

interface TripListProps {
  onTripSelect: (trip: Trip) => void;
}

export default function TripList({ onTripSelect }: TripListProps) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { colors } = useTheme();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setIsLoading(true);
      const data = await tripService.getUserTrips();
      setTrips(data);
      setError("");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateTripPage = () => {
    router.push("/modal");
  };

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

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.error + "20", borderColor: colors.error }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>Erreur: {error}</Text>
      </View>
    );
  }

  if (trips.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Text style={styles.emptyEmoji}>🌏</Text>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Aucun voyage créé</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          Commencez par créer votre premier voyage !
        </Text>
        <TouchableOpacity
          style={[styles.emptyButton, { backgroundColor: colors.primary }]}
          onPress={openCreateTripPage}
          activeOpacity={0.8}
        >
          <Text style={styles.emptyButtonText}>Créer mon premier voyage</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Mes voyages</Text>
        <TouchableOpacity
          style={[styles.newTripButton, { backgroundColor: colors.primary }]}
          onPress={openCreateTripPage}
          activeOpacity={0.8}
        >
          <Text style={styles.newTripButtonText}>+ Nouveau</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tripsContainer}>
        {trips.map((trip, index) => (
          <TouchableOpacity
            key={trip.id}
            style={[
              styles.tripCard,
              { 
                backgroundColor: colors.card, 
                borderColor: colors.cardBorder,
                shadowColor: colors.shadow,
              },
              index === trips.length - 1 && styles.lastCard,
            ]}
            onPress={() => {
              console.log(
                "🔄 TripList - Clic sur voyage:",
                trip.title,
                "ID:",
                trip.id
              );
              onTripSelect(trip);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
                <Text style={styles.iconEmoji}>✈️</Text>
              </View>
              <View style={[styles.durationBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.durationText, { color: colors.textSecondary }]}>
                  {calculateDuration(trip.start_date, trip.end_date)}
                </Text>
              </View>
            </View>

            <Text style={[styles.tripTitle, { color: colors.text }]} numberOfLines={2}>
              {trip.title}
            </Text>

            {trip.description && (
              <Text style={[styles.tripDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                {trip.description}
              </Text>
            )}

            <View style={styles.tripInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>📅</Text>
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>💰</Text>
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>Budget: {trip.budget}€</Text>
              </View>
            </View>

            <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
              <Text style={[styles.footerText, { color: colors.primary }]}>
                Voir les détails →
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
  },
  errorContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  errorText: {
    textAlign: "center",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 64,
    paddingHorizontal: 24,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 15,
    marginBottom: 32,
    textAlign: "center",
  },
  emptyButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#f97316",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  newTripButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
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
  newTripButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  tripsContainer: {
    gap: 16,
  },
  tripCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
  },
  lastCard: {
    marginBottom: 0,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  iconEmoji: {
    fontSize: 24,
  },
  durationBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  durationText: {
    fontSize: 12,
    fontWeight: "600",
  },
  tripTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    lineHeight: 26,
  },
  tripDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  tripInfo: {
    gap: 10,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  cardFooter: {
    borderTopWidth: 1,
    paddingTop: 16,
    marginTop: 4,
  },
  footerText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
