import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StatusBar,
  Animated,
  useWindowDimensions,
  Easing,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../src/contexts/AuthContext";
import { useTheme } from "../src/contexts/ThemeContext";
import { Globe, Sparkles } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function SplashScreen() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();

  // Animations simplifiees pour stabilite iPad
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation sequencee simple
    const sequence = Animated.sequence([
      // 1. Logo apparait
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // 2. Texte apparait
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // 3. Tagline apparait
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]);

    sequence.start();
  }, []);

  // Redirection apres le chargement
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        if (user) {
          router.replace("/(main)");
        } else {
          router.replace("/(auth)");
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [user, loading]);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Fond avec degrade */}
      <LinearGradient
        colors={
          theme === "dark"
            ? ["#0f172a", "#1e293b", "#0f172a"]
            : ["#f97316", "#fb923c", "#fdba74"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Cercles decoratifs en arriere-plan */}
      <View
        style={{
          position: "absolute",
          top: -height * 0.15,
          right: -width * 0.3,
          width: width * 0.8,
          height: width * 0.8,
          borderRadius: width * 0.4,
          backgroundColor: "rgba(255, 255, 255, 0.05)",
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: -height * 0.1,
          left: -width * 0.25,
          width: width * 0.6,
          height: width * 0.6,
          borderRadius: width * 0.3,
          backgroundColor: "rgba(255, 255, 255, 0.03)",
        }}
      />

      {/* Contenu principal centre */}
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 }}>
        {/* Logo anime */}
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
            marginBottom: 24,
          }}
        >
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 32,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderWidth: 3,
              borderColor: "rgba(255, 255, 255, 0.3)",
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 15,
            }}
          >
            <Globe size={64} color="white" />
          </View>

          {/* Badge Sparkles */}
          <View
            style={{
              position: "absolute",
              bottom: -4,
              right: -4,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#fbbf24",
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#f59e0b",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.5,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Sparkles size={20} color="#78350f" />
          </View>
        </Animated.View>

        {/* Nom de l'app */}
        <Animated.Text
          style={{
            fontSize: 42,
            fontWeight: "bold",
            color: "white",
            fontFamily: "Ubuntu-Bold",
            letterSpacing: -1.5,
            textShadowColor: "rgba(0, 0, 0, 0.3)",
            textShadowOffset: { width: 0, height: 3 },
            textShadowRadius: 6,
            opacity: textOpacity,
            marginBottom: 8,
          }}
        >
          TripMate
        </Animated.Text>

        {/* Tagline */}
        <Animated.Text
          style={{
            fontSize: 16,
            color: "rgba(255, 255, 255, 0.85)",
            fontFamily: "Ubuntu-Regular",
            textAlign: "center",
            opacity: taglineOpacity,
            letterSpacing: 0.5,
          }}
        >
          Vos aventures, simplifiees
        </Animated.Text>

        {/* Points de chargement simplifies */}
        <Animated.View
          style={{
            flexDirection: "row",
            marginTop: 48,
            opacity: taglineOpacity,
          }}
        >
          <LoadingDot delay={0} />
          <LoadingDot delay={150} />
          <LoadingDot delay={300} />
        </Animated.View>
      </View>

      {/* Footer */}
      <View
        style={{
          paddingBottom: 48,
          alignItems: "center",
        }}
      >
        <Animated.Text
          style={{
            fontSize: 12,
            color: "rgba(255, 255, 255, 0.5)",
            fontFamily: "Ubuntu-Regular",
            opacity: taglineOpacity,
          }}
        >
          Planifiez. Partagez. Voyagez.
        </Animated.Text>
      </View>
    </View>
  );
}

// Composant pour les points de chargement
function LoadingDot({ delay }: { delay: number }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(300 - delay),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [delay]);

  return (
    <View
      style={{
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "white",
        marginHorizontal: 6,
        opacity: opacity as any,
      }}
    />
  );
}
