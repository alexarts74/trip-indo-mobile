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
  StyleSheet,
  StatusBar,
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
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar 
        barStyle={theme === "dark" ? "light-content" : "dark-content"} 
        backgroundColor={colors.surface} 
      />
      
      {/* Header moderne */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerContent}>
          <View style={styles.logoWrapper}>
            <View style={[styles.logoContainer, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
              <Globe size={56} color={colors.primary} />
            </View>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>TripMate</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {isLogin ? "Connectez-vous à votre compte" : "Créez votre compte"}
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
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
          <TextInput
              style={[styles.input, { 
                backgroundColor: colors.input, 
                borderColor: colors.inputBorder,
                color: colors.text 
              }]}
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

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Mot de passe</Text>
          <TextInput
              style={[styles.input, { 
                backgroundColor: colors.input, 
                borderColor: colors.inputBorder,
                color: colors.text 
              }]}
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
            style={[
              styles.button,
              { backgroundColor: colors.primary },
              loading && styles.buttonDisabled,
            ]}
            onPress={handleAuth}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {loading
                ? "Chargement..."
                : isLogin
                ? "Se connecter"
                : "S'inscrire"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchAuth}
            onPress={() => setIsLogin(!isLogin)}
            activeOpacity={0.7}
          >
            <Text style={[styles.switchAuthText, { color: colors.textSecondary }]}>
              {isLogin
                ? "Pas encore de compte ? " : "Déjà un compte ? "}
              <Text style={[styles.switchAuthLink, { color: colors.primary }]}>
                {isLogin ? "S'inscrire" : "Se connecter"}
              </Text>
            </Text>
          </TouchableOpacity>
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
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerContent: {
    alignItems: 'center',
  },
  logoWrapper: {
    marginBottom: 20,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    shadowColor: '#f97316',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    fontFamily: "Ubuntu-Bold",
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: "Ubuntu-Regular",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: "Ubuntu-Medium",
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  button: {
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#f97316',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    fontFamily: "Ubuntu-Bold",
    letterSpacing: 0.4,
  },
  switchAuth: {
    marginTop: 28,
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchAuthText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: "Ubuntu-Regular",
  },
  switchAuthLink: {
    fontWeight: '700',
    fontFamily: "Ubuntu-Bold",
    textDecorationLine: 'underline',
  },
});
