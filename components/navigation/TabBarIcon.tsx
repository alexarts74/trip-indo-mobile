import React from "react";
import { TouchableOpacity } from "react-native";
import { BarChart3, Map, Wallet, Users } from "lucide-react-native";

interface TabBarIconProps {
  name: string;
  color: string;
  focused?: boolean;
  onPress?: () => void;
  style?: any;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  "stats-chart": BarChart3,
  "stats-chart-outline": BarChart3,
  "map": Map,
  "map-outline": Map,
  "wallet": Wallet,
  "wallet-outline": Wallet,
  "people": Users,
  "people-outline": Users,
};

export function TabBarIcon({
  name,
  color,
  focused,
  onPress,
  style,
}: TabBarIconProps) {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    return null;
  }

  const iconElement = (
    <IconComponent
      size={20}
      color={color}
      strokeWidth={focused ? 2.5 : 2}
      style={[{ marginBottom: 1 }, style]}
    />
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {iconElement}
      </TouchableOpacity>
    );
  }

  return iconElement;
}
