import { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { Globe, Sparkles } from "lucide-react-native";

const { width } = Dimensions.get("window");

interface AnimatedSplashScreenProps {
  onAnimationComplete: () => void;
  isLoading?: boolean;
}

export function AnimatedSplashScreen({
  onAnimationComplete,
  isLoading = false,
}: AnimatedSplashScreenProps) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;

  const hasFinishedLoading = useRef(false);
  const animationMinTimeReached = useRef(false);

  // Animation d'entrée
  useEffect(() => {
    // Logo: fade in + scale + légère rotation
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
    ]).start();

    // Texte "TripMate" après le logo
    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Tagline après le texte
    Animated.sequence([
      Animated.delay(700),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Animation de pulsation continue sur le logo
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    // Animation des points de chargement
    const createDotAnimation = (dotOpacity: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dotOpacity, {
            toValue: 1,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(dotOpacity, {
            toValue: 0.3,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(400 - delay),
        ])
      );
    };

    const dot1Anim = createDotAnimation(dot1Opacity, 0);
    const dot2Anim = createDotAnimation(dot2Opacity, 150);
    const dot3Anim = createDotAnimation(dot3Opacity, 300);

    dot1Anim.start();
    dot2Anim.start();
    dot3Anim.start();

    // Temps minimum d'affichage
    const minTimeTimeout = setTimeout(() => {
      animationMinTimeReached.current = true;
      tryExit();
    }, 2000);

    return () => {
      clearTimeout(minTimeTimeout);
      pulseAnimation.stop();
      dot1Anim.stop();
      dot2Anim.stop();
      dot3Anim.stop();
    };
  }, []);

  // Quand le chargement est terminé
  useEffect(() => {
    if (!isLoading) {
      hasFinishedLoading.current = true;
      tryExit();
    }
  }, [isLoading]);

  const tryExit = () => {
    if (hasFinishedLoading.current && animationMinTimeReached.current) {
      // Animation de sortie
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        onAnimationComplete();
      });
    }
  };

  const rotateInterpolate = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["-10deg", "0deg"],
  });

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      {/* Cercles décoratifs */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.circle3} />

      {/* Logo animé */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [
              { scale: Animated.multiply(logoScale, pulseScale) },
              { rotate: rotateInterpolate },
            ],
          },
        ]}
      >
        <View style={styles.logoBox}>
          <Globe size={64} color="white" strokeWidth={1.5} />
        </View>
        <View style={styles.sparklesBadge}>
          <Sparkles size={20} color="#78350f" />
        </View>
      </Animated.View>

      {/* Nom de l'app */}
      <Animated.Text
        style={[
          styles.title,
          {
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }],
          },
        ]}
      >
        TripMate
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        Vos aventures, simplifiées
      </Animated.Text>

      {/* Points de chargement */}
      <View style={styles.dotsContainer}>
        <Animated.View style={[styles.dot, { opacity: dot1Opacity }]} />
        <Animated.View style={[styles.dot, { opacity: dot2Opacity }]} />
        <Animated.View style={[styles.dot, { opacity: dot3Opacity }]} />
      </View>

      {/* Footer */}
      <Animated.Text style={[styles.footer, { opacity: taglineOpacity }]}>
        Planifiez. Partagez. Voyagez.
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#F97316",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  circle1: {
    position: "absolute",
    top: -100,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  circle2: {
    position: "absolute",
    bottom: -50,
    left: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  circle3: {
    position: "absolute",
    top: "40%",
    left: -150,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
  logoContainer: {
    marginBottom: 24,
    position: "relative",
  },
  logoBox: {
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
  },
  sparklesBadge: {
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
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: "white",
    fontFamily: "Ubuntu-Bold",
    letterSpacing: -1,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    fontFamily: "Ubuntu-Regular",
  },
  dotsContainer: {
    flexDirection: "row",
    marginTop: 40,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "white",
    marginHorizontal: 6,
  },
  footer: {
    position: "absolute",
    bottom: 50,
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    fontFamily: "Ubuntu-Regular",
  },
});
