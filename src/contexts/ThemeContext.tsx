import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "light" | "dark";

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  colors: {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
    primaryLight: string;
    primaryDark: string;
    error: string;
    success: string;
    card: string;
    cardBorder: string;
    input: string;
    inputBorder: string;
    shadow: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const lightColors = {
  background: "#f8fafc",
  surface: "#ffffff",
  text: "#1e293b",
  textSecondary: "#64748b",
  border: "#f1f5f9",
  primary: "#f97316",
  primaryLight: "#fff7ed",
  primaryDark: "#ea580c",
  error: "#ef4444",
  success: "#22c55e",
  card: "#ffffff",
  cardBorder: "#f1f5f9",
  input: "#ffffff",
  inputBorder: "#e2e8f0",
  shadow: "#000",
};

const darkColors = {
  background: "#0f172a",
  surface: "#1e293b",
  text: "#f1f5f9",
  textSecondary: "#94a3b8",
  border: "#334155",
  primary: "#f97316",
  primaryLight: "#7c2d12",
  primaryDark: "#ea580c",
  error: "#ef4444",
  success: "#22c55e",
  card: "#1e293b",
  cardBorder: "#334155",
  input: "#1e293b",
  inputBorder: "#475569",
  shadow: "#000",
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    // Charger la préférence sauvegardée
    AsyncStorage.getItem("theme").then((savedTheme) => {
      if (savedTheme === "light" || savedTheme === "dark") {
        setTheme(savedTheme);
      }
    });
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    AsyncStorage.setItem("theme", newTheme);
  };

  const colors = theme === "light" ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
