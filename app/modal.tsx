import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/src/contexts/ThemeContext";
import { tripService } from "@/src/services/tripService";
import { supabase } from "@/src/lib/supabaseClient";

export default function CreateTripModal() {
  const { theme, colors } = useTheme();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    budget: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!formData.title || !formData.startDate || !formData.endDate || !formData.budget) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      // Créer le voyage
      const tripData = await tripService.createTrip({
        title: formData.title,
        description: formData.description,
        start_date: formData.startDate,
        end_date: formData.endDate,
        budget: parseFloat(formData.budget),
      });

      // Ajouter le créateur comme propriétaire du voyage
      const { error: participantError } = await supabase
        .from("trip_participants")
        .insert([
          {
            trip_id: tripData.id,
            user_id: user.id,
            role: "owner",
          },
        ]);

      if (participantError) throw participantError;

      // Fermer le modal et retourner à la liste
      router.back();
    } catch (error: any) {
      console.error("Erreur création voyage:", error);
      setError(error.message || "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (error) setError("");
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.surface}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={[styles.closeIcon, { color: colors.text }]}>✕</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Créer un nouveau voyage</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Planifiez votre prochaine aventure
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          {/* Nom du voyage */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Nom du voyage *
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
              placeholder="Ex: Bali & Java 2024"
              placeholderTextColor={colors.textSecondary}
              value={formData.title}
              onChangeText={(value) => handleInputChange("title", value)}
              autoCapitalize="words"
            />
          </View>

          {/* Description */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Description</Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                  shadowColor: colors.shadow,
                },
              ]}
              placeholder="Décrivez votre voyage..."
              placeholderTextColor={colors.textSecondary}
              value={formData.description}
              onChangeText={(value) => handleInputChange("description", value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Dates */}
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Date de début *</Text>
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
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSecondary}
                value={formData.startDate}
                onChangeText={(value) => handleInputChange("startDate", value)}
              />
            </View>

            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Date de fin *</Text>
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
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSecondary}
                value={formData.endDate}
                onChangeText={(value) => handleInputChange("endDate", value)}
              />
            </View>
          </View>

          {/* Budget */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Budget estimé (€) *
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
              placeholder="3500"
              placeholderTextColor={colors.textSecondary}
              value={formData.budget}
              onChangeText={(value) => handleInputChange("budget", value)}
              keyboardType="numeric"
            />
          </View>

          {/* Erreur */}
          {error && (
            <View
              style={[
                styles.errorContainer,
                {
                  backgroundColor: colors.error + "20",
                  borderColor: colors.error,
                },
              ]}
            >
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          )}

          {/* Boutons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[
                styles.cancelButton,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  backgroundColor: colors.primary,
                  shadowColor: colors.primary,
                },
                isLoading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>Créer le voyage</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  closeIcon: {
    fontSize: 24,
    fontWeight: "600",
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  formContainer: {
    gap: 20,
  },
  inputContainer: {
    marginBottom: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 15,
    fontSize: 16,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 15,
    fontSize: 16,
    minHeight: 100,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  row: {
    flexDirection: "row",
  },
  errorContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
