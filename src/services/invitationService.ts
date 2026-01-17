import { supabase } from "../lib/supabaseClient";

export interface TripInvitation {
  id: string;
  trip_id: string;
  inviter_id: string;
  invitee_email: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  updated_at: string;
  trips?: {
    name: string;
    description?: string;
    start_date: string;
    end_date: string;
    budget: number;
  };
}

export interface Invitation {
  id: string;
  trip_id: string;
  inviter_id: string;
  invitee_email: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  updated_at: string;
  trips: {
    name: string;
    description?: string;
    start_date: string;
    end_date: string;
    budget: number;
  };
  profiles: {
    first_name: string;
    last_name: string;
  };
}

/**
 * Créer une invitation pour un voyage
 */
export async function createInvitation(
  tripId: string,
  inviterId: string,
  inviteeEmail: string
): Promise<TripInvitation> {
  const { data, error } = await supabase
    .from("trip_invitations")
    .insert({
      trip_id: tripId,
      inviter_id: inviterId,
      invitee_email: inviteeEmail.toLowerCase().trim(),
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("❌ Erreur création invitation:", error);
    throw error;
  }

  return data;
}

/**
 * Récupérer les invitations reçues par l'utilisateur connecté
 */
export async function fetchReceivedInvitations(
  userEmail: string
): Promise<TripInvitation[]> {
  const { data, error } = await supabase
    .from("trip_invitations")
    .select(
      `
      *,
      trips (
        name,
        description,
        start_date,
        end_date,
        budget
      )
    `
    )
    .eq("invitee_email", userEmail.toLowerCase())
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Erreur récupération invitations reçues:", error);
    throw error;
  }

  return data || [];
}

/**
 * Récupérer les invitations envoyées par l'utilisateur
 */
export async function fetchSentInvitations(
  userId: string
): Promise<TripInvitation[]> {
  const { data, error } = await supabase
    .from("trip_invitations")
    .select(
      `
      *,
      trips (
        name,
        description,
        start_date,
        end_date,
        budget
      )
    `
    )
    .eq("inviter_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Erreur récupération invitations envoyées:", error);
    throw error;
  }

  return data || [];
}

/**
 * Mettre à jour le statut d'une invitation
 */
export async function updateInvitationStatus(
  invitationId: string,
  status: "accepted" | "declined"
): Promise<void> {
  const { error } = await supabase
    .from("trip_invitations")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", invitationId);

  if (error) {
    console.error("❌ Erreur mise à jour invitation:", error);
    throw error;
  }
}

/**
 * Récupérer les invitations en attente pour un email
 */
export async function getPendingInvitations(userEmail: string): Promise<Invitation[]> {
  const { data, error } = await supabase
    .from("trip_invitations")
    .select(
      `
      *,
      trips (
        name,
        description,
        start_date,
        end_date,
        budget
      ),
      profiles:inviter_id (
        first_name,
        last_name
      )
    `
    )
    .eq("invitee_email", userEmail.toLowerCase())
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Erreur récupération invitations en attente:", error);
    throw error;
  }

  return data || [];
}

/**
 * Accepter une invitation et ajouter l'utilisateur comme participant
 */
export async function acceptInvitation(
  invitationId: string,
  tripId: string,
  userId: string
): Promise<void> {
  // Mettre à jour le statut de l'invitation
  await updateInvitationStatus(invitationId, "accepted");

  // Ajouter l'utilisateur comme participant
  const { error: participantError } = await supabase
    .from("trip_participants")
    .insert({
      trip_id: tripId,
      user_id: userId,
      role: "participant",
    });

  if (participantError) {
    // Si l'utilisateur est déjà participant, ce n'est pas une erreur critique
    if (participantError.code !== "23505") {
      console.error("❌ Erreur ajout participant:", participantError);
      throw participantError;
    }
  }
}

/**
 * Décliner une invitation
 */
export async function declineInvitation(invitationId: string): Promise<void> {
  await updateInvitationStatus(invitationId, "declined");
}

/**
 * Envoyer un email d'invitation via Supabase Edge Function
 */
export async function sendInvitationEmail(
  tripName: string,
  inviterEmail: string,
  inviteeEmail: string,
  tripId: string
): Promise<void> {
  try {
    const { data, error } = await supabase.functions.invoke("send-invitation", {
      body: {
        tripName,
        inviterEmail,
        inviteeEmail: inviteeEmail.toLowerCase().trim(),
        tripId,
      },
    });

    if (error) {
      console.error("❌ Erreur envoi email:", error);
      throw error;
    }

    return data;
  } catch (error: any) {
    // Si la fonction n'existe pas encore, on log mais on ne bloque pas
    console.warn("⚠️ Edge Function send-invitation non disponible:", error.message);
    // On ne throw pas pour permettre de créer l'invitation même sans email
  }
}

// Export du service comme objet pour compatibilité
export const invitationService = {
  createInvitation,
  fetchReceivedInvitations,
  fetchSentInvitations,
  updateInvitationStatus,
  acceptInvitation,
  declineInvitation,
  sendInvitationEmail,
  getPendingInvitations,
};
