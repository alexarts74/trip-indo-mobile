import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/src/contexts/ThemeContext";
import { tripService } from "@/src/services/tripService";
import { supabase } from "@/src/lib/supabaseClient";
import { X } from "lucide-react-native";

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
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.surface}
      />

      {/* Header */}
      <View 
        className="pt-[50px] pb-4 px-5 flex-row items-center border-b"
        style={{ backgroundColor: colors.surface, borderBottomColor: colors.border }}
      >
        <TouchableOpacity
          className="w-10 h-10 justify-center items-center mr-3"
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <X size={20} color={colors.text} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text 
            className="text-2xl font-bold mb-1 font-['Ubuntu-Bold'] tracking-tight"
            style={{ color: colors.text }}
          >
            Créer un nouveau voyage
          </Text>
          <Text 
            className="text-sm font-['Ubuntu-Regular']"
            style={{ color: colors.textSecondary }}
          >
            Planifiez votre prochaine aventure
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-5">
          {/* Nom du voyage */}
          <View className="mb-1">
            <Text 
              className="text-[15px] font-semibold mb-2 font-['Ubuntu-Medium']"
              style={{ color: colors.textSecondary }}
            >
              Nom du voyage *
            </Text>
            <TextInput
              className="border-[1.5px] rounded-[14px] px-[18px] py-[15px] text-base font-['Ubuntu-Regular']"
              style={{
                backgroundColor: colors.input,
                borderColor: colors.inputBorder,
                color: colors.text,
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
              placeholder="Ex: Bali & Java 2024"
              placeholderTextColor={colors.textSecondary}
              value={formData.title}
              onChangeText={(value) => handleInputChange("title", value)}
              autoCapitalize="words"
            />
          </View>

          {/* Description */}
          <View className="mb-1">
            <Text 
              className="text-[15px] font-semibold mb-2 font-['Ubuntu-Medium']"
              style={{ color: colors.textSecondary }}
            >
              Description
            </Text>
            <TextInput
              className="border-[1.5px] rounded-[14px] px-[18px] py-[15px] text-base min-h-[100px] font-['Ubuntu-Regular']"
              style={{
                backgroundColor: colors.input,
                borderColor: colors.inputBorder,
                color: colors.text,
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
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
          <View className="flex-row">
            <View className="flex-1 mr-2 mb-1">
              <Text 
                className="text-[15px] font-semibold mb-2 font-['Ubuntu-Medium']"
                style={{ color: colors.textSecondary }}
              >
                Date de début *
              </Text>
              <TextInput
                className="border-[1.5px] rounded-[14px] px-[18px] py-[15px] text-base font-['Ubuntu-Regular']"
                style={{
                  backgroundColor: colors.input,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                  shadowColor: colors.shadow,
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSecondary}
                value={formData.startDate}
                onChangeText={(value) => handleInputChange("startDate", value)}
              />
            </View>

            <View className="flex-1 ml-2 mb-1">
              <Text 
                className="text-[15px] font-semibold mb-2 font-['Ubuntu-Medium']"
                style={{ color: colors.textSecondary }}
              >
                Date de fin *
              </Text>
              <TextInput
                className="border-[1.5px] rounded-[14px] px-[18px] py-[15px] text-base font-['Ubuntu-Regular']"
                style={{
                  backgroundColor: colors.input,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                  shadowColor: colors.shadow,
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSecondary}
                value={formData.endDate}
                onChangeText={(value) => handleInputChange("endDate", value)}
              />
            </View>
          </View>

          {/* Budget */}
          <View className="mb-1">
            <Text 
              className="text-[15px] font-semibold mb-2 font-['Ubuntu-Medium']"
              style={{ color: colors.textSecondary }}
            >
              Budget estimé (€) *
            </Text>
            <TextInput
              className="border-[1.5px] rounded-[14px] px-[18px] py-[15px] text-base font-['Ubuntu-Regular']"
              style={{
                backgroundColor: colors.input,
                borderColor: colors.inputBorder,
                color: colors.text,
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
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
              className="border rounded-xl p-4 mt-2"
              style={{
                backgroundColor: colors.error + "20",
                borderColor: colors.error,
              }}
            >
              <Text 
                className="text-sm text-center font-['Ubuntu-Regular']"
                style={{ color: colors.error }}
              >
                {error}
              </Text>
            </View>
          )}

          {/* Boutons */}
          <View className="flex-row gap-3 mt-2">
            <TouchableOpacity
              className="flex-1 py-4 rounded-[14px] items-center justify-center border"
              style={{
                backgroundColor: colors.input,
                borderColor: colors.border,
              }}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text 
                className="text-base font-semibold font-['Ubuntu-Medium']"
                style={{ color: colors.text }}
              >
                Annuler
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 py-4 rounded-[14px] items-center justify-center ${isLoading ? 'opacity-60' : ''}`}
              style={{
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-white text-base font-bold font-['Ubuntu-Bold']">
                  Créer le voyage
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

