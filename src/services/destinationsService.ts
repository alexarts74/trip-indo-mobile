import { supabase } from "../lib/supabaseClient";
import {
  getTripParticipantTokens,
  sendPushNotification,
} from "./notificationService";

/**
 * Envoie une notification push aux autres participants après ajout d'une destination
 */
async function notifyDestinationAdded(
  tripId: string,
  currentUserId: string,
  userName: string,
  destinationName: string
): Promise<void> {
  try {
    const tokens = await getTripParticipantTokens(tripId, currentUserId);
    if (tokens.length > 0) {
      await sendPushNotification(
        tokens,
        "Nouvelle destination",
        `${userName} a ajouté "${destinationName}" au voyage`,
        { type: "destination", tripId }
      );
    }
  } catch (error) {
    console.error("Erreur envoi notification destination:", error);
  }
}

export const destinationsService = {
  async fetchDestinations(tripId: string) {
    try {
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .eq("trip_id", tripId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      return data;
    } catch (error: any) {
      console.error("Erreur lors de la récupération des destinations:", error);
      throw error;
    }
  },

  // Notifier les participants après ajout d'une destination
  notifyDestinationAdded,
};
