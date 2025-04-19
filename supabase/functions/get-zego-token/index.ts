
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createHash, createHmac as createDenoHmac } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { roomId, userId, userName } = await req.json()
    
    if (!roomId || !userId) {
      throw new Error('Missing required parameters: roomId and userId are required')
    }
    
    const appID = parseInt(Deno.env.get('ZEGOCLOUD_APP_ID') || '0')
    const serverSecret = Deno.env.get('ZEGOCLOUD_SERVER_SECRET') || ''

    if (!appID || !serverSecret) {
      throw new Error('Missing Zegocloud credentials')
    }

    const kitToken = generateToken(appID, serverSecret, roomId, userId, userName || 'Anonymous')

    console.log(`Token generated successfully for room: ${roomId}, user: ${userId}`)
    
    return new Response(
      JSON.stringify({ token: kitToken }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Token generation error:', error.message)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      },
    )
  }
})

// Create a compatible implementation of createHmac
function createHmac(algorithm: string, key: string) {
  const keyData = new TextEncoder().encode(key);
  const hmac = createDenoHmac(algorithm, keyData);
  
  return {
    update(data: string) {
      hmac.update(new TextEncoder().encode(data));
      return this;
    },
    digest(encoding: string) {
      if (encoding === 'hex') {
        return Array.from(new Uint8Array(hmac.digest()))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
      }
      return hmac.digest();
    }
  };
}

function generateToken(
  appID: number,
  serverSecret: string,
  roomID: string,
  userID: string,
  userName: string,
  seconds: number = 3600
): string {
  const timestamp = Math.floor(Date.now() / 1000) + seconds;
  
  const payload = {
    app_id: appID,
    user_id: userID,
    room_id: roomID,
    privilege: {
      1: 1, // Login privilege
      2: 1  // Publish privilege
    },
    stream_id_list: null,
    payload: JSON.stringify({
      user_name: userName,
      room_name: `Room ${roomID}`
    })
  };
  
  const payloadString = JSON.stringify(payload);
  const encodedPayload = btoa(payloadString);
  
  // Create signature
  const signatureContent = `${appID}${timestamp}${encodedPayload}`;
  const hmac = createHmac("sha256", serverSecret);
  hmac.update(signatureContent);
  const signature = hmac.digest("hex");
  
  // Combine the token parts
  const tokenInfo = {
    signature: signature,
    app_id: appID,
    nonce: 0, // We're not using nonce
    timestamp,
    payload: encodedPayload
  };
  
  return btoa(JSON.stringify(tokenInfo));
}
