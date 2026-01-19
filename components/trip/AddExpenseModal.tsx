import React, { useState, useEffect } from "react";
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
import { Wallet, FileText, Euro, Calendar, User, Target, Users, AlertTriangle, X, Car, UtensilsCrossed, ShoppingBag, Crosshair, Hotel, Tag, Check, ChevronDown } from "lucide-react-native";

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
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
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
      setIsCategoryDropdownOpen(false);
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

      // Récupérer les profils pour obtenir les noms
      const participantsWithProfiles = await Promise.all(
        (participants || []).map(async (participant) => {
          let displayName = participant.email || "";
          
          try {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("first_name, last_name, email")
              .eq("id", participant.user_id)
              .single();

            if (profileData) {
              // Prioriser le nom complet
              if (profileData.first_name && profileData.last_name) {
                displayName = `${profileData.first_name} ${profileData.last_name}`;
              } else if (profileData.first_name) {
                displayName = profileData.first_name;
              } else if (profileData.email) {
                // Extraire le nom de l'email si pas de nom
                const emailParts = profileData.email.split("@");
                displayName = emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1);
              } else if (participant.email) {
                const emailParts = participant.email.split("@");
                displayName = emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1);
              }
            } else if (participant.email) {
              // Fallback sur l'email si pas de profil
              const emailParts = participant.email.split("@");
              displayName = emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1);
            }
          } catch (profileError) {
            // Si pas de profil, utiliser l'email ou un fallback
            if (participant.email) {
              const emailParts = participant.email.split("@");
              displayName = emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1);
            }
          }

          return {
            user_id: participant.user_id,
            display_name: displayName || "Utilisateur",
          };
        })
      );

      setTripParticipants(participantsWithProfiles);

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

            {/* Header */}
            <View
              className="flex-row items-center px-5 pt-2 pb-4 border-b"
              style={{ borderBottomColor: colors.border }}
            >
              <View className="mr-2.5">
                <View
                  className="w-9 h-9 rounded-full justify-center items-center"
                  style={{ backgroundColor: colors.primary + "20" }}
                >
                  <Wallet size={18} color={colors.primary} />
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
                  Ajouter une dépense
                </Text>
                <Text
                  className="text-xs font-medium"
                  style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
                >
                  Enregistrez une nouvelle dépense
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
              onScrollBeginDrag={() => setIsCategoryDropdownOpen(false)}
            >
              {/* Titre */}
              <View className="mb-4">
                <View className="flex-row items-center mb-1.5">
                  <FileText size={14} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text
                    className="text-[13px] font-semibold tracking-wide"
                    style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
                  >
                    Titre *
                  </Text>
                </View>
                <TextInput
                  className={`border-[1.5px] rounded-xl px-3.5 py-3 text-[15px] font-medium ${
                    focusedField === "title" ? "border-2" : ""
                  }`}
                  style={{
                    backgroundColor: colors.input,
                    borderColor: focusedField === "title" ? colors.primary : colors.inputBorder,
                    color: colors.text,
                    fontFamily: "Ubuntu-Medium",
                    shadowColor: colors.shadow,
                    shadowOffset: focusedField === "title" ? { width: 0, height: 2 } : { width: 0, height: 1 },
                    shadowOpacity: focusedField === "title" ? 0.1 : 0.05,
                    shadowRadius: focusedField === "title" ? 4 : 3,
                    elevation: focusedField === "title" ? 2 : 1,
                  }}
                  placeholder="Ex: Taxi vers l'aéroport"
                  placeholderTextColor={colors.textSecondary + "80"}
                  value={formData.title}
                  onChangeText={(value) => handleInputChange("title", value)}
                  onFocus={() => setFocusedField("title")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              {/* Montant et Catégorie */}
              <View className="flex-row mb-4">
                <View className="flex-1 mr-2">
                  <View className="flex-row items-center mb-1.5">
                    <Euro size={14} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text
                      className="text-[13px] font-semibold tracking-wide"
                      style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
                    >
                      Montant (€) *
                    </Text>
                  </View>
                  <TextInput
                    className={`border-[1.5px] rounded-xl px-3.5 py-3 text-[15px] font-medium ${
                      focusedField === "amount" ? "border-2" : ""
                    }`}
                    style={{
                      backgroundColor: colors.input,
                      borderColor: focusedField === "amount" ? colors.primary : colors.inputBorder,
                      color: colors.text,
                      fontFamily: "Ubuntu-Medium",
                      shadowColor: colors.shadow,
                      shadowOffset: focusedField === "amount" ? { width: 0, height: 2 } : { width: 0, height: 1 },
                      shadowOpacity: focusedField === "amount" ? 0.1 : 0.05,
                      shadowRadius: focusedField === "amount" ? 4 : 3,
                      elevation: focusedField === "amount" ? 2 : 1,
                    }}
                    placeholder="0.00"
                    placeholderTextColor={colors.textSecondary + "80"}
                    value={formData.amount}
                    onChangeText={(value) => handleInputChange("amount", value)}
                    onFocus={() => setFocusedField("amount")}
                    onBlur={() => setFocusedField(null)}
                    keyboardType="decimal-pad"
                  />
                </View>

                <View className="flex-1 ml-2">
                  <View className="flex-row items-center mb-1.5">
                    {selectedCategory?.icon === "car" && <Car size={14} color={colors.primary} style={{ marginRight: 6 }} />}
                    {selectedCategory?.icon === "utensils" && <UtensilsCrossed size={14} color={colors.primary} style={{ marginRight: 6 }} />}
                    {selectedCategory?.icon === "shopping" && <ShoppingBag size={14} color={colors.primary} style={{ marginRight: 6 }} />}
                    {selectedCategory?.icon === "target" && <Crosshair size={14} color={colors.primary} style={{ marginRight: 6 }} />}
                    {selectedCategory?.icon === "hotel" && <Hotel size={14} color={colors.primary} style={{ marginRight: 6 }} />}
                    {(selectedCategory?.icon === "tag" || !selectedCategory) && <Tag size={14} color={colors.primary} style={{ marginRight: 6 }} />}
                    <Text
                      className="text-[13px] font-semibold tracking-wide"
                      style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
                    >
                      Catégorie
                    </Text>
                  </View>
                  <View className="relative">
                    <TouchableOpacity
                      className={`border-[1.5px] rounded-xl px-3.5 py-3 flex-row items-center justify-between ${
                        focusedField === "category" ? "border-2" : ""
                      }`}
                      style={{
                        backgroundColor: colors.input,
                        borderColor: focusedField === "category" ? colors.primary : colors.inputBorder,
                        shadowColor: colors.shadow,
                        shadowOffset: focusedField === "category" ? { width: 0, height: 2 } : { width: 0, height: 1 },
                        shadowOpacity: focusedField === "category" ? 0.1 : 0.05,
                        shadowRadius: focusedField === "category" ? 4 : 3,
                        elevation: focusedField === "category" ? 2 : 1,
                      }}
                      onPress={() => {
                        setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                        setFocusedField("category");
                      }}
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-center gap-2">
                        {selectedCategory?.icon === "car" && <Car size={16} color={colors.text} />}
                        {selectedCategory?.icon === "utensils" && <UtensilsCrossed size={16} color={colors.text} />}
                        {selectedCategory?.icon === "shopping" && <ShoppingBag size={16} color={colors.text} />}
                        {selectedCategory?.icon === "target" && <Crosshair size={16} color={colors.text} />}
                        {selectedCategory?.icon === "hotel" && <Hotel size={16} color={colors.text} />}
                        {(selectedCategory?.icon === "tag" || !selectedCategory) && <Tag size={16} color={colors.text} />}
                        <Text
                          className="text-[15px] font-medium"
                          style={{ color: colors.text, fontFamily: "Ubuntu-Medium" }}
                        >
                          {formData.category}
                        </Text>
                      </View>
                      <ChevronDown 
                        size={18} 
                        color={colors.textSecondary} 
                        style={{ transform: [{ rotate: isCategoryDropdownOpen ? '180deg' : '0deg' }] }}
                      />
                    </TouchableOpacity>

                    {isCategoryDropdownOpen && (
                      <View
                        className="absolute top-full left-0 right-0 mt-1 rounded-xl border-[1.5px] z-50"
                        style={{
                          backgroundColor: colors.card,
                          borderColor: colors.cardBorder,
                          shadowColor: colors.shadow,
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.15,
                          shadowRadius: 12,
                          elevation: 8,
                        }}
                      >
                        {categories.map((category) => (
                          <TouchableOpacity
                            key={category.id}
                            className="flex-row items-center px-3.5 py-3 border-b last:border-b-0"
                            style={{
                              borderBottomColor: category.id !== categories[categories.length - 1].id ? colors.border : "transparent",
                            }}
                            onPress={() => {
                              handleInputChange("category", category.name);
                              setIsCategoryDropdownOpen(false);
                              setFocusedField(null);
                            }}
                            activeOpacity={0.7}
                          >
                            <View className="flex-row items-center flex-1 gap-2">
                              {category.icon === "car" && <Car size={16} color={colors.text} />}
                              {category.icon === "utensils" && <UtensilsCrossed size={16} color={colors.text} />}
                              {category.icon === "shopping" && <ShoppingBag size={16} color={colors.text} />}
                              {category.icon === "target" && <Crosshair size={16} color={colors.text} />}
                              {category.icon === "hotel" && <Hotel size={16} color={colors.text} />}
                              {category.icon === "tag" && <Tag size={16} color={colors.text} />}
                              <Text
                                className="text-[15px] font-medium"
                                style={{ color: colors.text, fontFamily: "Ubuntu-Medium" }}
                              >
                                {category.name}
                              </Text>
                            </View>
                            {formData.category === category.name && (
                              <Check size={18} color={colors.primary} />
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Date */}
              <View className="mb-4">
                <View className="flex-row items-center mb-1.5">
                  <Calendar size={14} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text
                    className="text-[13px] font-semibold tracking-wide"
                    style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
                  >
                    Date
                  </Text>
                </View>
                <TextInput
                  className={`border-[1.5px] rounded-xl px-3.5 py-3 text-[15px] font-medium ${
                    focusedField === "date" ? "border-2" : ""
                  }`}
                  style={{
                    backgroundColor: colors.input,
                    borderColor: focusedField === "date" ? colors.primary : colors.inputBorder,
                    color: colors.text,
                    fontFamily: "Ubuntu-Medium",
                    shadowColor: colors.shadow,
                    shadowOffset: focusedField === "date" ? { width: 0, height: 2 } : { width: 0, height: 1 },
                    shadowOpacity: focusedField === "date" ? 0.1 : 0.05,
                    shadowRadius: focusedField === "date" ? 4 : 3,
                    elevation: focusedField === "date" ? 2 : 1,
                  }}
                  value={formData.date}
                  onChangeText={(value) => handleInputChange("date", value)}
                  onFocus={() => setFocusedField("date")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSecondary + "80"}
                />
              </View>

              {/* Payé par */}
              <View className="mb-4">
                <View className="flex-row items-center mb-1.5">
                  <User size={14} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text
                    className="text-[13px] font-semibold tracking-wide"
                    style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
                  >
                    Payé par *
                  </Text>
                </View>
                <View
                  className="border-[1.5px] rounded-xl py-2 min-h-[44px] justify-center"
                  style={{
                    backgroundColor: colors.input,
                    borderColor: colors.inputBorder,
                  }}
                >
                  {tripParticipants.length > 0 ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View className="flex-row px-2 gap-2">
                        {tripParticipants.map((participant) => (
                          <TouchableOpacity
                            key={participant.user_id}
                            className="px-3.5 py-2.5 rounded-[10px] border-[1.5px]"
                            style={{
                              backgroundColor:
                                formData.paidBy === participant.user_id
                                  ? colors.primary
                                  : colors.card,
                              borderColor:
                                formData.paidBy === participant.user_id
                                  ? colors.primary
                                  : colors.border,
                            }}
                            onPress={() => handleInputChange("paidBy", participant.user_id)}
                            activeOpacity={0.7}
                          >
                            <Text
                              className="text-[13px] font-semibold"
                              style={{
                                color:
                                  formData.paidBy === participant.user_id
                                    ? "#ffffff"
                                    : colors.text,
                                fontFamily: "Ubuntu-Medium",
                              }}
                            >
                              {getDisplayName(participant)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  ) : (
                    <Text
                      className="text-[13px] text-center py-3"
                      style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
                    >
                      Aucun participant
                    </Text>
                  )}
                </View>
              </View>

              {/* Payé pour */}
              <View className="mb-4">
                <View className="flex-row items-center mb-1.5">
                  <Target size={14} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text
                    className="text-[13px] font-semibold tracking-wide"
                    style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
                  >
                    Payé pour
                  </Text>
                </View>
                <View className="gap-2.5">
                  <TouchableOpacity
                    className="flex-row items-center p-3 rounded-xl border-[1.5px] gap-2.5"
                    style={{
                      backgroundColor:
                        formData.paidFor === "everyone" ? colors.primary + "20" : colors.input,
                      borderColor:
                        formData.paidFor === "everyone" ? colors.primary : colors.border,
                    }}
                    onPress={() => handleInputChange("paidFor", "everyone")}
                    activeOpacity={0.7}
                  >
                    <View
                      className="w-5 h-5 rounded-full border-2 justify-center items-center"
                      style={{
                        backgroundColor:
                          formData.paidFor === "everyone" ? colors.primary : "transparent",
                        borderColor: colors.primary,
                      }}
                    >
                      {formData.paidFor === "everyone" && (
                        <View
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: "#ffffff" }}
                        />
                      )}
                    </View>
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: colors.text, fontFamily: "Ubuntu-Medium" }}
                    >
                      Tout le monde
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-row items-center p-3 rounded-xl border-[1.5px] gap-2.5"
                    style={{
                      backgroundColor:
                        formData.paidFor === "specific" ? colors.primary + "20" : colors.input,
                      borderColor:
                        formData.paidFor === "specific" ? colors.primary : colors.border,
                    }}
                    onPress={() => handleInputChange("paidFor", "specific")}
                    activeOpacity={0.7}
                  >
                    <View
                      className="w-5 h-5 rounded-full border-2 justify-center items-center"
                      style={{
                        backgroundColor:
                          formData.paidFor === "specific" ? colors.primary : "transparent",
                        borderColor: colors.primary,
                      }}
                    >
                      {formData.paidFor === "specific" && (
                        <View
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: "#ffffff" }}
                        />
                      )}
                    </View>
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: colors.text, fontFamily: "Ubuntu-Medium" }}
                    >
                      Un participant spécifique
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Participant spécifique */}
              {formData.paidFor === "specific" && (
                <View className="mb-4">
                  <View className="flex-row items-center mb-1.5">
                    <Users size={14} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text
                      className="text-[13px] font-semibold tracking-wide"
                      style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
                    >
                      Participant *
                    </Text>
                  </View>
                  <View
                    className="border-[1.5px] rounded-xl py-2 min-h-[44px] justify-center"
                    style={{
                      backgroundColor: colors.input,
                      borderColor: colors.inputBorder,
                    }}
                  >
                    {tripParticipants.length > 0 ? (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View className="flex-row px-2 gap-2">
                          {tripParticipants.map((participant) => (
                            <TouchableOpacity
                              key={participant.user_id}
                              className="px-3.5 py-2.5 rounded-[10px] border-[1.5px]"
                              style={{
                                backgroundColor:
                                  formData.specificUserId === participant.user_id
                                    ? colors.primary
                                    : colors.card,
                                borderColor:
                                  formData.specificUserId === participant.user_id
                                    ? colors.primary
                                    : colors.border,
                              }}
                              onPress={() =>
                                handleInputChange("specificUserId", participant.user_id)
                              }
                              activeOpacity={0.7}
                            >
                              <Text
                                className="text-[13px] font-semibold"
                                style={{
                                  color:
                                    formData.specificUserId === participant.user_id
                                      ? "#ffffff"
                                      : colors.text,
                                  fontFamily: "Ubuntu-Medium",
                                }}
                              >
                                {getDisplayName(participant)}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </ScrollView>
                    ) : (
                      <Text
                        className="text-[13px] text-center py-3"
                        style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
                      >
                        Aucun participant
                      </Text>
                    )}
                  </View>
                </View>
              )}

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
