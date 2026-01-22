import { supabase } from "../lib/supabaseClient";
import {
  getUserTokenByEmail,
  sendPushNotification,
} from "./notificationService";

export interface TripInvitation {
  id: string;
  trip_id: string;
  inviter_id: string;
  invitee_email: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  updated_at?: string;
  trips?: {
    title: string;
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
  updated_at?: string;
  trips: {
    title: string;
    description?: string;
    start_date: string;
    end_date: string;
    budget: number;
  };
  profiles: {
    first_name: string;
    last_name: string;
  } | null;
}

/**
 * Envoie une notification push à l'invité après création d'une invitation
 */
async function notifyInvitationCreated(
  inviteeEmail: string,
  inviterName: string,
  tripName: string,
  tripId: string,
  invitationId: string
): Promise<void> {
  try {
    const token = await getUserTokenByEmail(inviteeEmail);
    if (token) {
      await sendPushNotification(
        [token],
        "Nouvelle invitation",
        `${inviterName} vous invite à rejoindre "${tripName}"`,
        { type: "invitation", tripId, invitationId }
      );
    }
  } catch (error) {
    // Silently handle error
  }
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
        title,
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
        title,
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
    .update({ status })
    .eq("id", invitationId);

  if (error) {
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
        title,
        description,
        start_date,
        end_date,
        budget
      ),
      profiles (
        first_name,
        last_name
      )
    `
    )
    .eq("invitee_email", userEmail.toLowerCase())
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
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
      throw error;
    }

    return data;
  } catch (error: any) {
    // On ne throw pas pour permettre de créer l'invitation même sans email
    // Mais on retourne undefined pour indiquer que l'email n'a pas été envoyé
    return undefined;
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
  notifyInvitationCreated,
};
