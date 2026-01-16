import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
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
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable style={styles.backdrop} onPress={onClose}>
          <View style={styles.backdropPlaceholder} />
        </Pressable>
        
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                shadowColor: colors.shadow,
              },
            ]}
          >
            {/* Poignée de drag */}
            <View style={styles.dragHandleContainer}>
              <View style={[styles.dragHandle, { backgroundColor: colors.textSecondary + "40" }]} />
            </View>

            {/* Header avec gradient effect */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View style={styles.headerIconContainer}>
                <View style={[styles.headerIcon, { backgroundColor: colors.primary + "20" }]}>
                  <Text style={styles.headerIconEmoji}>📍</Text>
                </View>
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Ajouter une destination
                </Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                  Remplissez les informations ci-dessous
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: colors.input }]}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={[styles.closeIcon, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Nom de la destination */}
              <View style={styles.inputContainer}>
                <View style={styles.labelContainer}>
                  <Text style={[styles.labelIcon, { color: colors.primary }]}>🏷️</Text>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>
                    Nom de la destination *
                  </Text>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.input,
                      borderColor: focusedField === "name" ? colors.primary : colors.inputBorder,
                      color: colors.text,
                      shadowColor: colors.shadow,
                    },
                    focusedField === "name" && styles.inputFocused,
                  ]}
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
              <View style={styles.inputContainer}>
                <View style={styles.labelContainer}>
                  <Text style={[styles.labelIcon, { color: colors.primary }]}>📝</Text>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Description</Text>
                </View>
                <TextInput
                  style={[
                    styles.textArea,
                    {
                      backgroundColor: colors.input,
                      borderColor: focusedField === "description" ? colors.primary : colors.inputBorder,
                      color: colors.text,
                      shadowColor: colors.shadow,
                    },
                    focusedField === "description" && styles.inputFocused,
                  ]}
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
              <View style={styles.inputContainer}>
                <View style={styles.labelContainer}>
                  <Text style={[styles.labelIcon, { color: colors.primary }]}>🌍</Text>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Pays *</Text>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.input,
                      borderColor: focusedField === "country" ? colors.primary : colors.inputBorder,
                      color: colors.text,
                      shadowColor: colors.shadow,
                    },
                    focusedField === "country" && styles.inputFocused,
                  ]}
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
              <View style={styles.inputContainer}>
                <View style={styles.labelContainer}>
                  <Text style={[styles.labelIcon, { color: colors.primary }]}>💰</Text>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>
                    Coût estimé (€) *
                  </Text>
                </View>
                <View style={styles.priceInputContainer}>
                  <TextInput
                    style={[
                      styles.priceInput,
                      {
                        backgroundColor: colors.input,
                        borderColor: focusedField === "price" ? colors.primary : colors.inputBorder,
                        color: colors.text,
                        shadowColor: colors.shadow,
                      },
                      focusedField === "price" && styles.inputFocused,
                    ]}
                    placeholder="800"
                    placeholderTextColor={colors.textSecondary + "80"}
                    value={formData.price}
                    onChangeText={(value) => handleInputChange("price", value)}
                    onFocus={() => setFocusedField("price")}
                    onBlur={() => setFocusedField(null)}
                    keyboardType="numeric"
                  />
                  <View style={[styles.currencyBadge, { backgroundColor: colors.primary + "20" }]}>
                    <Text style={[styles.currencyText, { color: colors.primary }]}>€</Text>
                  </View>
                </View>
              </View>

              {/* Erreur */}
              {error && (
                <View
                  style={[
                    styles.errorContainer,
                    {
                      backgroundColor: colors.error + "15",
                      borderColor: colors.error,
                    },
                  ]}
                >
                  <Text style={styles.errorIcon}>⚠️</Text>
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
                  onPress={onClose}
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
                    <>
                      <Text style={styles.submitButtonText}>Ajouter</Text>
                      <Text style={styles.submitButtonIcon}>✓</Text>
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

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
  },
  backdrop: {
    flex: 1,
  },
  backdropPlaceholder: {
    flex: 1,
  },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: "92%",
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: -8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
  },
  dragHandleContainer: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 4,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerIconContainer: {
    marginRight: 10,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  headerIconEmoji: {
    fontSize: 18,
  },
  headerTextContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  modalSubtitle: {
    fontSize: 12,
    fontWeight: "500",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  closeIcon: {
    fontSize: 18,
    fontWeight: "600",
  },
  scrollView: {
    maxHeight: 500,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  labelIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: "500",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  inputFocused: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  textArea: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: "500",
    minHeight: 80,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: "500",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  currencyBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  currencyText: {
    fontSize: 16,
    fontWeight: "700",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
    marginBottom: 4,
    gap: 8,
  },
  errorIcon: {
    fontSize: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  submitButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
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
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  submitButtonIcon: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
