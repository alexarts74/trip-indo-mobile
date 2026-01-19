import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Mail, Send } from "lucide-react-native";
import { useTheme } from "@/src/contexts/ThemeContext";
import { useAuth } from "@/src/contexts/AuthContext";
import { useInvitationSender } from "@/src/hooks/useInvitationSender";

interface InvitationManagerProps {
  tripId: string;
  tripName: string;
  onInvitationSent?: () => void;
}

export default function InvitationManager({
  tripId,
  tripName,
  onInvitationSent,
}: InvitationManagerProps) {
  const { colors } = useTheme();
  const { user } = useAuth();

  const {
    email,
    setEmail,
    isLoading,
    success,
    error,
    sendInvitation,
  } = useInvitationSender({
    tripId,
    tripName,
    user,
    onSuccess: onInvitationSent,
  });

  const handleEmailChange = (value: string) => {
    setEmail(value);
  };

  return (
    <View
      className="rounded-[20px] p-5 mb-5 border"
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
      {/* Header */}
      <View className="mb-5">
        <View className="flex-row items-center">
          <View
            className="w-12 h-12 rounded-full justify-center items-center mr-3"
            style={{ backgroundColor: colors.primaryLight }}
          >
            <Mail size={24} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text
              className="text-xl font-bold mb-1"
              style={{ color: colors.text, fontFamily: "Ubuntu-Bold" }}
            >
              Inviter quelqu'un
            </Text>
            <Text
              className="text-sm"
              style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
            >
              Voyage : {tripName}
            </Text>
          </View>
        </View>
      </View>

      {/* Form */}
      <View className="gap-4">
        {/* Email Input */}
        <View className="mb-1">
          <Text
            className="text-[15px] font-semibold mb-2"
            style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
          >
            Email de l'invité
          </Text>
          <TextInput
            className="border-[1.5px] rounded-[14px] px-[18px] py-[15px] text-base"
            style={{
              backgroundColor: colors.input,
              borderColor: colors.inputBorder,
              color: colors.text,
              fontFamily: "Ubuntu-Regular",
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
            placeholder="ami@exemple.com"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
        </View>

        {/* Send Button */}
        <TouchableOpacity
          className={`flex-row items-center justify-center py-4 rounded-[14px] gap-2 ${
            isLoading || !email.trim() ? "opacity-60" : ""
          }`}
          style={{
            backgroundColor: colors.primary,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}
          onPress={sendInvitation}
          disabled={isLoading || !email.trim()}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <View className="flex-row items-center gap-2">
              <Send size={18} color="#ffffff" />
              <Text
                className="text-white text-base font-bold"
                style={{ fontFamily: "Ubuntu-Bold" }}
              >
                Envoyer l'invitation
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Success Message */}
        {success && (
          <View
            className="border rounded-xl p-4"
            style={{
              backgroundColor: colors.success + "20",
              borderColor: colors.success,
            }}
          >
            <Text
              className="text-sm text-center"
              style={{ color: colors.success, fontFamily: "Ubuntu-Regular" }}
            >
              {success}
            </Text>
          </View>
        )}

        {/* Error Message */}
        {error && (
          <View
            className="border rounded-xl p-4"
            style={{
              backgroundColor: colors.error + "20",
              borderColor: colors.error,
            }}
          >
            <Text
              className="text-sm text-center"
              style={{ color: colors.error, fontFamily: "Ubuntu-Regular" }}
            >
              {error}
            </Text>
          </View>
        )}
      </View>

      {/* Info Box */}
      <View
        className="mt-4 p-3 rounded-xl border"
        style={{
          backgroundColor: colors.primaryLight + "40",
          borderColor: colors.primary + "40",
        }}
      >
        <Text
          className="text-xs leading-[18px]"
          style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
        >
          <Text style={{ fontWeight: "700" }}>💡 Note importante :</Text>{" "}
          Pour envoyer des invitations par email, vous devez configurer Resend
          dans Supabase Edge Functions. L'invitation sera créée dans la base de
          données même si l'email n'est pas envoyé.
        </Text>
      </View>
    </View>
  );
}
