import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  ActivityIndicator,
  Animated,
  Dimensions,
  Keyboard,
} from "react-native";
import { useAuth } from "../../src/contexts/AuthContext"; // Adjusted path
import { useTheme } from "../../src/contexts/ThemeContext"; // Adjusted path
import { router } from "expo-router"; // Added router for navigation
import {
  Globe,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  MapPin,
  Plane,
  Users
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

export default function SignupScreen() { // Renamed component
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { signUp } = useAuth(); // Removed signIn
  const { theme, colors } = useTheme();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim3 = useRef(new Animated.Value(0)).current;

  // Animation pour le clavier
  const keyboardAnim = useRef(new Animated.Value(1)).current;
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Gestion du clavier
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
        Animated.timing(keyboardAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
        Animated.timing(keyboardAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  useEffect(() => {
    // Animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Animations flottantes pour les icônes décoratives
    const createFloatAnimation = (anim: Animated.Value, duration: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true,
          }),
        ])
      );
    };

    createFloatAnimation(floatAnim1, 2000).start();
    createFloatAnimation(floatAnim2, 2500).start();
    createFloatAnimation(floatAnim3, 3000).start();
  }, []);

  const handleAuth = async () => { // Renamed to handleSignup
    if (!email || !password || !confirmPassword) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Erreur", "Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    try {
      setLoading(true);
      await signUp(email, password);
      Alert.alert(
        "Inscription réussie",
        "Vérifiez votre email pour confirmer votre compte",
        [{ text: "OK", onPress: () => router.replace("/(auth)/login") }] // Redirect to login after signup
      );
    } catch (error: any) {
      Alert.alert("Erreur", error.message);
    } finally {
      setLoading(false);
    }
  };

  const float1 = floatAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const float2 = floatAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const float3 = floatAnim3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  return (
    <View className="flex-1">
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Fond avec dégradé */}
      <LinearGradient
        colors={theme === "dark" ? ["#0f172a", "#1e293b", "#0f172a"] : ["#f97316", "#fb923c", "#fdba74"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Bouton retour */}
      <TouchableOpacity
        style={{
          position: "absolute",
          top: 50,
          left: 20,
          zIndex: 10,
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <ArrowLeft size={22} color="white" />
      </TouchableOpacity>

      {/* Éléments décoratifs flottants - masqués quand clavier visible */}
      <Animated.View
        style={{
          position: "absolute",
          top: height * 0.12,
          left: width * 0.1,
          transform: [{ translateY: float1 }],
          opacity: keyboardAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.6],
          }),
        }}
      >
        <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center">
          <Plane size={24} color="white" style={{ transform: [{ rotate: "-45deg" }] }} />
        </View>
      </Animated.View>

      <Animated.View
        style={{
          position: "absolute",
          top: height * 0.18,
          right: width * 0.12,
          transform: [{ translateY: float2 }],
          opacity: keyboardAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.5],
          }),
        }}
      >
        <View className="w-10 h-10 rounded-full bg-white/15 items-center justify-center">
          <MapPin size={20} color="white" />
        </View>
      </Animated.View>

      <Animated.View
        style={{
          position: "absolute",
          top: height * 0.25,
          left: width * 0.75,
          transform: [{ translateY: float3 }],
          opacity: keyboardAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.4],
          }),
        }}
      >
        <View className="w-8 h-8 rounded-full bg-white/10 items-center justify-center">
          <Users size={16} color="white" />
        </View>
      </Animated.View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="flex-1 justify-between">
          {/* Header avec logo - masqué quand clavier visible */}
          <Animated.View
            className="items-center pt-16 px-6"
            style={{
              opacity: keyboardAnim,
              height: keyboardVisible ? 0 : undefined,
              overflow: "hidden",
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            }}
          >
            {/* Logo animé */}
            <View className="mb-4">
              <View
                className="w-20 h-20 rounded-2xl justify-center items-center"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderWidth: 2,
                  borderColor: "rgba(255, 255, 255, 0.3)",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  elevation: 10,
                }}
              >
                <Globe size={44} color="white" />
              </View>
              <View
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full items-center justify-center"
                style={{ backgroundColor: "#fbbf24" }}
              >
                <Sparkles size={14} color="#78350f" />
              </View>
            </View>

            <Text
              className="text-3xl font-bold mb-1 text-white text-center"
              style={{
                fontFamily: "Ubuntu-Bold",
                letterSpacing: -1,
                textShadowColor: "rgba(0, 0, 0, 0.3)",
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4,
              }}
            >
              TripMate
            </Text>
            <Text
              className="text-sm text-center text-white/80"
              style={{ fontFamily: "Ubuntu-Regular" }}
            >
              Commencez l'aventure
            </Text>
          </Animated.View>

          {/* Carte du formulaire */}
          <Animated.View
            className="flex-1 px-5 pt-4 pb-6 justify-center"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <View
              className="rounded-[28px] p-5"
              style={{
                backgroundColor: colors.card,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.25,
                shadowRadius: 20,
                elevation: 15,
                borderWidth: 1,
                borderColor: colors.cardBorder,
              }}
            >
              {/* Titre du formulaire */}
              <Text
                className="text-xl font-bold mb-4 text-center"
                style={{ color: colors.text, fontFamily: "Ubuntu-Bold" }}
              >
                Créer un compte
              </Text>

              {/* Champ Email */}
              <View className="mb-3">
                <Text
                  className="text-xs font-medium mb-1.5 ml-1"
                  style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
                >
                  Adresse email
                </Text>
                <View
                  className="flex-row items-center rounded-xl border-2 overflow-hidden"
                  style={{
                    backgroundColor: colors.input,
                    borderColor: focusedField === "email" ? colors.primary : colors.inputBorder,
                  }}
                >
                  <View className="pl-3 pr-2">
                    <Mail
                      size={18}
                      color={focusedField === "email" ? colors.primary : colors.textSecondary}
                    />
                  </View>
                  <TextInput
                    className="flex-1 py-3 pr-3 text-sm"
                    style={{
                      color: colors.text,
                      fontFamily: "Ubuntu-Regular",
                    }}
                    placeholder="votre@email.com"
                    placeholderTextColor={colors.textSecondary + "80"}
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                  />
                </View>
              </View>

              {/* Champ Mot de passe */}
              <View className="mb-3">
                <Text
                  className="text-xs font-medium mb-1.5 ml-1"
                  style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
                >
                  Mot de passe
                </Text>
                <View
                  className="flex-row items-center rounded-xl border-2 overflow-hidden"
                  style={{
                    backgroundColor: colors.input,
                    borderColor: focusedField === "password" ? colors.primary : colors.inputBorder,
                  }}
                >
                  <View className="pl-3 pr-2">
                    <Lock
                      size={18}
                      color={focusedField === "password" ? colors.primary : colors.textSecondary}
                    />
                  </View>
                  <TextInput
                    className="flex-1 py-3 text-sm"
                    style={{
                      color: colors.text,
                      fontFamily: "Ubuntu-Regular",
                    }}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textSecondary + "80"}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="off"
                    textContentType="none"
                  />
                  <TouchableOpacity
                    className="px-3"
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    {showPassword ? (
                      <EyeOff size={18} color={colors.textSecondary} />
                    ) : (
                      <Eye size={18} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Champ Confirmation mot de passe (signup only) */}
              <View className="mb-3">
                <Text
                  className="text-xs font-medium mb-1.5 ml-1"
                  style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Medium" }}
                >
                  Confirmer le mot de passe
                </Text>
                <View
                  className="flex-row items-center rounded-xl border-2 overflow-hidden"
                  style={{
                    backgroundColor: colors.input,
                    borderColor: focusedField === "confirmPassword" ? colors.primary : colors.inputBorder,
                  }}
                >
                  <View className="pl-3 pr-2">
                    <Lock
                      size={18}
                      color={focusedField === "confirmPassword" ? colors.primary : colors.textSecondary}
                    />
                  </View>
                  <TextInput
                    className="flex-1 py-3 text-sm"
                    style={{
                      color: colors.text,
                      fontFamily: "Ubuntu-Regular",
                    }}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textSecondary + "80"}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    onFocus={() => setFocusedField("confirmPassword")}
                    onBlur={() => setFocusedField(null)}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoComplete="off"
                    textContentType="none"
                  />
                  <TouchableOpacity
                    className="px-3"
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    activeOpacity={0.7}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} color={colors.textSecondary} />
                    ) : (
                      <Eye size={18} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>


              {/* Bouton principal */}
              <TouchableOpacity
                className={`rounded-xl py-3.5 flex-row items-center justify-center mt-1 ${
                  loading ? "opacity-70" : ""
                }`}
                style={{
                  backgroundColor: colors.primary,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.4,
                  shadowRadius: 12,
                  elevation: 8,
                }}
                onPress={handleAuth} // This calls signUp
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Text
                      className="text-white text-base font-bold mr-2"
                      style={{ fontFamily: "Ubuntu-Bold" }}
                    >
                      Créer mon compte
                    </Text>
                    <ArrowRight size={18} color="white" />
                  </>
                )}
              </TouchableOpacity>

              {/* Séparateur */}
              <View className="flex-row items-center my-4">
                <View className="flex-1 h-px" style={{ backgroundColor: colors.border }} />
                <Text
                  className="mx-3 text-xs"
                  style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
                >
                  ou
                </Text>
                <View className="flex-1 h-px" style={{ backgroundColor: colors.border }} />
              </View>

              {/* Lien vers l'autre mode */}
              <TouchableOpacity
                className="py-2.5 rounded-xl border-2"
                style={{ borderColor: colors.border }}
                onPress={() => router.push("/(auth)/login")} // Navigates to login
                activeOpacity={0.7}
              >
                <Text
                  className="text-center text-sm"
                  style={{ color: colors.text, fontFamily: "Ubuntu-Medium" }}
                >
                  J'ai déjà un compte
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Footer - masqué quand clavier visible */}
          <Animated.View
            className="px-8"
            style={{
              opacity: keyboardAnim,
              height: keyboardVisible ? 0 : undefined,
              paddingBottom: keyboardVisible ? 0 : 32,
              overflow: "hidden",
            }}
          >
            <Text
              className="text-center text-xs"
              style={{ color: "rgba(255, 255, 255, 0.6)", fontFamily: "Ubuntu-Regular" }}
            >
              En continuant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité
            </Text>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}