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
    const requestBody = await req.json();

    if (!requestBody) {
      return new Response(JSON.stringify({ error: { message: 'Request body is required' } }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const API_KEY = process.env.API_KEY;

    if (!API_KEY) {
      throw new Error("API_KEY is not set in the server environment.");
    }

    // *** FIX: Use the streaming endpoint instead of the standard one ***
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=${API_KEY}`;
    
    const geminiResponse = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    // If Gemini returned an error up-front, handle it immediately.
    if (!geminiResponse.ok) {
       const errorData = await geminiResponse.json();
       return new Response(JSON.stringify(errorData), {
        status: geminiResponse.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // ** CRUCIAL FIX **
    // Instead of waiting for the full JSON, we return the response body directly.
    // The Edge runtime will automatically stream this body to the client.
    // This solves the 10-second timeout issue.
    return new Response(geminiResponse.body, {
      status: 200,
      headers: { 
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });

  } catch (error: any) {
    console.error("Serverless function error:", error);
    return new Response(JSON.stringify({ error: { message: 'Internal Server Error', details: error.message } }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
