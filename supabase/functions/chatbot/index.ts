
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as GoogleGenerativeAI from "https://esm.sh/v135/google-generativeai@0.5.0";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
if (!geminiApiKey) {
  console.error('Gemini API Key is missing');
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, student_id } = await req.json();

    // Initialize Gemini
    const genai = new GoogleGenerativeAI.GoogleGenerativeAI(geminiApiKey);
    const model = genai.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Construct prompt
    const prompt = `
      You are a helpful academic chatbot. 
      Student ID: ${student_id}
      User Question: ${message}
      Provide a helpful and friendly academic response.
    `;

    // Generate response
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return new Response(JSON.stringify({ response }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Chatbot function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
