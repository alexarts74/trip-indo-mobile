import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "../../src/contexts/ThemeContext";
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
  const { colors } = useTheme();

  return (
    <View className="gap-5">
      <View
        className="bg-white rounded-2xl p-8 items-center border"
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
        <Mail size={48} color={colors.textSecondary} />
        <Text
          className="text-xl font-semibold mb-2 text-center"
          style={{ color: colors.text, fontFamily: "Ubuntu-Medium" }}
        >
          Gestion des invitations
        </Text>
        <Text
          className="text-base text-center"
          style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
        >
          Fonctionnalité à implémenter pour {tripName}
        </Text>
      </View>
    </View>
  );
}
