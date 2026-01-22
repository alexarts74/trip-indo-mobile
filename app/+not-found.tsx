import { Stack, router } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View className="flex-1 items-center justify-center bg-blue-100">
        <Text className="text-2xl font-bold text-blue-800 mb-4">
          Cette page n'existe pas.
        </Text>

        <TouchableOpacity
          onPress={() => router.replace("/")}
          activeOpacity={0.7}
        >
          <Text className="text-blue-500">Retour à l'accueil</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
