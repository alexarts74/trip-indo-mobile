import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { supabase } from "../lib/supabaseClient";

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  type: "expense" | "destination" | "invitation";
  tripId?: string;
  expenseId?: string;
  destinationId?: string;
  invitationId?: string;
}

/**
 * Demande les permissions et enregistre le token push pour un utilisateur
 */
export async function registerForPushNotifications(
  userId: string
): Promise<string | null> {
  // Vérifier que c'est un appareil physique
  if (!Device.isDevice) {
    console.log("Les notifications push nécessitent un appareil physique");
    return null;
  }

  // Vérifier les permissions existantes
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Demander les permissions si pas encore accordées
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Permission de notification refusée");
    return null;
  }

  // Configuration spécifique Android
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#2563eb",
    });
  }

  // Récupérer le token Expo Push
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId
      ?? Constants.easConfig?.projectId;

    // Si pas de projectId, on ne peut pas obtenir de token push
    if (!projectId) {
      console.log("Pas de projectId EAS configuré - notifications push désactivées");
      console.log("Pour activer les notifications, exécutez: npx eas build:configure");
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    // Sauvegarder le token dans la base de données
    await savePushToken(userId, token.data);

    return token.data;
  } catch (error) {
    console.error("Erreur lors de la récupération du token push:", error);
    return null;
  }
}

/**
 * Sauvegarde le token push dans la table profiles
 */
export async function savePushToken(
  userId: string,
  token: string
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({
      push_token: token,
      notifications_enabled: true,
    })
    .eq("id", userId);

  if (error) {
    console.error("Erreur lors de la sauvegarde du token push:", error);
    throw error;
  }

  console.log("Token push sauvegardé avec succès");
}

/**
 * Désactive les notifications pour un utilisateur
 */
export async function disablePushNotifications(userId: string): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({
      push_token: null,
      notifications_enabled: false,
    })
    .eq("id", userId);

  if (error) {
    console.error("Erreur lors de la désactivation des notifications:", error);
    throw error;
  }

  console.log("Notifications désactivées avec succès");
}

/**
 * Récupère les tokens push des participants d'un voyage (sauf l'utilisateur actuel)
 */
export async function getTripParticipantTokens(
  tripId: string,
  excludeUserId: string
): Promise<string[]> {
  // Récupérer les IDs des participants
  const { data: participants, error: participantsError } = await supabase
    .from("trip_participants")
    .select("user_id")
    .eq("trip_id", tripId)
    .neq("user_id", excludeUserId);

  if (participantsError) {
    console.error("Erreur récupération participants:", participantsError);
    return [];
  }

  if (!participants || participants.length === 0) {
    return [];
  }

  const userIds = participants.map((p) => p.user_id);

  // Récupérer les tokens push des participants
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("push_token")
    .in("id", userIds)
    .eq("notifications_enabled", true)
    .not("push_token", "is", null);

  if (profilesError) {
    console.error("Erreur récupération tokens:", profilesError);
    return [];
  }

  return profiles?.map((p) => p.push_token).filter(Boolean) || [];
}

/**
 * Récupère le token push d'un utilisateur par son email
 */
export async function getUserTokenByEmail(
  email: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("push_token, notifications_enabled")
    .eq("email", email.toLowerCase())
    .single();

  if (error || !data || !data.notifications_enabled) {
    return null;
  }

  return data.push_token;
}

/**
 * Envoie une notification push via la Edge Function Supabase
 */
export async function sendPushNotification(
  tokens: string[],
  title: string,
  body: string,
  data?: NotificationData
): Promise<void> {
  // Filtrer les tokens valides (format ExponentPushToken[...])
  const validTokens = tokens.filter(
    (token) => token && token.startsWith("ExponentPushToken[")
  );

  if (validTokens.length === 0) {
    console.log("Aucun token valide pour envoyer la notification");
    return;
  }

  try {
    const { error } = await supabase.functions.invoke("send-push-notification", {
      body: {
        tokens: validTokens,
        title,
        body,
        data,
      },
    });

    if (error) {
      console.error("Erreur envoi notification via Edge Function:", error);
      throw error;
    }

    console.log(`Notification envoyée à ${validTokens.length} appareil(s)`);
  } catch (error) {
    console.error("Erreur lors de l'envoi de la notification:", error);
    // On ne throw pas pour ne pas bloquer le flow principal
  }
}

/**
 * Ajoute un listener pour les notifications reçues en foreground
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Ajoute un listener pour les interactions avec les notifications
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Récupère la dernière notification qui a ouvert l'app
 */
export async function getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
  return Notifications.getLastNotificationResponseAsync();
}

// Export du service comme objet pour compatibilité
export const notificationService = {
  registerForPushNotifications,
  savePushToken,
  disablePushNotifications,
  getTripParticipantTokens,
  getUserTokenByEmail,
  sendPushNotification,
  addNotificationReceivedListener,
  addNotificationResponseListener,
  getLastNotificationResponse,
};
