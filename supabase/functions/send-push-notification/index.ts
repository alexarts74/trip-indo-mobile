import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const EXPO_PUSH_API_URL = "https://exp.host/--/api/v2/push/send";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: "default" | null;
  priority?: "default" | "normal" | "high";
}

serve(async (req) => {
  console.log("Push notification request received - Method:", req.method);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { tokens, title, body: notificationBody, data } = body;

    console.log("Notification data:", {
      tokensCount: tokens?.length || 0,
      title,
      body: notificationBody,
      data,
    });

    // Validation
    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return new Response(
        JSON.stringify({ error: "Tokens array is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!title || !notificationBody) {
      return new Response(
        JSON.stringify({ error: "Title and body are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Filter valid Expo Push tokens
    const validTokens = tokens.filter(
      (token: string) => token && token.startsWith("ExponentPushToken[")
    );

    if (validTokens.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No valid tokens to send to",
          sent: 0,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Prepare messages for Expo Push API
    const messages: PushMessage[] = validTokens.map((token: string) => ({
      to: token,
      title,
      body: notificationBody,
      data,
      sound: "default",
      priority: "high",
    }));

    console.log(`Sending ${messages.length} push notification(s)...`);

    // Send to Expo Push API
    const response = await fetch(EXPO_PUSH_API_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();

    console.log("Expo Push API response:", result);

    if (!response.ok) {
      console.error("Expo Push API error:", result);
      return new Response(
        JSON.stringify({
          error: "Failed to send notifications",
          details: result,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check for individual ticket errors
    const tickets = result.data || [];
    const errors = tickets.filter((ticket: { status: string }) => ticket.status === "error");

    if (errors.length > 0) {
      console.warn("Some notifications failed:", errors);
    }

    const successCount = tickets.filter(
      (ticket: { status: string }) => ticket.status === "ok"
    ).length;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sent ${successCount}/${validTokens.length} notification(s)`,
        sent: successCount,
        failed: errors.length,
        tickets,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending push notification:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
