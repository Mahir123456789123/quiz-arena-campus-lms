
import { ZegoExpressEngine } from "zego-express-engine-webrtc";

let zegoClient: ZegoExpressEngine | null = null;

export const createZegoClient = async (token: string): Promise<ZegoExpressEngine> => {
  try {
    // Parse the token to get the app ID
    const tokenData = JSON.parse(atob(token));
    const appId = tokenData.app_id;
    
    if (!zegoClient) {
      zegoClient = new ZegoExpressEngine(appId, "wss://webliveroom-api.zegocloud.com/ws");
      console.log("✅ Zego client created successfully");
    }
    
    return zegoClient;
  } catch (error) {
    console.error("❌ Error creating Zego client:", error);
    throw error;
  }
};

export const destroyZegoClient = async () => {
  if (zegoClient) {
    try {
      await zegoClient.logoutRoom();
      console.log("🔄 Logged out from room successfully");
      
      // Destroy the engine
      zegoClient.destroyEngine();
      zegoClient = null;
      console.log("🧹 Zego client destroyed successfully");
    } catch (error) {
      console.error("❌ Error destroying Zego client:", error);
      throw error;
    }
  }
};
