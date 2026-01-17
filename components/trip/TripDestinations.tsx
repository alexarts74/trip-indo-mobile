import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Trip } from "../../src/types/trip";
import { Destination } from "../../src/types/destination";
import { useTheme } from "../../src/contexts/ThemeContext";
import AddDestinationModal from "./AddDestinationModal";
import { Map, MapPin, Globe, Wallet } from "lucide-react-native";

interface TripDestinationsProps {
  trip: Trip;
  destinations: Destination[];
  isLoading: boolean;
  error: string;
  onDestinationsUpdate: () => void;
}

export default function TripDestinations({
  trip,
  destinations,
  isLoading,
  error,
  onDestinationsUpdate,
}: TripDestinationsProps) {
  const { colors } = useTheme();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const handleAddDestination = () => {
    setIsAddModalOpen(true);
  };

  const handleDestinationAdded = () => {
    onDestinationsUpdate();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Chargement des destinations...
        </Text>
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

  if (destinations.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Map size={64} color={colors.primary} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Aucune destination ajoutée</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          Commencez par ajouter vos premières destinations !
        </Text>
        <TouchableOpacity
          style={[styles.emptyButton, { backgroundColor: colors.primary }]}
          onPress={handleAddDestination}
          activeOpacity={0.8}
        >
          <Text style={styles.emptyButtonText}>
            Ajouter ma première destination
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* En-tête des destinations */}
      <View style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, shadowColor: colors.shadow }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Destinations du voyage</Text>
          <Text style={[styles.headerDescription, { color: colors.textSecondary }]}>
            Gérez vos lieux de visite et leurs activités
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleAddDestination}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addButtonText}>Ajouter</Text>
        </TouchableOpacity>
      </View>

      {/* Liste des destinations */}
      <View style={styles.destinationsList}>
        {destinations.map((destination) => (
          <View key={destination.id} style={[styles.destinationCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, shadowColor: colors.shadow }]}>
            <View style={styles.destinationContent}>
              <View style={styles.destinationHeader}>
                <View style={styles.destinationTitleSection}>
                  <Text style={[styles.destinationTitle, { color: colors.text }]}>
                  {destination.name}
                </Text>
                {destination.description && (
                    <Text style={[styles.destinationDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                    {destination.description}
                  </Text>
                )}
                </View>
                <View style={styles.destinationPriceSection}>
                  <Text style={[styles.destinationPrice, { color: colors.text }]}>
                    {destination.price || 0}€
                  </Text>
                  {destination.price && (
                    <Text style={[styles.destinationPercentage, { color: colors.textSecondary }]}>
                      {((destination.price / trip.budget) * 100).toFixed(1)}% du budget
                    </Text>
                  )}
                </View>
              </View>

              <View style={[styles.destinationMeta, { borderTopColor: colors.border }]}>
                <View style={styles.metaItem}>
                  <View style={[styles.metaIconContainer, { backgroundColor: colors.card }]}>
                    <MapPin size={16} color={colors.textSecondary} />
                  </View>
                  <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>
                    {destination.address || "Adresse non renseignée"}
                  </Text>
                </View>
                {destination.country && (
                  <View style={styles.metaItem}>
                    <View style={[styles.metaIconContainer, { backgroundColor: colors.card }]}>
                      <Globe size={16} color={colors.textSecondary} />
                    </View>
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                      {destination.country}
                    </Text>
                  </View>
                )}
                {destination.price && (
                  <View style={styles.metaItem}>
                    <View style={[styles.metaIconContainer, { backgroundColor: colors.card }]}>
                      <Wallet size={16} color={colors.textSecondary} />
              </View>
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {destination.price}€
                </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Modal d'ajout de destination */}
      <AddDestinationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        tripId={trip.id}
        onDestinationAdded={handleDestinationAdded}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: "Ubuntu-Regular",
  },
  errorContainer: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Ubuntu-Regular",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 64,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Ubuntu-Bold",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 15,
    marginBottom: 32,
    textAlign: "center",
    fontFamily: "Ubuntu-Regular",
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
    fontFamily: "Ubuntu-Medium",
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
    fontFamily: "Ubuntu-Bold",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  headerDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Ubuntu-Regular",
  },
  addButton: {
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
  addButtonIcon: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Ubuntu-Bold",
    marginRight: 6,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Ubuntu-Medium",
  },
  destinationsList: {
    gap: 16,
  },
  destinationCard: {
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
  destinationContent: {
    gap: 16,
  },
  destinationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  destinationTitleSection: {
    flex: 1,
    marginRight: 16,
  },
  destinationTitle: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Ubuntu-Bold",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  destinationDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Ubuntu-Regular",
  },
  destinationPriceSection: {
    alignItems: "flex-end",
  },
  destinationPrice: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "Ubuntu-Bold",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  destinationPercentage: {
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "Ubuntu-Medium",
  },
  destinationMeta: {
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  metaText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Ubuntu-Medium",
  },
});
