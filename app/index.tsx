import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StatusBar,
  Animated,
  Dimensions,
  Easing,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../src/contexts/AuthContext";
import { useTheme } from "../src/contexts/ThemeContext";
import {
  Globe,
  Sparkles,
  MapPin,
  Plane,
  Users,
  Compass,
  Map,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();

  // Animations
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(20)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sparkleRotate = useRef(new Animated.Value(0)).current;

  // Animations flottantes pour les icônes décoratives
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim3 = useRef(new Animated.Value(0)).current;
  const floatAnim4 = useRef(new Animated.Value(0)).current;
  const floatAnim5 = useRef(new Animated.Value(0)).current;

  // Opacité des icônes
  const iconsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation séquencée
    const sequence = Animated.sequence([
      // 1. Logo apparaît avec scale et rotation
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]),
      // 2. Texte apparaît
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(textSlide, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      // 3. Tagline apparaît
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // 4. Icônes flottantes apparaissent
      Animated.timing(iconsOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]);

    sequence.start();

    // Animation de pulse continue sur le logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animation de rotation du sparkle
    Animated.loop(
      Animated.timing(sparkleRotate, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Animations flottantes pour les icônes décoratives
    const createFloatAnimation = (anim: Animated.Value, duration: number, delay: number = 0) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    };

    createFloatAnimation(floatAnim1, 2000, 0).start();
    createFloatAnimation(floatAnim2, 2500, 200).start();
    createFloatAnimation(floatAnim3, 3000, 400).start();
    createFloatAnimation(floatAnim4, 2200, 300).start();
    createFloatAnimation(floatAnim5, 2800, 100).start();
  }, []);

  // Redirection après le chargement
  useEffect(() => {
    if (!loading) {
      // Attendre un peu pour laisser les animations se jouer
      const timer = setTimeout(() => {
        if (user) {
          router.replace("/(main)");
        } else {
          router.replace("/(auth)");
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user, loading]);

  // Interpolations
  const logoRotation = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["-180deg", "0deg"],
  });

  const sparkleRotation = sparkleRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const float1 = floatAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const float2 = floatAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -25],
  });

  const float3 = floatAnim3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const float4 = floatAnim4.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -18],
  });

  const float5 = floatAnim5.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -22],
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
        colors={
          theme === "dark"
            ? ["#0f172a", "#1e293b", "#0f172a"]
            : ["#f97316", "#fb923c", "#fdba74"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Cercles décoratifs en arrière-plan */}
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

      {/* Icônes flottantes décoratives */}
      <Animated.View
        style={{
          position: "absolute",
          top: height * 0.15,
          left: width * 0.08,
          transform: [{ translateY: float1 }],
          opacity: iconsOpacity,
        }}
      >
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Plane
            size={28}
            color="white"
            style={{ transform: [{ rotate: "-45deg" }] }}
          />
        </View>
      </Animated.View>

      <Animated.View
        style={{
          position: "absolute",
          top: height * 0.22,
          right: width * 0.1,
          transform: [{ translateY: float2 }],
          opacity: iconsOpacity,
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: "rgba(255, 255, 255, 0.12)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MapPin size={24} color="white" />
        </View>
      </Animated.View>

      <Animated.View
        style={{
          position: "absolute",
          top: height * 0.35,
          left: width * 0.85,
          transform: [{ translateY: float3 }],
          opacity: iconsOpacity,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Users size={20} color="white" />
        </View>
      </Animated.View>

      <Animated.View
        style={{
          position: "absolute",
          bottom: height * 0.25,
          left: width * 0.05,
          transform: [{ translateY: float4 }],
          opacity: iconsOpacity,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Compass size={22} color="white" />
        </View>
      </Animated.View>

      <Animated.View
        style={{
          position: "absolute",
          bottom: height * 0.18,
          right: width * 0.12,
          transform: [{ translateY: float5 }],
          opacity: iconsOpacity,
        }}
      >
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Map size={26} color="white" />
        </View>
      </Animated.View>

      {/* Contenu principal centré */}
      <View className="flex-1 justify-center items-center px-8">
        {/* Logo animé */}
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [
              { scale: Animated.multiply(logoScale, pulseAnim) },
              { rotate: logoRotation },
            ],
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

          {/* Badge Sparkles animé */}
          <Animated.View
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
              transform: [{ rotate: sparkleRotation }],
            }}
          >
            <Sparkles size={20} color="#78350f" />
          </Animated.View>
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
            transform: [{ translateY: textSlide }],
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

        {/* Points de chargement */}
        <Animated.View
          style={{
            flexDirection: "row",
            marginTop: 48,
            opacity: taglineOpacity,
          }}
        >
          <LoadingDot delay={0} />
          <LoadingDot delay={200} />
          <LoadingDot delay={400} />
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

// Composant pour les points de chargement animés
function LoadingDot({ delay }: { delay: number }) {
  const opacity = useRef(new Animated.Value(0.3)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1.2,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(600 - delay),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "white",
        marginHorizontal: 6,
        opacity,
        transform: [{ scale }],
      }}
    />
  );
}
