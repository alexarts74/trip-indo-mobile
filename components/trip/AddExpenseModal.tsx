import React, { useState, useEffect } from "react";
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
import { Wallet, FileText, Euro, Calendar, User, Target, Users, AlertTriangle, X, Car, UtensilsCrossed, ShoppingBag, Crosshair, Hotel, Tag, Check } from "lucide-react-native";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  onExpenseAdded: () => void;
}

interface TripParticipant {
  user_id: string;
  display_name: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

export default function AddExpenseModal({
  isOpen,
  onClose,
  tripId,
  onExpenseAdded,
}: AddExpenseModalProps) {
  const { theme, colors } = useTheme();
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "Transport",
    date: new Date().toISOString().split("T")[0],
    paidBy: "",
    paidFor: "everyone" as "everyone" | "specific",
    specificUserId: "",
  });

  const categories: Category[] = [
    { id: "transport", name: "Transport", icon: "car" },
    { id: "nourriture", name: "Nourriture", icon: "utensils" },
    { id: "shopping", name: "Shopping", icon: "shopping" },
    { id: "activites", name: "Activités", icon: "target" },
    { id: "hebergement", name: "Hébergement", icon: "hotel" },
    { id: "autres", name: "Autres", icon: "tag" },
  ];

  const [tripParticipants, setTripParticipants] = useState<TripParticipant[]>([]);
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
      fetchTripParticipants();
    } else {
      Animated.timing(slideAnim, {
        toValue: 600,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen]);

  const fetchTripParticipants = async () => {
    try {
      const { data: participants, error } = await supabase
        .from("trip_participants")
        .select("user_id, email")
        .eq("trip_id", tripId);

      if (error) {
        console.error("Erreur récupération participants:", error);
        return;
      }

      const simpleParticipants: TripParticipant[] = (participants || []).map((participant) => {
        if (participant.email) {
          return {
            user_id: participant.user_id,
            display_name: participant.email,
          };
        }
        return {
          user_id: participant.user_id,
          display_name: `Utilisateur ${participant.user_id.slice(0, 8)}...`,
        };
      });

      setTripParticipants(simpleParticipants);

      // Définir l'utilisateur connecté comme payeur par défaut
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && !formData.paidBy) {
        setFormData((prev) => ({
          ...prev,
          paidBy: user.id,
        }));
      }
    } catch (error) {
      console.error("Erreur récupération participants:", error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.amount || !formData.paidBy) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (formData.paidFor === "specific" && !formData.specificUserId) {
      setError("Veuillez sélectionner un participant");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      let paidForUserId = null;
      if (formData.paidFor === "specific" && formData.specificUserId) {
        paidForUserId = formData.specificUserId;
      }

      const { error: expenseError } = await supabase.from("expenses").insert({
        trip_id: tripId,
        title: formData.title,
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date,
        paid_by_user_id: formData.paidBy,
        paid_for_user_id: paidForUserId,
      });

      if (expenseError) throw expenseError;

      resetForm();
      onExpenseAdded();
      onClose();
    } catch (error: any) {
      console.error("Erreur création dépense:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setFormData({
      title: "",
      amount: "",
      category: "Transport",
      date: new Date().toISOString().split("T")[0],
      paidBy: user?.id || "",
      paidFor: "everyone",
      specificUserId: "",
    });
    setError("");
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (error) setError("");
  };

  const getDisplayName = (participant: TripParticipant) => {
    return participant.display_name || "Utilisateur inconnu";
  };

  const selectedCategory = categories.find((cat) => cat.name === formData.category);

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

            {/* Header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View style={styles.headerIconContainer}>
                <View style={[styles.headerIcon, { backgroundColor: colors.primary + "20" }]}>
                  <Wallet size={18} color={colors.primary} />
                </View>
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Ajouter une dépense
                </Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                  Enregistrez une nouvelle dépense
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: colors.input }]}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Titre */}
              <View style={styles.inputContainer}>
                <View style={styles.labelContainer}>
                  <FileText size={14} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Titre *</Text>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.input,
                      borderColor: focusedField === "title" ? colors.primary : colors.inputBorder,
                      color: colors.text,
                      shadowColor: colors.shadow,
                    },
                    focusedField === "title" && styles.inputFocused,
                  ]}
                  placeholder="Ex: Taxi vers l'aéroport"
                  placeholderTextColor={colors.textSecondary + "80"}
                  value={formData.title}
                  onChangeText={(value) => handleInputChange("title", value)}
                  onFocus={() => setFocusedField("title")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              {/* Montant et Catégorie */}
              <View style={styles.row}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                  <View style={styles.labelContainer}>
                    <Euro size={14} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text style={[styles.label, { color: colors.textSecondary }]}>
                      Montant (€) *
                    </Text>
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.input,
                        borderColor: focusedField === "amount" ? colors.primary : colors.inputBorder,
                        color: colors.text,
                        shadowColor: colors.shadow,
                      },
                      focusedField === "amount" && styles.inputFocused,
                    ]}
                    placeholder="0.00"
                    placeholderTextColor={colors.textSecondary + "80"}
                    value={formData.amount}
                    onChangeText={(value) => handleInputChange("amount", value)}
                    onFocus={() => setFocusedField("amount")}
                    onBlur={() => setFocusedField(null)}
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                  <View style={styles.labelContainer}>
                    {selectedCategory?.icon === "car" && <Car size={14} color={colors.primary} style={{ marginRight: 6 }} />}
                    {selectedCategory?.icon === "utensils" && <UtensilsCrossed size={14} color={colors.primary} style={{ marginRight: 6 }} />}
                    {selectedCategory?.icon === "shopping" && <ShoppingBag size={14} color={colors.primary} style={{ marginRight: 6 }} />}
                    {selectedCategory?.icon === "target" && <Crosshair size={14} color={colors.primary} style={{ marginRight: 6 }} />}
                    {selectedCategory?.icon === "hotel" && <Hotel size={14} color={colors.primary} style={{ marginRight: 6 }} />}
                    {(selectedCategory?.icon === "tag" || !selectedCategory) && <Tag size={14} color={colors.primary} style={{ marginRight: 6 }} />}
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Catégorie</Text>
                  </View>
                  <View
                    style={[
                      styles.categorySelector,
                      {
                        backgroundColor: colors.input,
                        borderColor: colors.inputBorder,
                      },
                    ]}
                  >
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.categoryList}>
                        {categories.map((category) => (
                          <TouchableOpacity
                            key={category.id}
                            style={[
                              styles.categoryOption,
                              {
                                backgroundColor:
                                  formData.category === category.name
                                    ? colors.primary
                                    : colors.input,
                                borderColor:
                                  formData.category === category.name
                                    ? colors.primary
                                    : colors.border,
                              },
                            ]}
                            onPress={() => handleInputChange("category", category.name)}
                            activeOpacity={0.7}
                          >
                            {category.icon === "car" && <Car size={14} color={formData.category === category.name ? "#ffffff" : colors.text} />}
                            {category.icon === "utensils" && <UtensilsCrossed size={14} color={formData.category === category.name ? "#ffffff" : colors.text} />}
                            {category.icon === "shopping" && <ShoppingBag size={14} color={formData.category === category.name ? "#ffffff" : colors.text} />}
                            {category.icon === "target" && <Crosshair size={14} color={formData.category === category.name ? "#ffffff" : colors.text} />}
                            {category.icon === "hotel" && <Hotel size={14} color={formData.category === category.name ? "#ffffff" : colors.text} />}
                            {category.icon === "tag" && <Tag size={14} color={formData.category === category.name ? "#ffffff" : colors.text} />}
                            <Text
                              style={[
                                styles.categoryText,
                                {
                                  color:
                                    formData.category === category.name
                                      ? "#ffffff"
                                      : colors.text,
                                },
                              ]}
                            >
                              {category.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                </View>
              </View>

              {/* Date */}
              <View style={styles.inputContainer}>
                <View style={styles.labelContainer}>
                  <Calendar size={14} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Date</Text>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.input,
                      borderColor: focusedField === "date" ? colors.primary : colors.inputBorder,
                      color: colors.text,
                      shadowColor: colors.shadow,
                    },
                    focusedField === "date" && styles.inputFocused,
                  ]}
                  value={formData.date}
                  onChangeText={(value) => handleInputChange("date", value)}
                  onFocus={() => setFocusedField("date")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSecondary + "80"}
                />
              </View>

              {/* Payé par */}
              <View style={styles.inputContainer}>
                <View style={styles.labelContainer}>
                  <User size={14} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Payé par *</Text>
                </View>
                <View
                  style={[
                    styles.pickerContainer,
                    {
                      backgroundColor: colors.input,
                      borderColor: colors.inputBorder,
                    },
                  ]}
                >
                  {tripParticipants.length > 0 ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.participantList}>
                        {tripParticipants.map((participant) => (
                          <TouchableOpacity
                            key={participant.user_id}
                            style={[
                              styles.participantOption,
                              {
                                backgroundColor:
                                  formData.paidBy === participant.user_id
                                    ? colors.primary
                                    : colors.card,
                                borderColor:
                                  formData.paidBy === participant.user_id
                                    ? colors.primary
                                    : colors.border,
                              },
                            ]}
                            onPress={() => handleInputChange("paidBy", participant.user_id)}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                styles.participantText,
                                {
                                  color:
                                    formData.paidBy === participant.user_id
                                      ? "#ffffff"
                                      : colors.text,
                                },
                              ]}
                            >
                              {getDisplayName(participant)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  ) : (
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                      Aucun participant
                    </Text>
                  )}
                </View>
              </View>

              {/* Payé pour */}
              <View style={styles.inputContainer}>
                <View style={styles.labelContainer}>
                  <Target size={14} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Payé pour</Text>
                </View>
                <View style={styles.radioContainer}>
                  <TouchableOpacity
                    style={[
                      styles.radioOption,
                      {
                        backgroundColor:
                          formData.paidFor === "everyone" ? colors.primary + "20" : colors.input,
                        borderColor:
                          formData.paidFor === "everyone" ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => handleInputChange("paidFor", "everyone")}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.radioCircle,
                        {
                          backgroundColor:
                            formData.paidFor === "everyone" ? colors.primary : "transparent",
                          borderColor: colors.primary,
                        },
                      ]}
                    >
                      {formData.paidFor === "everyone" && (
                        <View style={[styles.radioInner, { backgroundColor: "#ffffff" }]} />
                      )}
                    </View>
                    <Text style={[styles.radioText, { color: colors.text }]}>Tout le monde</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.radioOption,
                      {
                        backgroundColor:
                          formData.paidFor === "specific" ? colors.primary + "20" : colors.input,
                        borderColor:
                          formData.paidFor === "specific" ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => handleInputChange("paidFor", "specific")}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.radioCircle,
                        {
                          backgroundColor:
                            formData.paidFor === "specific" ? colors.primary : "transparent",
                          borderColor: colors.primary,
                        },
                      ]}
                    >
                      {formData.paidFor === "specific" && (
                        <View style={[styles.radioInner, { backgroundColor: "#ffffff" }]} />
                      )}
                    </View>
                    <Text style={[styles.radioText, { color: colors.text }]}>
                      Un participant spécifique
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Participant spécifique */}
              {formData.paidFor === "specific" && (
                <View style={styles.inputContainer}>
                  <View style={styles.labelContainer}>
                    <Users size={14} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text style={[styles.label, { color: colors.textSecondary }]}>
                      Participant *
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.pickerContainer,
                      {
                        backgroundColor: colors.input,
                        borderColor: colors.inputBorder,
                      },
                    ]}
                  >
                    {tripParticipants.length > 0 ? (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.participantList}>
                          {tripParticipants.map((participant) => (
                            <TouchableOpacity
                              key={participant.user_id}
                              style={[
                                styles.participantOption,
                                {
                                  backgroundColor:
                                    formData.specificUserId === participant.user_id
                                      ? colors.primary
                                      : colors.card,
                                  borderColor:
                                    formData.specificUserId === participant.user_id
                                      ? colors.primary
                                      : colors.border,
                                },
                              ]}
                              onPress={() =>
                                handleInputChange("specificUserId", participant.user_id)
                              }
                              activeOpacity={0.7}
                            >
                              <Text
                                style={[
                                  styles.participantText,
                                  {
                                    color:
                                      formData.specificUserId === participant.user_id
                                        ? "#ffffff"
                                        : colors.text,
                                  },
                                ]}
                              >
                                {getDisplayName(participant)}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </ScrollView>
                    ) : (
                      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                        Aucun participant
                      </Text>
                    )}
                  </View>
                </View>
              )}

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
                  <AlertTriangle size={16} color={colors.error} />
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
  headerTextContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Ubuntu-Bold",
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  modalSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "Ubuntu-Medium",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
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
  row: {
    flexDirection: "row",
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Ubuntu-Medium",
    letterSpacing: 0.1,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: "500",
    fontFamily: "Ubuntu-Medium",
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
  categorySelector: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 8,
  },
  categoryList: {
    flexDirection: "row",
    paddingHorizontal: 8,
    gap: 8,
  },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Ubuntu-Medium",
  },
  pickerContainer: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: "center",
  },
  participantList: {
    flexDirection: "row",
    paddingHorizontal: 8,
    gap: 8,
  },
  participantOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  participantText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Ubuntu-Medium",
  },
  emptyText: {
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 12,
    fontFamily: "Ubuntu-Regular",
  },
  radioContainer: {
    gap: 10,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 10,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  radioText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Ubuntu-Medium",
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
  errorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Ubuntu-Medium",
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
    fontFamily: "Ubuntu-Medium",
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
    fontFamily: "Ubuntu-Bold",
    letterSpacing: 0.2,
  },
});
