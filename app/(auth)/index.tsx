import React, { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StatusBar, Animated, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useTheme } from "../../src/contexts/ThemeContext";
import {
  Globe,
  Sparkles,
  MapPin,
  Plane,
  Users,
  ArrowRight
} from "lucide-react-native";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const { theme, colors } = useTheme();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim3 = useRef(new Animated.Value(0)).current;

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

      {/* Éléments décoratifs flottants */}
      <Animated.View
        style={{
          position: "absolute",
          top: height * 0.12,
          left: width * 0.1,
          transform: [{ translateY: float1 }],
          opacity: 0.6,
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
          opacity: 0.5,
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
          opacity: 0.4,
        }}
      >
        <View className="w-8 h-8 rounded-full bg-white/10 items-center justify-center">
          <Users size={16} color="white" />
        </View>
      </Animated.View>

      <View className="flex-1 justify-between p-5 pb-10">
        {/* Header avec logo */}
        <Animated.View
          className="items-center pt-24 px-6"
          style={{
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
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
            className="text-4xl font-bold mb-2 text-white text-center"
            style={{
              fontFamily: "Ubuntu-Bold",
              letterSpacing: -1,
              textShadowColor: "rgba(0, 0, 0, 0.3)",
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 4,
            }}
          >
            Bienvenue sur TripMate
          </Text>
          <Text
            className="text-lg text-center text-white/80"
            style={{ fontFamily: "Ubuntu-Regular" }}
          >
            Votre compagnon de voyage pour l'Indonésie
          </Text>
        </Animated.View>

        {/* Boutons d'action */}
        <Animated.View
          className="w-full"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <TouchableOpacity
            className={`rounded-xl py-4 flex-row items-center justify-center mb-4`}
            style={{
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 8,
            }}
            onPress={() => router.push("/(auth)/login")}
            activeOpacity={0.85}
          >
            <Text
              className="text-white text-lg font-bold mr-2"
              style={{ fontFamily: "Ubuntu-Bold" }}
            >
              Se connecter
            </Text>
            <ArrowRight size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            className={`rounded-xl py-4 flex-row items-center justify-center`}
            style={{
              backgroundColor: colors.card,
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 5,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            onPress={() => router.push("/(auth)/signup")}
            activeOpacity={0.85}
          >
            <Text
              className="text-lg font-bold mr-2"
              style={{ color: colors.text, fontFamily: "Ubuntu-Bold" }}
            >
              Créer un compte
            </Text>
            <ArrowRight size={20} color={colors.text} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}
