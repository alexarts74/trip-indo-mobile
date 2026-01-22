import { Alert } from "react-native";

// Types d'erreurs personnalisées
export class AppError extends Error {
  code: string;
  context?: Record<string, any>;

  constructor(message: string, code: string, context?: Record<string, any>) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.context = context;
  }
}

export class NetworkError extends AppError {
  constructor(message: string = "Problème de connexion réseau") {
    super(message, "NETWORK_ERROR");
    this.name = "NetworkError";
  }
}

export class AuthError extends AppError {
  constructor(message: string = "Erreur d'authentification") {
    super(message, "AUTH_ERROR");
    this.name = "AuthError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, "VALIDATION_ERROR", { field });
    this.name = "ValidationError";
  }
}

// Messages d'erreur utilisateur-friendly
const ERROR_MESSAGES: Record<string, string> = {
  NETWORK_ERROR: "Vérifiez votre connexion internet et réessayez.",
  AUTH_ERROR: "Session expirée. Veuillez vous reconnecter.",
  VALIDATION_ERROR: "Les données saisies sont invalides.",
  PGRST116: "Ressource non trouvée.",
  "23505": "Cette entrée existe déjà.",
  "42501": "Vous n'avez pas les permissions nécessaires.",
  DEFAULT: "Une erreur inattendue s'est produite.",
};

/**
 * Obtient un message d'erreur utilisateur-friendly
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return ERROR_MESSAGES[error.code] || error.message;
  }

  if (error instanceof Error) {
    // Erreurs Supabase
    if ("code" in error && typeof (error as any).code === "string") {
      const code = (error as any).code;
      return ERROR_MESSAGES[code] || error.message;
    }

    // Erreurs réseau
    if (error.message.includes("network") || error.message.includes("fetch")) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }

    return error.message || ERROR_MESSAGES.DEFAULT;
  }

  return ERROR_MESSAGES.DEFAULT;
}

/**
 * Affiche une alerte d'erreur à l'utilisateur
 */
export function showErrorAlert(
  error: unknown,
  title: string = "Erreur",
  onDismiss?: () => void
): void {
  const message = getErrorMessage(error);

  Alert.alert(title, message, [
    {
      text: "OK",
      onPress: onDismiss,
    },
  ]);
}

/**
 * Gère une erreur de manière silencieuse (pour les opérations non-critiques)
 */
export function handleSilentError(error: unknown, context?: string): void {
  // En développement, on peut logger dans la console pour le debug
  if (__DEV__) {
    // Optionnel: activer pour le debug
    // console.warn(`[Silent Error${context ? ` - ${context}` : ""}]:`, error);
  }

  // En production, on pourrait envoyer à un service de monitoring
  // Ex: Sentry.captureException(error, { extra: { context } });
}

/**
 * Configure le gestionnaire d'erreurs global
 */
export function setupGlobalErrorHandler(): void {
  // Gestionnaire pour les erreurs JavaScript non capturées
  const originalHandler = ErrorUtils.getGlobalHandler();

  ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    if (__DEV__) {
      // En développement, on laisse le comportement par défaut
      originalHandler(error, isFatal);
    } else {
      // En production, on peut envoyer l'erreur à un service de monitoring
      // Ex: Sentry.captureException(error, { extra: { isFatal } });

      if (isFatal) {
        // Pour les erreurs fatales, on affiche une alerte
        Alert.alert(
          "Erreur critique",
          "L'application a rencontré un problème. Veuillez la redémarrer.",
          [{ text: "OK" }]
        );
      }
    }
  });

  // Gestionnaire pour les promesses rejetées non gérées
  if (typeof global !== "undefined") {
    const g = global as any;
    if (!g.HermesInternal) {
      // React Native sans Hermes
      const originalRejectionHandler = g.onunhandledrejection;

      g.onunhandledrejection = (event: {
        reason: any;
        promise: Promise<any>;
      }) => {
        handleSilentError(event.reason, "Unhandled Promise Rejection");

        if (originalRejectionHandler) {
          originalRejectionHandler(event);
        }
      };
    }
  }
}

/**
 * Wrapper pour les appels async avec gestion d'erreur
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  options?: {
    showAlert?: boolean;
    alertTitle?: string;
    onError?: (error: unknown) => void;
    fallback?: T;
  }
): Promise<T | undefined> {
  try {
    return await operation();
  } catch (error) {
    if (options?.showAlert !== false) {
      showErrorAlert(error, options?.alertTitle);
    }

    options?.onError?.(error);

    return options?.fallback;
  }
}

/**
 * Vérifie si une erreur est une erreur réseau
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof NetworkError) return true;

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("timeout") ||
      message.includes("connection")
    );
  }

  return false;
}

/**
 * Vérifie si une erreur est une erreur d'authentification
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof AuthError) return true;

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("auth") ||
      message.includes("token") ||
      message.includes("session") ||
      message.includes("unauthorized") ||
      message.includes("401")
    );
  }

  return false;
}
