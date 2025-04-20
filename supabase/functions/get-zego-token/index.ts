
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

    console.log(`Generating token for roomId: ${roomId}, userId: ${userId}`)

    const timestamp = Math.floor(Date.now() / 1000) + 3600
    const payload = {
      app_id: appID,
      user_id: userId,
      room_id: roomId,
      privilege: {
        1: 1, // Login privilege
        2: 1  // Publish privilege
      },
      stream_id_list: null,
      payload: JSON.stringify({
        user_name: userName || 'Anonymous',
        room_name: `Room ${roomId}`
      })
    }

    const payloadString = JSON.stringify(payload)
    const encodedPayload = btoa(payloadString)
    
    // Create signature using crypto
    const signContent = `${appID}${timestamp}${encodedPayload}`
    const encoder = new TextEncoder();
    const signatureData = encoder.encode(signContent);
    const secretData = encoder.encode(serverSecret);
    
    const key = await crypto.subtle.importKey(
      "raw",
      secretData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signature = await crypto.subtle.sign("HMAC", key, signatureData);
    const hashHex = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const token = {
      signature: hashHex,
      app_id: appID,
      nonce: 0,
      timestamp,
      payload: encodedPayload
    }

    console.log('Token generated successfully')

    return new Response(
      JSON.stringify({ token: btoa(JSON.stringify(token)) }),
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
