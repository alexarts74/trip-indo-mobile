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
    console.log("📧 [sendInvitationEmail] Début - Préparation de l'appel à la Edge Function");
    console.log("📧 [sendInvitationEmail] Paramètres:", {
      tripName,
      inviterEmail,
      inviteeEmail: inviteeEmail.toLowerCase().trim(),
      tripId,
    });

    const { data, error } = await supabase.functions.invoke("send-invitation", {
      body: {
        tripName,
        inviterEmail,
        inviteeEmail: inviteeEmail.toLowerCase().trim(),
        tripId,
      },
    });

    console.log("📧 [sendInvitationEmail] Réponse de la Edge Function:", {
      hasData: !!data,
      hasError: !!error,
      errorType: error?.constructor?.name,
      errorMessage: error?.message,
      errorDetails: error,
    });

    if (error) {
      const errorContext = (error as any)?.context;
      const status = errorContext?.status;
      
      // Essayer de récupérer le body de l'erreur pour voir le message détaillé
      let errorBodyMessage = null;
      try {
        if (errorContext?._bodyBlob && typeof errorContext._bodyBlob.text === 'function') {
          const errorText = await errorContext._bodyBlob.text();
          const errorBody = JSON.parse(errorText);
          errorBodyMessage = errorBody.error || errorBody.details || errorBody.message;
          console.error("📧 [sendInvitationEmail] Message d'erreur depuis le body:", errorBodyMessage);
          console.error("📧 [sendInvitationEmail] Body complet de l'erreur:", errorBody);
        }
      } catch (parseError) {
        console.warn("⚠️ [sendInvitationEmail] Impossible de parser le body d'erreur:", parseError);
      }
      
      console.error("❌ [sendInvitationEmail] Erreur détectée:", {
        message: error.message,
        name: error.name,
        status: status,
        statusText: errorContext?.statusText,
        url: errorContext?.url,
        errorBodyMessage: errorBodyMessage,
      });

      // Si c'est une erreur 500, 403 ou 400, afficher des messages spécifiques
      if (status === 500) {
        console.error("❌ [sendInvitationEmail] Erreur HTTP 500 - La fonction a une erreur interne");
        if (errorBodyMessage) {
          console.error("❌ [sendInvitationEmail] Message d'erreur:", errorBodyMessage);
        }
        console.error("❌ [sendInvitationEmail] Vérifiez les logs dans Supabase Dashboard > Edge Functions > send-invitation > Logs");
        console.error("❌ [sendInvitationEmail] Causes possibles: RESEND_API_KEY invalide, problème avec Resend, ou erreur dans le code");
      } else if (status === 403) {
        console.error("❌ [sendInvitationEmail] Erreur HTTP 403 - RESEND_API_KEY non configurée ou invalide");
        if (errorBodyMessage) {
          console.error("❌ [sendInvitationEmail] Message:", errorBodyMessage);
        }
      } else if (status === 400) {
        console.error("❌ [sendInvitationEmail] Erreur HTTP 400 - Données manquantes ou invalides");
        if (errorBodyMessage) {
          console.error("❌ [sendInvitationEmail] Message:", errorBodyMessage);
        }
      }

      throw error;
    }

    console.log("✅ [sendInvitationEmail] Email envoyé avec succès:", data);
    return data;
  } catch (error: any) {
    const status = (error as any)?.context?.status;
    console.warn("⚠️ [sendInvitationEmail] Catch - Edge Function send-invitation a renvoyé une erreur");
    console.warn("⚠️ [sendInvitationEmail] Détails de l'erreur:", {
      message: error?.message,
      name: error?.name,
      code: error?.code,
      status: status,
      statusCode: status,
      isFunctionsHttpError: error?.constructor?.name === "FunctionsHttpError",
    });
    
    if (status === 500) {
      console.warn("⚠️ [sendInvitationEmail] Erreur 500 - La fonction a une erreur interne");
      console.warn("⚠️ [sendInvitationEmail] Vérifiez les logs dans Supabase Dashboard > Edge Functions > send-invitation > Logs");
      console.warn("⚠️ [sendInvitationEmail] Causes possibles: RESEND_API_KEY invalide, problème avec Resend, ou erreur dans le code");
    } else if (status === 403) {
      console.warn("⚠️ [sendInvitationEmail] Erreur 403 - RESEND_API_KEY non configurée, invalide, ou domaine non vérifié");
      console.warn("⚠️ [sendInvitationEmail] Si vous voyez 'testing emails', vous devez vérifier un domaine dans Resend");
    } else if (status === 400) {
      console.warn("⚠️ [sendInvitationEmail] Erreur 400 - Données manquantes ou invalides");
    }
    
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
};
