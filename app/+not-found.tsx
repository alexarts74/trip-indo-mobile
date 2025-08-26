import { Link, Stack } from "expo-router";
import { View, Text } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View className="flex-1 items-center justify-center bg-blue-100">
        <Text className="text-2xl font-bold text-blue-800 mb-4">
          This screen doesn't exist.
        </Text>

        <Link href="/">
          <Text className="text-blue-500">Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}
