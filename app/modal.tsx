import { StatusBar } from "expo-status-bar";
import { View, Text } from "react-native";

export default function ModalScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-blue-100">
      <Text className="text-2xl font-bold text-blue-800 mb-4">Modal</Text>
      <View className="bg-white p-6 rounded-xl shadow-lg">
        <Text className="text-gray-700 text-center">
          Ce composant utilise les classes Tailwind CSS
        </Text>
      </View>
      <StatusBar />
    </View>
  );
}
