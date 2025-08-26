import { Stack } from "expo-router";
import { AuthProvider } from "../src/contexts/AuthContext";
import { TripProvider } from "../src/contexts/TripContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <TripProvider>
        <Stack>
          <Stack.Screen name="(main)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        </Stack>
      </TripProvider>
    </AuthProvider>
  );
}
