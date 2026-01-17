import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Mail, Send } from "lucide-react-native";
import { useTheme } from "@/src/contexts/ThemeContext";
import { useAuth } from "@/src/contexts/AuthContext";
import {
  createInvitation,
  sendInvitationEmail,
} from "@/src/services/invitationService";

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
  const { theme, colors } = useTheme();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const sendInvitation = async () => {
    if (!email.trim()) {
      setError("Veuillez saisir un email");
      return;
    }

    if (!user) {
      setError("Vous devez être connecté pour envoyer une invitation");
      return;
    }

    // Validation basique de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Veuillez saisir un email valide");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("📧 Envoi d'invitation...");

      // 1. Créer l'invitation dans Supabase
      const invitationData = await createInvitation(
        tripId,
        user.id,
        email.trim()
      );

      console.log("✅ Invitation créée avec succès !");

      // 2. Envoyer l'email d'invitation (optionnel, ne bloque pas si ça échoue)
      try {
        const inviterEmail = user.email || "";
        await sendInvitationEmail(tripName, inviterEmail, email.trim(), tripId);
        console.log("✅ Email envoyé avec succès !");
        setSuccess(`Invitation envoyée à ${email.trim()} ! Email d'invitation envoyé.`);
      } catch (emailError: any) {
        console.warn("⚠️ Erreur envoi email (non bloquant):", emailError);
        setSuccess(
          `Invitation créée pour ${email.trim()} ! (Note: L'envoi d'email nécessite la configuration de Resend)`
        );
      }

      setEmail("");
      if (onInvitationSent) {
        onInvitationSent();
      }
    } catch (error: any) {
      console.error("💥 Erreur envoi invitation:", error);
      
      // Gestion des erreurs spécifiques
      if (error.code === "23505") {
        setError("Cette personne a déjà été invitée à ce voyage");
      } else if (error.message?.includes("duplicate")) {
        setError("Cette personne a déjà été invitée à ce voyage");
      } else {
        setError(error.message || "Une erreur est survenue lors de l'envoi de l'invitation");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          shadowColor: colors.shadow,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.primaryLight },
            ]}
          >
            <Mail size={24} color={colors.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.text }]}>
              Inviter quelqu'un
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Voyage : {tripName}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text
            style={[styles.label, { color: colors.textSecondary }]}
          >
            Email de l'invité
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.input,
                borderColor: colors.inputBorder,
                color: colors.text,
                shadowColor: colors.shadow,
              },
            ]}
            placeholder="ami@exemple.com"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              if (error) setError("");
              if (success) setSuccess("");
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
            },
            (isLoading || !email.trim()) && styles.sendButtonDisabled,
          ]}
          onPress={sendInvitation}
          disabled={isLoading || !email.trim()}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Send size={18} color="#ffffff" />
              <Text style={styles.sendButtonText}>Envoyer l'invitation</Text>
            </>
          )}
        </TouchableOpacity>

        {success && (
          <View
            style={[
              styles.messageContainer,
              {
                backgroundColor: colors.success + "20",
                borderColor: colors.success,
              },
            ]}
          >
            <Text style={[styles.successText, { color: colors.success }]}>
              {success}
            </Text>
          </View>
        )}

        {error && (
          <View
            style={[
              styles.messageContainer,
              {
                backgroundColor: colors.error + "20",
                borderColor: colors.error,
              },
            ]}
          >
            <Text style={[styles.errorText, { color: colors.error }]}>
              {error}
            </Text>
          </View>
        )}
      </View>

      <View
        style={[
          styles.infoBox,
          {
            backgroundColor: colors.primaryLight + "40",
            borderColor: colors.primary + "40",
          },
        ]}
      >
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          <Text style={{ fontWeight: "700" }}>💡 Note importante :</Text>{" "}
          Pour envoyer des invitations par email, vous devez configurer Resend
          dans Supabase Edge Functions. L'invitation sera créée dans la base de
          données même si l'email n'est pas envoyé.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
    marginBottom: 20,
  },
  header: {
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Ubuntu-Bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Ubuntu-Regular",
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    marginBottom: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Ubuntu-Medium",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 15,
    fontSize: 16,
    fontFamily: "Ubuntu-Regular",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Ubuntu-Bold",
  },
  messageContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  successText: {
    fontSize: 14,
    fontFamily: "Ubuntu-Regular",
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    fontFamily: "Ubuntu-Regular",
    textAlign: "center",
  },
  infoBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 12,
    fontFamily: "Ubuntu-Regular",
    lineHeight: 18,
  },
});
