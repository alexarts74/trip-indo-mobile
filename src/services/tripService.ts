import { supabase } from "../lib/supabaseClient";
import { Trip, CreateTripData, Destination } from "../types/trip";

export const tripService = {
  // Récupérer tous les voyages de l'utilisateur (créés + participations)
  async getUserTrips(): Promise<Trip[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      // Récupérer les voyages où l'utilisateur est participant
      const { data: participantTrips, error: participantError } = await supabase
        .from("trip_participants")
        .select("trip_id")
        .eq("user_id", user.id);

      if (participantError) throw participantError;

      // Récupérer les voyages créés par l'utilisateur
      const { data: createdTrips, error: createdError } = await supabase
        .from("trips")
        .select("id")
        .eq("user_id", user.id);

      if (createdError) throw createdError;

      const participantIds = participantTrips?.map((p) => p.trip_id) || [];
      const createdIds = createdTrips?.map((t) => t.id) || [];

      const allTripIds = [...new Set([...participantIds, ...createdIds])];

      if (allTripIds.length === 0) {
        return [];
      }

      // Récupérer tous les voyages
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .in("id", allTripIds)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error: any) {
      console.error("Erreur lors de la récupération des voyages:", error);
      throw error;
    }
  },

  // Créer un nouveau voyage
  async createTrip(tripData: CreateTripData): Promise<Trip> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      const { data, error } = await supabase
        .from("trips")
        .insert([{ ...tripData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error: any) {
      console.error("Erreur lors de la création du voyage:", error);
      throw error;
    }
  },

  // Récupérer un voyage par ID
  async getTripById(tripId: string): Promise<Trip | null> {
    try {
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .eq("trip_id", tripId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      return data[0] as Trip;
    } catch (error: any) {
      console.error("Erreur lors de la récupération du voyage:", error);
      throw error;
    }
  },
};
