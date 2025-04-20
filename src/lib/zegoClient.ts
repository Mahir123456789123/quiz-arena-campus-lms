
import { ZegoExpressEngine } from "zego-express-engine-webrtc";

let zegoClient: ZegoExpressEngine | null = null;
let isClientDestroyed = false;

export const createZegoClient = async (token: string): Promise<ZegoExpressEngine> => {
  try {
    const tokenData = JSON.parse(atob(token));
    const appId = tokenData.app_id;

    if (!zegoClient) {
      zegoClient = new ZegoExpressEngine(appId, "wss://webliveroom-api.zegocloud.com/ws");
      console.log("✅ Zego client created");
      isClientDestroyed = false;
    } else if (isClientDestroyed) {
      console.log("⚠️ Reusing destroyed client");
      zegoClient = new ZegoExpressEngine(appId, "wss://webliveroom-api.zegocloud.com/ws");
    }

    return zegoClient;
  } catch (error) {
    console.error("❌ Error creating Zego client:", error);
    throw error;
  }
};

export const destroyZegoClient = async () => {
  if (zegoClient && !isClientDestroyed) {
    try {
      await zegoClient.logoutRoom();  // Make sure to log out of the room first
      console.log("🧹 Logged out from room");
    } catch (error) {
      console.warn("⚠️ Error logging out from room:", error);
    } finally {
      // Optional: Clean up resources if needed (re-initialize client)
      zegoClient = null;
      isClientDestroyed = true;
      console.log("🧹 Zego client destroyed");
    }
  }
};
