import { TextStyle } from "react-native";
import { getFontStyle } from "../constants/fonts";

/**
 * Applique automatiquement la police Ubuntu à un style de texte
 * Utilisez cette fonction pour enrichir vos styles avec la police Ubuntu
 */
export const withUbuntuFont = (style: TextStyle): TextStyle => {
  const fontStyle = getFontStyle(style.fontWeight, style.fontStyle);
  return {
    ...style,
    ...fontStyle,
  };
};

/**
 * Crée un StyleSheet avec la police Ubuntu appliquée automatiquement
 * Utilisez cette fonction au lieu de StyleSheet.create() pour appliquer automatiquement la police
 */
export const createUbuntuStyleSheet = <T extends Record<string, TextStyle>>(styles: T): T => {
  const ubuntuStyles = {} as T;
  
  for (const key in styles) {
    if (styles.hasOwnProperty(key)) {
      ubuntuStyles[key] = withUbuntuFont(styles[key]);
    }
  }
  
  return ubuntuStyles;
};
