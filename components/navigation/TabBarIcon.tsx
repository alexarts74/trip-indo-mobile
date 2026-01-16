import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { type ComponentProps } from "react";

interface TabBarIconProps extends ComponentProps<typeof Ionicons> {
  focused?: boolean;
  onPress?: () => void;
}

export function TabBarIcon({
  style,
  focused,
  onPress,
  ...rest
}: TabBarIconProps) {
  const IconComponent = (
    <Ionicons
      size={20}
      style={[{ marginBottom: 1 }, style]}
      {...rest}
    />
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {IconComponent}
      </TouchableOpacity>
    );
  }

  return IconComponent;
}
