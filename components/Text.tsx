import React from "react";
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from "react-native";
import { getFontStyle } from "../src/constants/fonts";

interface TextProps extends RNTextProps {
  weight?: "300" | "400" | "500" | "700";
}

export default function Text({ style, weight, ...props }: TextProps) {
  // Extraire fontWeight du style si présent
  const styleObj = StyleSheet.flatten(style);
  const fontWeight = weight || styleObj?.fontWeight;
  const fontStyle = styleObj?.fontStyle;
  
  const ubuntuFontStyle = getFontStyle(fontWeight, fontStyle);
  
  return (
    <RNText 
      style={[ubuntuFontStyle, style]} 
      {...props} 
    />
  );
}
