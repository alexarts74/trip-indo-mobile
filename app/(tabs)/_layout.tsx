import { Tabs, useSegments } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { useTheme } from "@/src/contexts/ThemeContext";

export default function TabLayout() {
  const { theme, colors } = useTheme();
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const [activeTab, setActiveTab] = useState(0);
  const indicatorPosition = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get("window").width;
  const tabBarWidth = screenWidth * 0.88;
  const numberOfTabs = 4;
  const tabWidth = tabBarWidth / numberOfTabs;

  // Détecter automatiquement l'onglet actif basé sur les segments de route
  useEffect(() => {
    const currentPath = segments.join("/");
    if (currentPath.includes("participants")) {
      setActiveTab(3);
    } else if (currentPath.includes("expenses")) {
      setActiveTab(2);
    } else if (currentPath.includes("destinations")) {
      setActiveTab(1);
    } else {
      setActiveTab(0);
    }
  }, [segments]);

  useEffect(() => {
    const indicatorWidth = tabWidth * 0.85; // 85% de la largeur d'un onglet
    Animated.spring(indicatorPosition, {
      toValue: activeTab * tabWidth + (tabWidth - indicatorWidth) / 2,
      useNativeDriver: false,
      tension: 150,
      friction: 8,
    }).start();
  }, [activeTab, indicatorPosition, tabWidth]);

  const tabBarBackground = () => (
    <View style={StyleSheet.absoluteFill}>
      <BlurView
        intensity={80}
        tint={theme === "dark" ? "dark" : "light"}
        style={{
          flex: 1,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: colors.border + "40",
          position: "relative",
          overflow: "hidden",
          shadowColor: colors.shadow,
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.2,
          shadowRadius: 16,
          elevation: 10,
        }}
      >
        <Animated.View
          style={{
            position: "absolute",
            top: 4,
            left: indicatorPosition,
            width: tabWidth * 0.85,
            height: 48,
            borderRadius: 24,
            backgroundColor: colors.primary + "25",
            shadowColor: colors.primary,
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.35,
            shadowRadius: 6,
            elevation: 4,
          }}
        />
      </BlurView>
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary + "80",
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          bottom: -5 + insets.bottom,
          marginHorizontal: "6%",
          alignSelf: "center",
          width: "88%",
          maxWidth: "90%",
          backgroundColor: "transparent",
          borderTopWidth: 0,
          borderBottomWidth: 0,
          height: 56,
          paddingBottom: 0,
          paddingTop: 4,
          marginBottom: 0,
          shadowColor: "transparent",
          shadowOpacity: 0,
          elevation: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 0,
          height: 48,
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarBackground: tabBarBackground,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
    fontFamily: "Ubuntu-Medium",
          marginTop: -4,
          textAlign: "center",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "stats-chart" : "stats-chart-outline"}
              color={color}
              focused={focused}
            />
          ),
        }}
        listeners={{
          tabPress: () => {
            setActiveTab(0);
          },
        }}
      />
      <Tabs.Screen
        name="destinations"
        options={{
          title: "Destinations",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "map" : "map-outline"}
              color={color}
              focused={focused}
            />
          ),
        }}
        listeners={{
          tabPress: () => {
            setActiveTab(1);
          },
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: "Dépenses",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "wallet" : "wallet-outline"}
              color={color}
              focused={focused}
            />
          ),
        }}
        listeners={{
          tabPress: () => {
            setActiveTab(2);
          },
        }}
      />
      <Tabs.Screen
        name="participants"
        options={{
          title: "Participants",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "people" : "people-outline"}
              color={color}
              focused={focused}
            />
          ),
        }}
        listeners={{
          tabPress: () => {
            setActiveTab(3);
          },
        }}
      />
      {/* Route cachée - accessible via navigation mais pas dans la tab bar */}
      <Tabs.Screen
        name="destination/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
