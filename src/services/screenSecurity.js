import { Capacitor, registerPlugin } from "@capacitor/core";

const ScreenSecurity = registerPlugin("ScreenSecurity");

export async function setAndroidSecureScreen(enabled) {
  if (Capacitor.getPlatform() !== "android") return;

  try {
    await ScreenSecurity.setSecure({ enabled: !!enabled });
  } catch (error) {
    console.error("ScreenSecurity toggle failed", error);
  }
}
