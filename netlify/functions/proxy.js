// Netlify Function: Universal proxy with CORS
// Handles PDFs, images, JS, CSS, JSON, etc.

export async function handler(event) {
  try {
    const url = event.queryStringParameters.url;

    if (!url) {
      return {
        statusCode: 400,
        body: "❌ Missing ?url= query parameter"
      };
    }

    // Basic security: allow only http/https URLs
    if (!/^https?:\/\//.test(url)) {
      return {
        statusCode: 400,
        body: "❌ Invalid URL. Must start with http:// or https://"
      };
    }

    // Fetch from remote server
    const response = await fetch(url);
    if (!response.ok) {
      return {
        statusCode: response.status,
        body: `❌ Failed to fetch resource: ${response.statusText}`
      };
    }

    // Read content
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "application/octet-stream";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600" // cache for 1 hour
      },
      body: Buffer.from(buffer).toString("base64"),
      isBase64Encoded: true
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: "❌ Proxy error: " + err.message
    };
  }
}