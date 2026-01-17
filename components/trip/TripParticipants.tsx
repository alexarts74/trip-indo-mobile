import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useTheme } from "../../src/contexts/ThemeContext";
import { useAuth } from "../../src/contexts/AuthContext";
import { Users, Check } from "lucide-react-native";
import InvitationManager from "./InvitationManager";

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
  const { user } = useAuth();
  const [showInvitationManager, setShowInvitationManager] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Invitation Manager */}
      <InvitationManager
        tripId={tripId}
        tripName={tripName}
        onInvitationSent={() => {
          setShowInvitationManager(false);
          // Optionnel: rafraîchir la liste des participants
        }}
      />

      {/* Carte placeholder moderne */}
      <View style={[styles.placeholderCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, shadowColor: colors.shadow }]}>
        <View style={[styles.placeholderIconContainer, { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" }]}>
          <Users size={56} color={colors.primary} />
        </View>
        <Text style={[styles.placeholderTitle, { color: colors.text }]}>Gestion des participants</Text>
        <Text style={[styles.placeholderDescription, { color: colors.textSecondary }]}>
          Les participants acceptant votre invitation apparaîtront ici pour{" "}
          <Text style={[styles.tripName, { color: colors.primary }]}>{tripName}</Text>
        </Text>
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIconContainer, { backgroundColor: colors.success + "20" }]}>
              <Check size={16} color={colors.success} />
            </View>
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>Invitation par email</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIconContainer, { backgroundColor: colors.success + "20" }]}>
              <Check size={16} color={colors.success} />
            </View>
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>Gestion des rôles</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIconContainer, { backgroundColor: colors.success + "20" }]}>
              <Check size={16} color={colors.success} />
            </View>
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>Liste des participants</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIconContainer, { backgroundColor: colors.success + "20" }]}>
              <Check size={16} color={colors.success} />
            </View>
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>Notifications d'invitation</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
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
  placeholderTitle: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "Ubuntu-Bold",
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  placeholderDescription: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
    fontFamily: "Ubuntu-Regular",
  },
  tripName: {
    fontWeight: "600",
    fontFamily: "Ubuntu-Medium",
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
  featureText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    fontFamily: "Ubuntu-Medium",
  },
});
