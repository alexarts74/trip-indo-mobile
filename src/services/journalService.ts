import { supabase } from "../lib/supabaseClient";
import {
  JournalEntry,
  CreateJournalEntryData,
  UpdateJournalEntryData,
} from "../types/journal";

export const journalService = {
  /**
   * Récupérer toutes les entrées de journal d'une destination
   */
  async getDestinationJournalEntries(
    destinationId: string
  ): Promise<JournalEntry[]> {
    try {
      const { data, error } = await supabase
        .from("destination_journal_entries")
        .select("*")
        .eq("destination_id", destinationId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        return [];
      }

      // Récupérer les informations utilisateur pour chaque entrée
      const entriesWithUsers = await Promise.all(
        data.map(async (entry: any) => {
          let user = null;
          if (entry.user_id) {
            try {
              const { data: profileData } = await supabase
                .from("profiles")
                .select("email, first_name, last_name")
                .eq("id", entry.user_id)
                .single();

              if (profileData) {
                user = profileData;
              }
            } catch (profileError) {
              // Silently handle profile fetch error
            }
          }
          return { ...entry, user };
        })
      );

      return entriesWithUsers;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Créer une nouvelle entrée de journal
   */
  async createJournalEntry(
    data: CreateJournalEntryData,
    userId: string
  ): Promise<JournalEntry> {
    try {
      const { data: newEntry, error } = await supabase
        .from("destination_journal_entries")
        .insert({
          destination_id: data.destination_id,
          user_id: userId,
          title: data.title || null,
          content: data.content,
          image_urls: data.image_urls || [],
        })
        .select()
        .single();

      if (error) throw error;

      // Récupérer les informations utilisateur
      let user = null;
      try {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("email, first_name, last_name")
          .eq("id", userId)
          .single();

        if (profileData) {
          user = profileData;
        }
      } catch (profileError) {
        // Silently handle profile fetch error
      }

      return { ...newEntry, user };
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Mettre à jour une entrée de journal (owner only)
   */
  async updateJournalEntry(
    entryId: string,
    data: UpdateJournalEntryData
  ): Promise<JournalEntry> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (data.title !== undefined) updateData.title = data.title;
      if (data.content !== undefined) updateData.content = data.content;
      if (data.image_urls !== undefined) updateData.image_urls = data.image_urls;

      const { data: updatedEntry, error } = await supabase
        .from("destination_journal_entries")
        .update(updateData)
        .eq("id", entryId)
        .select()
        .single();

      if (error) throw error;

      // Récupérer les informations utilisateur
      let user = null;
      if (updatedEntry.user_id) {
        try {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("email, first_name, last_name")
            .eq("id", updatedEntry.user_id)
            .single();

          if (profileData) {
            user = profileData;
          }
        } catch (profileError) {
          // Silently handle profile fetch error
        }
      }

      return { ...updatedEntry, user };
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Supprimer une entrée de journal (owner only)
   */
  async deleteJournalEntry(entryId: string): Promise<void> {
    try {
      // D'abord récupérer l'entrée pour obtenir les URLs des images
      const { data: entry, error: fetchError } = await supabase
        .from("destination_journal_entries")
        .select("image_urls")
        .eq("id", entryId)
        .single();

      if (fetchError) throw fetchError;

      // Supprimer les images du storage
      if (entry?.image_urls && entry.image_urls.length > 0) {
        await Promise.all(
          entry.image_urls.map((url: string) =>
            journalService.deleteJournalImage(url)
          )
        );
      }

      // Supprimer l'entrée de la base de données
      const { error } = await supabase
        .from("destination_journal_entries")
        .delete()
        .eq("id", entryId);

      if (error) throw error;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Upload une image vers Supabase Storage
   */
  async uploadJournalImage(
    fileUri: string,
    fileName: string
  ): Promise<string> {
    try {
      // Générer un nom de fichier unique
      const timestamp = Date.now();
      const ext = fileName.split('.').pop() || 'jpg';
      const uniqueFileName = `${timestamp}.${ext}`;

      // Créer un FormData pour l'upload
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        name: uniqueFileName,
        type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
      } as any);

      // Upload via l'API REST de Supabase Storage
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token || supabaseKey;

      const uploadResponse = await fetch(
        `${supabaseUrl}/storage/v1/object/journal-images/${uniqueFileName}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'x-upsert': 'false',
          },
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      // Récupérer l'URL publique
      const { data: publicUrlData } = supabase.storage
        .from("journal-images")
        .getPublicUrl(uniqueFileName);

      return publicUrlData.publicUrl;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Supprimer une image du Supabase Storage
   */
  async deleteJournalImage(imageUrl: string): Promise<void> {
    try {
      // Extraire le nom du fichier depuis l'URL
      const urlParts = imageUrl.split("/journal-images/");
      if (urlParts.length < 2) {
        return;
      }

      const fileName = urlParts[1];

      const { error } = await supabase.storage
        .from("journal-images")
        .remove([fileName]);

      if (error) throw error;
    } catch (error: any) {
      // Ne pas propager l'erreur pour éviter de bloquer d'autres opérations
    }
  },
};
