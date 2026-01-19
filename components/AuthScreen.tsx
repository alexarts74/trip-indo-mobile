import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../src/contexts/AuthContext";
import { useTheme } from "../src/contexts/ThemeContext";
import { Globe } from "lucide-react-native";

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { theme, colors } = useTheme();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    try {
      setLoading(true);
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
        Alert.alert(
          "Inscription réussie",
          "Vérifiez votre email pour confirmer votre compte"
        );
      }
    } catch (error: any) {
      Alert.alert("Erreur", error.message);
    } finally {
      setLoading(false);
    }
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
      
      {/* Header moderne */}
      <View
        className="pt-[60px] pb-8 px-6 border-b"
        style={{
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View className="items-center">
          <View className="mb-5">
            <View
              className="w-[100px] h-[100px] rounded-full justify-center items-center border-[3px]"
              style={{
                backgroundColor: colors.primaryLight,
                borderColor: colors.primary,
                shadowColor: '#f97316',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 4,
              }}
            >
              <Globe size={56} color={colors.primary} />
            </View>
          </View>
          <Text
            className="text-4xl font-bold mb-2 text-center"
            style={{
              color: colors.text,
              fontFamily: "Ubuntu-Bold",
              letterSpacing: -0.8,
            }}
          >
            TripMate
          </Text>
          <Text
            className="text-[15px] text-center leading-[22px]"
            style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
          >
            {isLogin ? "Connectez-vous à votre compte" : "Créez votre compte"}
          </Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-6 pt-8 pb-10"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full">
          <View className="mb-5">
            <Text
              className="text-sm font-semibold mb-2.5 tracking-wide"
              style={{ color: colors.text, fontFamily: "Ubuntu-Medium" }}
            >
              Email
            </Text>
            <TextInput
              className="border-[1.5px] rounded-[14px] px-[18px] py-4 text-base"
              style={{
                backgroundColor: colors.input,
                borderColor: colors.inputBorder,
                color: colors.text,
                fontFamily: "Ubuntu-Regular",
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 3,
                elevation: 1,
              }}
              placeholder="votre@email.com"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
            />
          </View>

          <View className="mb-5">
            <Text
              className="text-sm font-semibold mb-2.5 tracking-wide"
              style={{ color: colors.text, fontFamily: "Ubuntu-Medium" }}
            >
              Mot de passe
            </Text>
            <TextInput
              className="border-[1.5px] rounded-[14px] px-[18px] py-4 text-base"
              style={{
                backgroundColor: colors.input,
                borderColor: colors.inputBorder,
                color: colors.text,
                fontFamily: "Ubuntu-Regular",
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 3,
                elevation: 1,
              }}
              placeholder="••••••••"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
            />
          </View>

          <TouchableOpacity
            className={`rounded-[14px] py-[18px] items-center justify-center mt-3 ${
              loading ? "opacity-60" : ""
            }`}
            style={{
              backgroundColor: colors.primary,
              shadowColor: '#f97316',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius: 12,
              elevation: 5,
            }}
            onPress={handleAuth}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text
                className="text-white text-lg font-bold tracking-wide"
                style={{ fontFamily: "Ubuntu-Bold" }}
              >
                {isLogin ? "Se connecter" : "S'inscrire"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="mt-7 items-center py-2"
            onPress={() => setIsLogin(!isLogin)}
            activeOpacity={0.7}
          >
            <Text
              className="text-[15px] text-center leading-[22px]"
              style={{ color: colors.textSecondary, fontFamily: "Ubuntu-Regular" }}
            >
              {isLogin ? "Pas encore de compte ? " : "Déjà un compte ? "}
              <Text
                className="font-bold underline"
                style={{ color: colors.primary, fontFamily: "Ubuntu-Bold" }}
              >
                {isLogin ? "S'inscrire" : "Se connecter"}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
