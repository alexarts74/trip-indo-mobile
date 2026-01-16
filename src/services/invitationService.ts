import { supabase } from "../lib/supabaseClient";

export interface Invitation {
  id: string;
  trip_id: string;
  inviter_id: string;
  invitee_email: string;
  status: string;
  created_at: string;
  trips: {
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    budget: number;
  };
  profiles: {
    first_name: string;
    last_name: string;
  };
}

export const invitationService = {
  // Récupérer les invitations en attente de l'utilisateur
  async getPendingInvitations(userEmail: string): Promise<Invitation[]> {
    try {
      // Récupérer les invitations
      const { data: invitations, error: invitationsError } = await supabase
        .from("trip_invitations")
        .select("*")
        .eq("invitee_email", userEmail.toLowerCase())
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (invitationsError) throw invitationsError;
      if (!invitations || invitations.length === 0) return [];

      // Récupérer les IDs des voyages et des inviters
      const tripIds = [...new Set(invitations.map((inv) => inv.trip_id))];
      const inviterIds = [...new Set(invitations.map((inv) => inv.inviter_id))];

      // Récupérer les voyages
      const { data: trips, error: tripsError } = await supabase
        .from("trips")
        .select("id, name, description, start_date, end_date, budget")
        .in("id", tripIds);

      if (tripsError) throw tripsError;

      // Récupérer les profils
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", inviterIds);

      if (profilesError) throw profilesError;

      // Combiner les données
      const tripsMap = new Map(trips?.map((trip) => [trip.id, trip]) || []);
      const profilesMap = new Map(profiles?.map((profile) => [profile.id, profile]) || []);

      return invitations.map((invitation) => ({
        ...invitation,
        trips: tripsMap.get(invitation.trip_id) || {
          name: "",
          description: "",
          start_date: "",
          end_date: "",
          budget: 0,
        },
        profiles: profilesMap.get(invitation.inviter_id) || {
          first_name: "",
          last_name: "",
        },
      }));
    } catch (error: any) {
      console.error("Erreur lors de la récupération des invitations:", error);
      throw error;
    }
  },

  // Accepter une invitation
  async acceptInvitation(invitationId: string, tripId: string, userId: string): Promise<void> {
    try {
      // Mettre à jour le statut de l'invitation
      const { error: updateError } = await supabase
        .from("trip_invitations")
        .update({ status: "accepted" })
        .eq("id", invitationId);

      if (updateError) throw updateError;

      // Ajouter l'utilisateur comme participant
      const { error: participantError } = await supabase
        .from("trip_participants")
        .insert([
          {
            trip_id: tripId,
            user_id: userId,
            role: "participant",
          },
        ]);

      if (participantError) throw participantError;
    } catch (error: any) {
      console.error("Erreur lors de l'acceptation de l'invitation:", error);
      throw error;
    }
  },

  // Décliner une invitation
  async declineInvitation(invitationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("trip_invitations")
        .update({ status: "declined" })
        .eq("id", invitationId);

      if (error) throw error;
    } catch (error: any) {
      console.error("Erreur lors du refus de l'invitation:", error);
      throw error;
    }
  },
};
