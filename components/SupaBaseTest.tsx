import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { testConnection } from "../src/lib/supabaseClient";

export default function SupabaseTest() {
  const [status, setStatus] = useState("Testing...");
  const [connectionInfo, setConnectionInfo] = useState<any>(null);

  useEffect(() => {
    async function performConnectionTest() {
      try {
        setStatus("🔄 Test de connexion en cours...");

        const result = await testConnection();

        if (result.success) {
          setStatus("✅ Connexion Supabase réussie!");
          setConnectionInfo(result.data);
        } else {
          setStatus(`❌ Erreur de connexion: ${result.error}`);
        }
      } catch (err) {
        setStatus(`❌ Erreur: ${err}`);
      }
    }

    performConnectionTest();
  }, []);

  const showConfigInfo = () => {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "Non configuré";
    const supabaseKey =
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "Non configuré";

    Alert.alert(
      "Configuration Supabase",
      `URL: ${supabaseUrl}\nClé: ${supabaseKey.substring(0, 20)}...`,
      [{ text: "OK" }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Connexion Supabase</Text>
      <Text style={styles.text}>{status}</Text>

      {connectionInfo && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Données reçues: {JSON.stringify(connectionInfo)}
          </Text>
        </View>
      )}

      <Text style={styles.configText} onPress={showConfigInfo}>
        📋 Voir la configuration
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f0f0f0",
    margin: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  infoContainer: {
    backgroundColor: "#e8f5e8",
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  infoText: {
    fontSize: 12,
    color: "#2d5a2d",
  },
  configText: {
    fontSize: 14,
    color: "#0066cc",
    textAlign: "center",
    textDecorationLine: "underline",
    marginTop: 10,
  },
});
