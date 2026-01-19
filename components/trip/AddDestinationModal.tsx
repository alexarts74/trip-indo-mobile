import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Animated,
} from "react-native";
import { useTheme } from "../../src/contexts/ThemeContext";
import { supabase } from "../../src/lib/supabaseClient";
import { destinationsService } from "../../src/services/destinationsService";
import { MapPin, Tag, FileText, Globe, Wallet, AlertTriangle, X, Check } from "lucide-react-native";

interface AddDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  onDestinationAdded: () => void;
}

export default function AddDestinationModal({
  isOpen,
  onClose,
  tripId,
  onDestinationAdded,
}: AddDestinationModalProps) {
  const { theme, colors } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    country: "",
    price: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const slideAnim = React.useRef(new Animated.Value(600)).current;

  React.useEffect(() => {
    if (isOpen) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 600,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.country || !formData.price) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { error: placeError } = await supabase.from("destinations").insert([
        {
          trip_id: tripId,
          name: formData.name,
          description: formData.description,
          country: formData.country,
          price: parseFloat(formData.price),
        },
      ]);

      if (placeError) throw placeError;

      // Envoyer une notification aux autres participants
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // Récupérer le profil de l'utilisateur pour le nom
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, last_name, email")
          .eq("id", user.id)
          .single();

        let userName = "Un participant";
        if (profile) {
          if (profile.first_name && profile.last_name) {
            userName = `${profile.first_name} ${profile.last_name}`;
          } else if (profile.first_name) {
            userName = profile.first_name;
          } else if (profile.email) {
            userName = profile.email.split("@")[0];
          }
        }

        await destinationsService.notifyDestinationAdded(
          tripId,
          user.id,
          userName,
          formData.name
        );
      }

      // Réinitialiser le formulaire
      setFormData({
        name: "",
        description: "",
        country: "",
        price: "",
      });

      onDestinationAdded();
      onClose();
    } catch (error: any) {
      setError(error.message);
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
    <Modal
      visible={isOpen}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        className="flex-1 bg-black/75"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable className="flex-1" onPress={onClose}>
          <View className="flex-1" />
        </Pressable>
        
        <Animated.View
          className="absolute bottom-0 left-0 right-0 max-h-[92%]"
          style={{
            transform: [{ translateY: slideAnim }],
          }}
        >
          <View
            className="rounded-t-[28px] border"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: -8 },
              shadowOpacity: 0.4,
              shadowRadius: 20,
              elevation: 20,
            }}
          >
            {/* Poignée de drag */}
            <View className="items-center pt-3 pb-1">
              <View
                className="w-10 h-1 rounded-sm"
                style={{ backgroundColor: colors.textSecondary + "40" }}
              />
            </View>

            {/* Header avec gradient effect */}
            <View
              className="flex-row items-center px-5 pt-2 pb-4 border-b"
              style={{ borderBottomColor: colors.border }}
            >
              <View className="mr-2.5">
                <View
                  className="w-9 h-9 rounded-full justify-center items-center"
                  style={{ backgroundColor: colors.primary + "20" }}
                >
                  <MapPin size={18} color={colors.primary} />
                </View>
              </View>
              <View className="flex-1">
                <Text
                  className="text-xl font-bold mb-0.5"
                  style={{
                    color: colors.text,
                    fontFamily: "Ubuntu-Bold",
                    letterSpacing: -0.3,
                  }}
                >
                  Ajouter une destination
                </Text>
                <Text
                  className="text-xs font-medium"
                  style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
                >
                  Remplissez les informations ci-dessous
                </Text>
              </View>
              <TouchableOpacity
                className="w-8 h-8 rounded-full justify-center items-center ml-2.5"
                style={{ backgroundColor: colors.input }}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              className="max-h-[500px]"
              contentContainerStyle={{ padding: 20, paddingBottom: 24 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Nom de la destination */}
              <View className="mb-4">
                <View className="flex-row items-center mb-1.5">
                  <Tag size={14} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text
                    className="text-[13px] font-semibold tracking-wide"
                    style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
                  >
                    Nom de la destination *
                  </Text>
                </View>
                <TextInput
                  className={`border-[1.5px] rounded-xl px-3.5 py-3 text-[15px] font-medium ${
                    focusedField === "name" ? "border-2" : ""
                  }`}
                  style={{
                    backgroundColor: colors.input,
                    borderColor: focusedField === "name" ? colors.primary : colors.inputBorder,
                    color: colors.text,
                    fontFamily: "Ubuntu-Medium",
                    shadowColor: colors.shadow,
                    shadowOffset: focusedField === "name" ? { width: 0, height: 2 } : { width: 0, height: 1 },
                    shadowOpacity: focusedField === "name" ? 0.1 : 0.05,
                    shadowRadius: focusedField === "name" ? 4 : 3,
                    elevation: focusedField === "name" ? 2 : 1,
                  }}
                  placeholder="Ex: Bali - Ubud"
                  placeholderTextColor={colors.textSecondary + "80"}
                  value={formData.name}
                  onChangeText={(value) => handleInputChange("name", value)}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  autoCapitalize="words"
                />
              </View>

              {/* Description */}
              <View className="mb-4">
                <View className="flex-row items-center mb-1.5">
                  <FileText size={14} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text
                    className="text-[13px] font-semibold tracking-wide"
                    style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
                  >
                    Description
                  </Text>
                </View>
                <TextInput
                  className={`border-[1.5px] rounded-xl px-3.5 py-3 text-[15px] font-medium min-h-[80px] ${
                    focusedField === "description" ? "border-2" : ""
                  }`}
                  style={{
                    backgroundColor: colors.input,
                    borderColor: focusedField === "description" ? colors.primary : colors.inputBorder,
                    color: colors.text,
                    fontFamily: "Ubuntu-Medium",
                    shadowColor: colors.shadow,
                    shadowOffset: focusedField === "description" ? { width: 0, height: 2 } : { width: 0, height: 1 },
                    shadowOpacity: focusedField === "description" ? 0.1 : 0.05,
                    shadowRadius: focusedField === "description" ? 4 : 3,
                    elevation: focusedField === "description" ? 2 : 1,
                  }}
                  placeholder="Décrivez cette destination..."
                  placeholderTextColor={colors.textSecondary + "80"}
                  value={formData.description}
                  onChangeText={(value) => handleInputChange("description", value)}
                  onFocus={() => setFocusedField("description")}
                  onBlur={() => setFocusedField(null)}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Pays */}
              <View className="mb-4">
                <View className="flex-row items-center mb-1.5">
                  <Globe size={14} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text
                    className="text-[13px] font-semibold tracking-wide"
                    style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
                  >
                    Pays *
                  </Text>
                </View>
                <TextInput
                  className={`border-[1.5px] rounded-xl px-3.5 py-3 text-[15px] font-medium ${
                    focusedField === "country" ? "border-2" : ""
                  }`}
                  style={{
                    backgroundColor: colors.input,
                    borderColor: focusedField === "country" ? colors.primary : colors.inputBorder,
                    color: colors.text,
                    fontFamily: "Ubuntu-Medium",
                    shadowColor: colors.shadow,
                    shadowOffset: focusedField === "country" ? { width: 0, height: 2 } : { width: 0, height: 1 },
                    shadowOpacity: focusedField === "country" ? 0.1 : 0.05,
                    shadowRadius: focusedField === "country" ? 4 : 3,
                    elevation: focusedField === "country" ? 2 : 1,
                  }}
                  placeholder="Ex: Indonésie"
                  placeholderTextColor={colors.textSecondary + "80"}
                  value={formData.country}
                  onChangeText={(value) => handleInputChange("country", value)}
                  onFocus={() => setFocusedField("country")}
                  onBlur={() => setFocusedField(null)}
                  autoCapitalize="words"
                />
              </View>

              {/* Coût estimé */}
              <View className="mb-4">
                <View className="flex-row items-center mb-1.5">
                  <Wallet size={14} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text
                    className="text-[13px] font-semibold tracking-wide"
                    style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
                  >
                    Coût estimé (€) *
                  </Text>
                </View>
                <View className="flex-row items-center gap-2.5">
                  <TextInput
                    className={`flex-1 border-[1.5px] rounded-xl px-3.5 py-3 text-[15px] font-medium ${
                      focusedField === "price" ? "border-2" : ""
                    }`}
                    style={{
                      backgroundColor: colors.input,
                      borderColor: focusedField === "price" ? colors.primary : colors.inputBorder,
                      color: colors.text,
                      fontFamily: "Ubuntu-Medium",
                      shadowColor: colors.shadow,
                      shadowOffset: focusedField === "price" ? { width: 0, height: 2 } : { width: 0, height: 1 },
                      shadowOpacity: focusedField === "price" ? 0.1 : 0.05,
                      shadowRadius: focusedField === "price" ? 4 : 3,
                      elevation: focusedField === "price" ? 2 : 1,
                    }}
                    placeholder="800"
                    placeholderTextColor={colors.textSecondary + "80"}
                    value={formData.price}
                    onChangeText={(value) => handleInputChange("price", value)}
                    onFocus={() => setFocusedField("price")}
                    onBlur={() => setFocusedField(null)}
                    keyboardType="numeric"
                  />
                  <View
                    className="w-10 h-10 rounded-full justify-center items-center"
                    style={{ backgroundColor: colors.primary + "20" }}
                  >
                    <Text
                      className="text-base font-bold"
                      style={{ color: colors.primary, fontFamily: "Ubuntu-Bold" }}
                    >
                      €
                    </Text>
                  </View>
                </View>
              </View>

              {/* Erreur */}
              {error && (
                <View
                  className="flex-row items-center border rounded-[10px] p-3 mt-1 mb-1 gap-2"
                  style={{
                    backgroundColor: colors.error + "15",
                    borderColor: colors.error,
                  }}
                >
                  <AlertTriangle size={16} color={colors.error} />
                  <Text
                    className="flex-1 text-[13px] font-semibold"
                    style={{ color: colors.error, fontFamily: "Ubuntu-Medium" }}
                  >
                    {error}
                  </Text>
                </View>
              )}

              {/* Boutons */}
              <View
                className="flex-row gap-2.5 mt-3 pt-4 border-t"
                style={{ borderTopColor: "rgba(255, 255, 255, 0.1)" }}
              >
                <TouchableOpacity
                  className="flex-1 py-3.5 rounded-xl items-center justify-center border-[1.5px]"
                  style={{
                    backgroundColor: colors.input,
                    borderColor: colors.border,
                  }}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text
                    className="text-[15px] font-semibold tracking-wide"
                    style={{ color: colors.text, fontFamily: "Ubuntu-Medium" }}
                  >
                    Annuler
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`flex-1 flex-row items-center justify-center gap-1.5 py-3.5 rounded-xl ${
                    isLoading ? "opacity-60" : ""
                  }`}
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
                    <>
                      <Text
                        className="text-white text-[15px] font-bold tracking-wide"
                        style={{ fontFamily: "Ubuntu-Bold" }}
                      >
                        Ajouter
                      </Text>
                      <Check size={16} color="#ffffff" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
