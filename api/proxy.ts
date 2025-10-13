// This file runs on Vercel's servers, not in the browser.
// We are using the native fetch API.

// Vercel specific configuration to use the Edge runtime for speed.
export const config = {
  runtime: 'edge',
};

// The main function that handles requests to /api/proxy
export default async function handler(req: Request) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: { message: 'Method not allowed' } }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Get the request body sent by the frontend
    const requestBody = await req.json();

    if (!requestBody) {
      return new Response(JSON.stringify({ error: { message: 'Request body is required' } }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // This is where the magic happens. We get the API key from Vercel's
    // secure environment variables. It's never exposed to the public.
    const API_KEY = process.env.API_KEY;

    if (!API_KEY) {
      // This error will appear in your Vercel logs, not the user's browser.
      throw new Error("API_KEY is not set in the server environment.");
    }

    // The official Google Gemini API endpoint
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
    
    // Call the Gemini API with the exact body the frontend sent us.
    const geminiResponse = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    // **FIX:** Instead of streaming, we wait for the full response from Gemini.
    const responseData = await geminiResponse.json();

    // If Gemini returned an error, we forward it.
    if (!geminiResponse.ok) {
       return new Response(JSON.stringify(responseData), {
        status: geminiResponse.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // We send the complete, valid JSON response back to the client.
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("Serverless function error:", error);
    return new Response(JSON.stringify({ error: { message: 'Internal Server Error', details: error.message } }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}