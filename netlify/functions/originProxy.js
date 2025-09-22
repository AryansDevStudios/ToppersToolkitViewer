export async function handler(event) {
    // --- Handle CORS preflight ---
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      };
    }
  
    const targetUrl = event.queryStringParameters.url;
  
    // --- 1️⃣ Validate input ---
    if (!targetUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Missing "url" query parameter',
          example: '/.netlify/functions/proxy?url=https://example.com'
        }),
      };
    }
  
    let parsed;
    try {
      parsed = new URL(targetUrl);
    } catch {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid URL format' }),
      };
    }
  
    try {
      // --- 2️⃣ Forward request ---
      const response = await fetch(parsed.toString(), {
        method: event.httpMethod,
        headers: {
          // Forward minimal safe headers
          "Content-Type": event.headers["content-type"] || undefined,
        },
        body: (event.httpMethod !== "GET" && event.httpMethod !== "HEAD")
          ? event.body
          : undefined,
      });
  
      // --- 3️⃣ Read and return ---
      const text = await response.text();
      const contentType =
        response.headers.get("content-type") || "text/plain; charset=utf-8";
  
      return {
        statusCode: response.status,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": contentType,
        },
        body: text,
      };
  
    } catch (err) {
      console.error("Proxy fetch error:", err);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Failed to fetch target URL",
          details: err.message,
        }),
      };
    }
  }
  