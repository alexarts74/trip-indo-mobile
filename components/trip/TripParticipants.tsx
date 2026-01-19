import React, { useState } from "react";
import { View, Text } from "react-native";
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
    <View className="gap-5">
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
      <View
        className="rounded-[20px] p-6 items-center border"
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
        <View
          className="w-20 h-20 rounded-full justify-center items-center mb-5 border-2"
          style={{ backgroundColor: "#eff6ff", borderColor: "#bfdbfe" }}
        >
          <Users size={40} color={colors.primary} />
        </View>
        <Text
          className="text-2xl font-bold mb-3 text-center"
          style={{ color: colors.text, fontFamily: "Ubuntu-Bold", letterSpacing: -0.3 }}
        >
          Gestion des participants
        </Text>
        <Text
          className="text-[15px] text-center leading-[22px] mb-8"
          style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
        >
          Les participants acceptant votre invitation apparaîtront ici pour{" "}
          <Text style={{ fontWeight: "600", fontFamily: "Ubuntu-Medium", color: colors.primary }}>
            {tripName}
          </Text>
        </Text>
        <View className="w-full gap-4 mt-2">
          <View className="flex-row items-center">
            <View
              className="w-8 h-8 rounded-full justify-center items-center mr-3"
              style={{ backgroundColor: colors.success + "20" }}
            >
              <Check size={16} color={colors.success} />
            </View>
            <Text
              className="flex-1 text-[15px] font-medium"
              style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
            >
              Invitation par email
            </Text>
          </View>
          <View className="flex-row items-center">
            <View
              className="w-8 h-8 rounded-full justify-center items-center mr-3"
              style={{ backgroundColor: colors.success + "20" }}
            >
              <Check size={16} color={colors.success} />
            </View>
            <Text
              className="flex-1 text-[15px] font-medium"
              style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
            >
              Gestion des rôles
            </Text>
          </View>
          <View className="flex-row items-center">
            <View
              className="w-8 h-8 rounded-full justify-center items-center mr-3"
              style={{ backgroundColor: colors.success + "20" }}
            >
              <Check size={16} color={colors.success} />
            </View>
            <Text
              className="flex-1 text-[15px] font-medium"
              style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
            >
              Liste des participants
            </Text>
          </View>
          <View className="flex-row items-center">
            <View
              className="w-8 h-8 rounded-full justify-center items-center mr-3"
              style={{ backgroundColor: colors.success + "20" }}
            >
              <Check size={16} color={colors.success} />
            </View>
            <Text
              className="flex-1 text-[15px] font-medium"
              style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
            >
              Notifications d'invitation
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

