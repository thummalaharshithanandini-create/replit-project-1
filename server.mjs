import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(root, "public");
const port = Number(process.env.PORT || 5000);
const host = "0.0.0.0";
const languages = new Set(["en", "te", "hi", "ta", "kn", "ml"]);
const maxBodyBytes = 16_384;

function sendJson(response, status, value) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  response.end(JSON.stringify(value));
}

async function readJson(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (Buffer.byteLength(body) > maxBodyBytes) {
      throw new Error("Request body is too large");
    }
  }
  return JSON.parse(body || "{}");
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  try {
    const parsed = new URL(url);
    if (!["https:", "http:"].includes(parsed.protocol)) return null;
  } catch {
    return null;
  }
  return { url, serviceKey };
}

async function handlePreferences(request, response, url) {
  const config = getSupabaseConfig();
  if (!config) {
    sendJson(response, 503, { error: "Preference sync is not configured" });
    return;
  }

  const deviceId = url.searchParams.get("deviceId") || "";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(deviceId)) {
    sendJson(response, 400, { error: "Invalid device identifier" });
    return;
  }

  const endpoint = `${config.url}/rest/v1/pantry_preferences`;
  const headers = {
    apikey: config.serviceKey,
    authorization: `Bearer ${config.serviceKey}`,
    accept: "application/json",
  };

  try {
    if (request.method === "GET") {
      const query = new URLSearchParams({
        device_id: `eq.${deviceId}`,
        select: "language,ingredients",
        limit: "1",
      });
      const result = await fetch(`${endpoint}?${query}`, { headers });
      if (!result.ok) {
        sendJson(response, 502, { error: "Preference sync is temporarily unavailable" });
        return;
      }
      const rows = await result.json();
      sendJson(response, 200, { preferences: rows[0] || null });
      return;
    }

    if (request.method === "PUT") {
      const payload = await readJson(request);
      if (!languages.has(payload.language)) {
        sendJson(response, 400, { error: "Unsupported language" });
        return;
      }
      if (!Array.isArray(payload.ingredients) || payload.ingredients.length > 20 ||
          payload.ingredients.some((item) => typeof item !== "string" || item.length > 80)) {
        sendJson(response, 400, { error: "Invalid ingredient list" });
        return;
      }
      const result = await fetch(`${endpoint}?on_conflict=device_id`, {
        method: "POST",
        headers: {
          ...headers,
          "content-type": "application/json",
          prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify({
          device_id: deviceId,
          language: payload.language,
          ingredients: payload.ingredients,
          updated_at: new Date().toISOString(),
        }),
      });
      if (!result.ok) {
        sendJson(response, 502, { error: "Preference sync is temporarily unavailable" });
        return;
      }
      sendJson(response, 200, { ok: true });
      return;
    }

    sendJson(response, 405, { error: "Method not allowed" });
  } catch (error) {
    const message = error instanceof SyntaxError ? "Invalid JSON body" : "Preference sync is temporarily unavailable";
    sendJson(response, error instanceof SyntaxError ? 400 : 502, { error: message });
  }
}

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

  if (url.pathname === "/api/config" && request.method === "GET") {
    sendJson(response, 200, { supabaseEnabled: Boolean(getSupabaseConfig()) });
    return;
  }
  if (url.pathname === "/api/preferences" && ["GET", "PUT"].includes(request.method || "")) {
    await handlePreferences(request, response, url);
    return;
  }
  if (url.pathname.startsWith("/api/")) {
    sendJson(response, 404, { error: "Not found" });
    return;
  }

  const requestedPath = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const filePath = path.resolve(publicDir, `.${requestedPath}`);
  if (!filePath.startsWith(`${publicDir}${path.sep}`) && filePath !== path.join(publicDir, "index.html")) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const fileInfo = await stat(filePath);
    if (!fileInfo.isFile()) throw new Error("Not a file");
    const content = await readFile(filePath);
    response.writeHead(200, {
      "content-type": mimeTypes[path.extname(filePath)] || "application/octet-stream",
      "cache-control": "no-cache",
      "x-content-type-options": "nosniff",
    });
    response.end(content);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

server.listen(port, host, () => {
  console.log(`Rasoi is running at http://${host}:${port}`);
});
