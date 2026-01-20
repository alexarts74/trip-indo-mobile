import React, { useState, useRef } from "react";
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
  Image,
  Alert,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "../../src/contexts/ThemeContext";
import { useAuth } from "../../src/contexts/AuthContext";
import { journalService } from "../../src/services/journalService";
import {
  BookOpen,
  Tag,
  FileText,
  Camera,
  AlertTriangle,
  X,
  Check,
  Plus,
  Trash2,
} from "lucide-react-native";

interface AddJournalEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  destinationId: string;
  onEntryAdded: () => void;
}

interface SelectedImage {
  uri: string;
  fileName: string;
}

export default function AddJournalEntryModal({
  isOpen,
  onClose,
  destinationId,
  onEntryAdded,
}: AddJournalEntryModalProps) {
  const { theme, colors } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
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

  const resetForm = () => {
    setFormData({ title: "", content: "" });
    setSelectedImages([]);
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const pickImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission requise",
          "Nous avons besoin de l'accès à vos photos pour ajouter des images au journal."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 5 - selectedImages.length,
      });

      if (!result.canceled && result.assets) {
        const newImages: SelectedImage[] = result.assets.map((asset) => ({
          uri: asset.uri,
          fileName: asset.fileName || `image_${Date.now()}.jpg`,
        }));

        const totalImages = [...selectedImages, ...newImages].slice(0, 5);
        setSelectedImages(totalImages);
      }
    } catch (err) {
      console.error("Erreur lors de la sélection des images:", err);
      setError("Erreur lors de la sélection des images");
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission requise",
          "Nous avons besoin de l'accès à la caméra pour prendre des photos."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImage: SelectedImage = {
          uri: result.assets[0].uri,
          fileName: `photo_${Date.now()}.jpg`,
        };

        if (selectedImages.length < 5) {
          setSelectedImages([...selectedImages, newImage]);
        }
      }
    } catch (err) {
      console.error("Erreur lors de la prise de photo:", err);
      setError("Erreur lors de la prise de photo");
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.content.trim()) {
      setError("Veuillez saisir un contenu pour votre entrée");
      return;
    }

    if (!user?.id) {
      setError("Vous devez être connecté pour ajouter une entrée");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Upload des images si présentes
      let imageUrls: string[] = [];
      if (selectedImages.length > 0) {
        const uploadPromises = selectedImages.map((img) =>
          journalService.uploadJournalImage(img.uri, img.fileName)
        );
        imageUrls = await Promise.all(uploadPromises);
      }

      // Créer l'entrée de journal
      await journalService.createJournalEntry(
        {
          destination_id: destinationId,
          title: formData.title.trim() || undefined,
          content: formData.content.trim(),
          image_urls: imageUrls.length > 0 ? imageUrls : undefined,
        },
        user.id
      );

      resetForm();
      onEntryAdded();
      onClose();
    } catch (err: any) {
      console.error("Erreur lors de la création de l'entrée:", err);
      setError(err.message || "Une erreur est survenue");
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
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/75">
        <KeyboardAvoidingView
          className="flex-1 justify-end"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <Pressable className="flex-1" onPress={() => { Keyboard.dismiss(); handleClose(); }}>
            <View className="flex-1" />
          </Pressable>

          <Animated.View
            style={{
              transform: [{ translateY: slideAnim }],
              maxHeight: "85%",
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
                paddingBottom: insets.bottom,
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
                    <BookOpen size={18} color={colors.primary} />
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
                    Nouvelle entrée
                  </Text>
                  <Text
                    className="text-xs font-medium"
                    style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
                  >
                    Partagez votre expérience
                  </Text>
                </View>
                <TouchableOpacity
                  className="w-8 h-8 rounded-full justify-center items-center ml-2.5"
                  style={{ backgroundColor: colors.input }}
                  onPress={handleClose}
                  activeOpacity={0.7}
                >
                  <X size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={{ padding: 20, paddingBottom: 24 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
              {/* Titre (optionnel) */}
              <View className="mb-4">
                <View className="flex-row items-center mb-1.5">
                  <Tag size={14} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text
                    className="text-[13px] font-semibold tracking-wide"
                    style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
                  >
                    Titre (optionnel)
                  </Text>
                </View>
                <TextInput
                  className={`border-[1.5px] rounded-xl px-3.5 py-3 text-[15px] font-medium ${
                    focusedField === "title" ? "border-2" : ""
                  }`}
                  style={{
                    backgroundColor: colors.input,
                    borderColor:
                      focusedField === "title" ? colors.primary : colors.inputBorder,
                    color: colors.text,
                    fontFamily: "Ubuntu-Medium",
                    shadowColor: colors.shadow,
                    shadowOffset:
                      focusedField === "title"
                        ? { width: 0, height: 2 }
                        : { width: 0, height: 1 },
                    shadowOpacity: focusedField === "title" ? 0.1 : 0.05,
                    shadowRadius: focusedField === "title" ? 4 : 3,
                    elevation: focusedField === "title" ? 2 : 1,
                  }}
                  placeholder="Ex: Coucher de soleil magique"
                  placeholderTextColor={colors.textSecondary + "80"}
                  value={formData.title}
                  onChangeText={(value) => handleInputChange("title", value)}
                  onFocus={() => {
                    setFocusedField("title");
                    setTimeout(() => scrollViewRef.current?.scrollTo({ y: 0, animated: true }), 100);
                  }}
                  onBlur={() => setFocusedField(null)}
                  autoCapitalize="sentences"
                />
              </View>

              {/* Contenu */}
              <View className="mb-4">
                <View className="flex-row items-center mb-1.5">
                  <FileText size={14} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text
                    className="text-[13px] font-semibold tracking-wide"
                    style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
                  >
                    Votre récit *
                  </Text>
                </View>
                <TextInput
                  className={`border-[1.5px] rounded-xl px-3.5 py-3 text-[15px] font-medium min-h-[120px] ${
                    focusedField === "content" ? "border-2" : ""
                  }`}
                  style={{
                    backgroundColor: colors.input,
                    borderColor:
                      focusedField === "content" ? colors.primary : colors.inputBorder,
                    color: colors.text,
                    fontFamily: "Ubuntu-Medium",
                    shadowColor: colors.shadow,
                    shadowOffset:
                      focusedField === "content"
                        ? { width: 0, height: 2 }
                        : { width: 0, height: 1 },
                    shadowOpacity: focusedField === "content" ? 0.1 : 0.05,
                    shadowRadius: focusedField === "content" ? 4 : 3,
                    elevation: focusedField === "content" ? 2 : 1,
                  }}
                  placeholder="Racontez votre expérience, vos découvertes, vos impressions..."
                  placeholderTextColor={colors.textSecondary + "80"}
                  value={formData.content}
                  onChangeText={(value) => handleInputChange("content", value)}
                  onFocus={() => {
                    setFocusedField("content");
                    setTimeout(() => scrollViewRef.current?.scrollTo({ y: 80, animated: true }), 100);
                  }}
                  onBlur={() => setFocusedField(null)}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>

              {/* Section Photos */}
              <View className="mb-4">
                <View className="flex-row items-center mb-1.5">
                  <Camera size={14} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text
                    className="text-[13px] font-semibold tracking-wide"
                    style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
                  >
                    Photos ({selectedImages.length}/5)
                  </Text>
                </View>

                {/* Aperçu des images sélectionnées */}
                {selectedImages.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mb-3"
                    contentContainerStyle={{ paddingVertical: 4 }}
                  >
                    {selectedImages.map((image, index) => (
                      <View key={index} className="mr-2 relative">
                        <Image
                          source={{ uri: image.uri }}
                          className="w-20 h-20 rounded-xl"
                          style={{ backgroundColor: colors.input }}
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full justify-center items-center"
                          style={{ backgroundColor: colors.error }}
                          onPress={() => removeImage(index)}
                        >
                          <X size={14} color="#ffffff" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                )}

                {/* Boutons pour ajouter des photos */}
                {selectedImages.length < 5 && (
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      className="flex-1 flex-row items-center justify-center py-3 rounded-xl border-[1.5px] border-dashed"
                      style={{
                        borderColor: colors.primary + "60",
                        backgroundColor: colors.primary + "10",
                      }}
                      onPress={pickImages}
                      activeOpacity={0.7}
                    >
                      <Plus size={18} color={colors.primary} />
                      <Text
                        className="text-sm font-medium ml-2"
                        style={{ color: colors.primary, fontFamily: "Ubuntu-Medium" }}
                      >
                        Galerie
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-1 flex-row items-center justify-center py-3 rounded-xl border-[1.5px] border-dashed"
                      style={{
                        borderColor: colors.primary + "60",
                        backgroundColor: colors.primary + "10",
                      }}
                      onPress={takePhoto}
                      activeOpacity={0.7}
                    >
                      <Camera size={18} color={colors.primary} />
                      <Text
                        className="text-sm font-medium ml-2"
                        style={{ color: colors.primary, fontFamily: "Ubuntu-Medium" }}
                      >
                        Caméra
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
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
                  onPress={handleClose}
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
                        Publier
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
      </View>
    </Modal>
  );
}
