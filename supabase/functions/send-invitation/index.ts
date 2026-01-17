import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const APP_URL = Deno.env.get("EXPO_PUBLIC_APP_URL") || "https://your-app-url.com";

const resend = new Resend(RESEND_API_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { tripName, inviterEmail, inviteeEmail, tripId } = await req.json();

    console.log("📧 Envoi d'invitation:", {
      tripName,
      inviterEmail,
      inviteeEmail,
      tripId,
    });

    if (!tripName || !inviterEmail || !inviteeEmail || !tripId) {
      return new Response(
        JSON.stringify({ error: "Données manquantes" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!RESEND_API_KEY) {
      console.warn("⚠️ RESEND_API_KEY non configurée");
      return new Response(
        JSON.stringify({
          error: "Configuration email requise",
          details:
            "La clé API Resend n'est pas configurée. Veuillez configurer RESEND_API_KEY dans les variables d'environnement de Supabase.",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Template d'email HTML professionnel
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invitation au voyage - ${tripName}</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff;
          }
          .header { 
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .header h2 {
            margin: 10px 0 0 0;
            font-size: 20px;
            font-weight: 400;
            opacity: 0.9;
          }
          .content { 
            padding: 40px 30px; 
          }
          .content p {
            margin: 0 0 16px 0;
            font-size: 16px;
          }
          .content ul {
            margin: 20px 0;
            padding-left: 20px;
          }
          .content li {
            margin: 10px 0;
            font-size: 16px;
          }
          .button-container {
            text-align: center;
            margin: 40px 0;
          }
          .button { 
            display: inline-block; 
            padding: 16px 32px; 
            background: #f97316; 
            color: white; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: 600;
            font-size: 16px;
          }
          .button:hover {
            background: #ea580c;
          }
          .footer { 
            text-align: center; 
            margin-top: 40px; 
            padding-top: 30px;
            border-top: 1px solid #e5e5e5;
            color: #666; 
            font-size: 14px; 
          }
          .note {
            background-color: #fff7ed;
            border-left: 4px solid #f97316;
            padding: 16px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 14px;
            color: #7c2d12;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✈️ Invitation au voyage</h1>
            <h2>${tripName}</h2>
          </div>

          <div class="content">
            <p>Bonjour !</p>

            <p><strong>${inviterEmail}</strong> vous invite à rejoindre son voyage <strong>"${tripName}"</strong> sur Trip Indo !</p>

            <p>Cette invitation vous permettra de :</p>
            <ul>
              <li>Voir les détails du voyage</li>
              <li>Participer à la planification</li>
              <li>Voir les destinations et activités</li>
              <li>Partager vos idées avec l'équipe</li>
            </ul>

            <div class="button-container">
              <a href="${APP_URL}" class="button">
                ✅ Ouvrir Trip Indo
              </a>
            </div>

            <div class="note">
              <strong>💡 Note :</strong> Connectez-vous à l'application avec votre adresse email (${inviteeEmail}) pour voir et accepter cette invitation dans la section "Mes invitations".
            </div>

            <div class="footer">
              <p>Envoyé depuis Trip Indo</p>
              <p>Si vous avez des questions, contactez ${inviterEmail}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Envoyer l'email
    const { data, error } = await resend.emails.send({
      from: "Trip Indo <onboarding@resend.dev>",
      to: [inviteeEmail],
      subject: `✈️ Invitation au voyage : ${tripName}`,
      html: htmlContent,
    });

    if (error) {
      console.error("❌ Erreur Resend:", error);
      return new Response(
        JSON.stringify({ error: "Erreur lors de l'envoi de l'email", details: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("✅ Email envoyé avec succès:", data);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email d'invitation envoyé avec succès",
        data,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("💥 Erreur API:", error);
    return new Response(
      JSON.stringify({ error: "Erreur interne du serveur", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
