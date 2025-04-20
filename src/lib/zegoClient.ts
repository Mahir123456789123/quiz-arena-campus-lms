
import { ZegoExpressEngine } from "zego-express-engine-webrtc";

let zegoClient: ZegoExpressEngine | null = null;

export const createZegoClient = async (token: string): Promise<ZegoExpressEngine> => {
  try {
    const tokenData = JSON.parse(atob(token));
    const appId = tokenData.app_id;
    
    if (!zegoClient) {
      zegoClient = new ZegoExpressEngine(appId, "wss://webliveroom-api.zegocloud.com/ws");
    }
    
    return zegoClient;
  } catch (error) {
    console.error('Error creating Zego client:', error);
    throw error;
  }
};

export const destroyZegoClient = () => {
  if (zegoClient) {
    zegoClient.destroy();
    zegoClient = null;
  }
};
