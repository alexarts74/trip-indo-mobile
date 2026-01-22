import { useState } from "react";
import {
  createInvitation,
  sendInvitationEmail,
  invitationService,
} from "@/src/services/invitationService";
import { supabase } from "@/src/lib/supabaseClient";
import { User } from "@supabase/supabase-js";

interface UseInvitationSenderParams {
  tripId: string;
  tripName: string;
  user: User | null;
  onSuccess?: () => void;
}

interface UseInvitationSenderReturn {
  email: string;
  setEmail: (email: string) => void;
  isLoading: boolean;
  success: string;
  error: string;
  sendInvitation: () => Promise<void>;
}

export function useInvitationSender({
  tripId,
  tripName,
  user,
  onSuccess,
}: UseInvitationSenderParams): UseInvitationSenderReturn {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const sendInvitation = async () => {
    if (!email.trim()) {
      setError("Veuillez saisir un email");
      return;
    }

    if (!user) {
      setError("Vous devez être connecté pour envoyer une invitation");
      return;
    }

    // Validation basique de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Veuillez saisir un email valide");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // 1. Créer l'invitation dans Supabase
      const invitationData = await createInvitation(
        tripId,
        user.id,
        email.trim()
      );

      // Envoyer une notification push à l'invité s'il a un compte
      if (invitationData?.id) {
        // Récupérer le nom de l'inviteur
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, last_name, email")
          .eq("id", user.id)
          .single();

        let inviterName = "Un utilisateur";
        if (profile) {
          if (profile.first_name && profile.last_name) {
            inviterName = `${profile.first_name} ${profile.last_name}`;
          } else if (profile.first_name) {
            inviterName = profile.first_name;
          } else if (profile.email) {
            inviterName = profile.email.split("@")[0];
          }
        }

        await invitationService.notifyInvitationCreated(
          email.trim(),
          inviterName,
          tripName,
          tripId,
          invitationData.id
        );
      }

      // 2. Envoyer l'email d'invitation (optionnel, ne bloque pas si ça échoue)
      try {
        const inviterEmail = user.email || "";
        const result = await sendInvitationEmail(tripName, inviterEmail, email.trim(), tripId);

        // Vérifier si le résultat indique vraiment un succès
        if (result !== undefined) {
          setSuccess(`Invitation envoyée à ${email.trim()} ! Email d'invitation envoyé.`);
        } else {
          // Si pas de résultat, l'email n'a probablement pas été envoyé
          setSuccess(
            `Invitation créée pour ${email.trim()} ! (Note: Vérifiez les logs Supabase pour l'envoi d'email)`
          );
        }
      } catch (emailError: any) {
        setSuccess(
          `Invitation créée pour ${email.trim()} ! (Note: Erreur lors de l'envoi d'email - vérifiez les logs Supabase)`
        );
      }

      setEmail("");
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      // Gestion des erreurs spécifiques
      if (error.code === "23505") {
        setError("Cette personne a déjà été invitée à ce voyage");
      } else if (error.message?.includes("duplicate")) {
        setError("Cette personne a déjà été invitée à ce voyage");
      } else {
        setError(error.message || "Une erreur est survenue lors de l'envoi de l'invitation");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    isLoading,
    success,
    error,
    sendInvitation,
  };
}
