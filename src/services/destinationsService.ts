import { supabase } from "../lib/supabaseClient";

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
};
