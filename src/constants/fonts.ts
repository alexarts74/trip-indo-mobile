/**
 * Helper pour obtenir la bonne variante de la police Ubuntu selon le fontWeight
 */
export const getUbuntuFont = (weight: "300" | "400" | "500" | "700" = "400", italic: boolean = false): string => {
  if (italic) {
    switch (weight) {
      case "300":
        return "Ubuntu-LightItalic";
      case "500":
        return "Ubuntu-MediumItalic";
      case "700":
        return "Ubuntu-BoldItalic";
      default:
        return "Ubuntu-Italic";
    }
  }
  
  switch (weight) {
    case "300":
      return "Ubuntu-Light";
    case "500":
      return "Ubuntu-Medium";
    case "700":
      return "Ubuntu-Bold";
    default:
      return "Ubuntu-Regular";
  }
};

/**
 * Helper pour obtenir le style de police Ubuntu à partir d'un fontWeight standard
 */
export const getFontStyle = (fontWeight?: string | number, fontStyle?: "normal" | "italic"): { fontFamily: string } => {
  const isItalic = fontStyle === "italic";
  
  if (typeof fontWeight === "number") {
    if (fontWeight >= 700) {
      return { fontFamily: getUbuntuFont("700", isItalic) };
    } else if (fontWeight >= 500) {
      return { fontFamily: getUbuntuFont("500", isItalic) };
    } else if (fontWeight >= 400) {
      return { fontFamily: getUbuntuFont("400", isItalic) };
    } else {
      return { fontFamily: getUbuntuFont("300", isItalic) };
    }
  }
  
  if (typeof fontWeight === "string") {
    if (fontWeight === "bold" || fontWeight === "700") {
      return { fontFamily: getUbuntuFont("700", isItalic) };
    } else if (fontWeight === "600" || fontWeight === "500") {
      return { fontFamily: getUbuntuFont("500", isItalic) };
    } else if (fontWeight === "300" || fontWeight === "light") {
      return { fontFamily: getUbuntuFont("300", isItalic) };
    }
  }
  
  return { fontFamily: getUbuntuFont("400", isItalic) };
};

/**
 * Helper pour créer un style de texte avec la police Ubuntu
 * Utilisez cette fonction dans vos StyleSheet.create() pour appliquer automatiquement la police
 */
export const createTextStyle = (style: any) => {
  const fontWeight = style?.fontWeight;
  const fontStyle = style?.fontStyle;
  const fontFamily = getFontStyle(fontWeight, fontStyle).fontFamily;
  
  return {
    ...style,
    fontFamily,
  };
};
