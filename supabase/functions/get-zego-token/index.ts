
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { roomId, userId, userName } = await req.json()
    
    const appID = parseInt(Deno.env.get('ZEGOCLOUD_APP_ID') || '')
    const serverSecret = Deno.env.get('ZEGOCLOUD_SERVER_SECRET') || ''

    if (!appID || !serverSecret) {
      throw new Error('Missing Zegocloud credentials')
    }

    // Generate token using the npm package
    const kitToken = await generateToken(appID, serverSecret, roomId, userId, userName)

    return new Response(
      JSON.stringify({ token: kitToken }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      },
    )
  }
})

async function generateToken(
  appID: number,
  serverSecret: string,
  roomID: string,
  userID: string,
  userName: string
): Promise<string> {
  // Implementation would go here - for now return a mock token
  return "mock-token-for-testing"
}
