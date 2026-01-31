import "../global.css";
import { Stack } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";
import { TripProvider } from "../src/contexts/TripContext";
import { ThemeProvider } from "../src/contexts/ThemeContext";
import { NotificationProvider } from "../src/contexts/NotificationContext";
import { ErrorBoundary } from "../src/components/ErrorBoundary";
import { setupGlobalErrorHandler } from "../src/utils/errorHandler";
import { AnimatedSplashScreen } from "../src/components/AnimatedSplashScreen";

// Empêcher le splash screen de se fermer automatiquement
SplashScreen.preventAutoHideAsync();

// Configurer le gestionnaire d'erreurs global
setupGlobalErrorHandler();

// Composant interne qui a accès au contexte auth
function AppContent() {
  const { loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(main)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal", headerShown: false }} />
      </Stack>
      {showSplash && (
        <AnimatedSplashScreen
          onAnimationComplete={handleSplashComplete}
          isLoading={loading}
        />
      )}
    </>
  );
}

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    "Ubuntu-Regular": require("../assets/fonts/Ubuntu Font/Ubuntu-Regular.ttf"),
    "Ubuntu-Light": require("../assets/fonts/Ubuntu Font/Ubuntu-Light.ttf"),
    "Ubuntu-Medium": require("../assets/fonts/Ubuntu Font/Ubuntu-Medium.ttf"),
    "Ubuntu-Bold": require("../assets/fonts/Ubuntu Font/Ubuntu-Bold.ttf"),
    "Ubuntu-Italic": require("../assets/fonts/Ubuntu Font/Ubuntu-Italic.ttf"),
    "Ubuntu-LightItalic": require("../assets/fonts/Ubuntu Font/Ubuntu-LightItalic.ttf"),
    "Ubuntu-MediumItalic": require("../assets/fonts/Ubuntu Font/Ubuntu-MediumItalic.ttf"),
    "Ubuntu-BoldItalic": require("../assets/fonts/Ubuntu Font/Ubuntu-BoldItalic.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      setAppReady(true);
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!appReady) {
    return null;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <TripProvider>
              <AppContent />
            </TripProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
