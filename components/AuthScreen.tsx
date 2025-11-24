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
} from "react-native";
import { useAuth } from "../src/contexts/AuthContext";

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

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
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ justifyContent: 'center', padding: 24 }}
      >
        <View className="items-center mb-12">
          <Text className="text-6xl mb-4">🌏</Text>
          <Text className="text-3xl font-bold text-gray-800 mb-2 text-center">
            TripMate
          </Text>
          <Text className="text-lg text-gray-600 text-center">
            {isLogin ? "Connectez-vous" : "Créez votre compte"}
          </Text>
        </View>

        <View className="space-y-4">
          <TextInput
            className="bg-white border border-gray-300 rounded-xl p-4 text-base"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            className="bg-white border border-gray-300 rounded-xl p-4 text-base"
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            className={`bg-primary-500 p-4 rounded-xl items-center mt-2 ${
              loading ? "opacity-60" : ""
            }`}
            onPress={handleAuth}
            disabled={loading}
          >
            <Text className="text-white text-base font-semibold">
              {loading
                ? "Chargement..."
                : isLogin
                ? "Se connecter"
                : "S'inscrire"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center mt-4"
            onPress={() => setIsLogin(!isLogin)}
          >
            <Text className="text-primary-500 text-sm underline">
              {isLogin
                ? "Pas encore de compte ? S'inscrire"
                : "Déjà un compte ? Se connecter"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
