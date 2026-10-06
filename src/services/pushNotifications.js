import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { savePushTokenInFirebase } from "../firebase";

let registeredUid = "";
let listenersReady = false;
let activeUid = "";

export async function registerPushNotificationsForUser(user) {
  const uid = String(user?.uid || "").trim();
  if (!uid || !Capacitor.isNativePlatform()) {
    return { ok: false, skipped: true };
  }

  activeUid = uid;

  if (!listenersReady) {
    PushNotifications.addListener("registration", async (token) => {
      try {
        await savePushTokenInFirebase({
          token: token?.value || "",
          userUid: activeUid,
          platform: Capacitor.getPlatform(),
        });
      } catch (error) {
        console.warn("Failed to save push token", error);
      }
    });
    PushNotifications.addListener("registrationError", (error) => {
      console.warn("Push notification registration failed", error);
    });
    listenersReady = true;
  }

  const permission = await PushNotifications.checkPermissions();
  const nextPermission = permission.receive === "prompt"
    ? await PushNotifications.requestPermissions()
    : permission;

  if (nextPermission.receive !== "granted") {
    return { ok: false, permission: nextPermission.receive };
  }

  if (Capacitor.getPlatform() === "android") {
    await PushNotifications.createChannel({
      id: "default",
      name: "General Notifications",
      description: "App broadcast notifications",
      importance: 5,
      visibility: 1,
      sound: "default",
    }).catch(() => undefined);
  }

  if (registeredUid !== uid) {
    registeredUid = uid;
    await PushNotifications.register();
  }

  return { ok: true };
}
