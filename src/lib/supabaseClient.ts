import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    "EXPO_PUBLIC_SUPABASE_URL est manquant. Veuillez créer un fichier .env à la racine du projet avec vos identifiants Supabase. Consultez .env.example pour plus d'informations."
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    "EXPO_PUBLIC_SUPABASE_ANON_KEY est manquant. Veuillez créer un fichier .env à la racine du projet avec vos identifiants Supabase. Consultez .env.example pour plus d'informations."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
