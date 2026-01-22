import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useAuth } from "./AuthContext";
import {
  registerForPushNotifications,
  disablePushNotifications,
  addNotificationReceivedListener,
  addNotificationResponseListener,
  getLastNotificationResponse,
  NotificationData,
} from "../services/notificationService";

interface NotificationContextType {
  pushToken: string | null;
  lastNotification: Notifications.Notification | null;
  notificationsEnabled: boolean;
  enableNotifications: () => Promise<void>;
  disableNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [lastNotification, setLastNotification] =
    useState<Notifications.Notification | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  // Gérer la navigation basée sur les données de notification
  const handleNotificationNavigation = useCallback(
    (data: NotificationData | undefined) => {
      if (!data) return;

      switch (data.type) {
        case "expense":
          if (data.tripId) {
            router.push(`/(tabs)/expenses?tripId=${data.tripId}`);
          }
          break;
        case "destination":
          if (data.tripId) {
            router.push(`/(tabs)/destinations?tripId=${data.tripId}`);
          }
          break;
        case "invitation":
          router.push("/(main)/invitations");
          break;
        default:
          break;
      }
    },
    [router]
  );

  // Initialiser les notifications quand l'utilisateur est connecté
  useEffect(() => {
    if (!user?.id) {
      setPushToken(null);
      setNotificationsEnabled(false);
      return;
    }

    // Enregistrer pour les notifications
    const initNotifications = async () => {
      const token = await registerForPushNotifications(user.id);
      if (token) {
        setPushToken(token);
        setNotificationsEnabled(true);
      }
    };

    initNotifications();

    // Listener pour les notifications reçues en foreground
    notificationListener.current = addNotificationReceivedListener(
      (notification) => {
        setLastNotification(notification);
        // Log removed("Notification reçue:", notification);
      }
    );

    // Listener pour les interactions avec les notifications
    responseListener.current = addNotificationResponseListener((response) => {
      const data = response.notification.request.content
        .data as unknown as NotificationData;
      handleNotificationNavigation(data);
    });

    // Vérifier s'il y a une notification qui a ouvert l'app
    const checkInitialNotification = async () => {
      const response = await getLastNotificationResponse();
      if (response) {
        const data = response.notification.request.content
          .data as unknown as NotificationData;
        handleNotificationNavigation(data);
      }
    };

    checkInitialNotification();

    // Cleanup
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [user?.id, handleNotificationNavigation]);

  // Activer les notifications
  const enableNotifications = async () => {
    if (!user?.id) return;

    const token = await registerForPushNotifications(user.id);
    if (token) {
      setPushToken(token);
      setNotificationsEnabled(true);
    }
  };

  // Désactiver les notifications
  const disableNotifications = async () => {
    if (!user?.id) return;

    await disablePushNotifications(user.id);
    setPushToken(null);
    setNotificationsEnabled(false);
  };

  const value = {
    pushToken,
    lastNotification,
    notificationsEnabled,
    enableNotifications,
    disableNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
