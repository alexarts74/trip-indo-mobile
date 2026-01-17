import { Stack } from "expo-router";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider } from "../src/contexts/AuthContext";
import { TripProvider } from "../src/contexts/TripContext";
import { ThemeProvider } from "../src/contexts/ThemeContext";

// Empêcher le splash screen de se fermer automatiquement
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider>
    <AuthProvider>
      <TripProvider>
        <Stack>
          <Stack.Screen name="(main)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: "modal", headerShown: false }} />
        </Stack>
      </TripProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}
