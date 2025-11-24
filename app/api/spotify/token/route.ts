export const dynamic = "force-dynamic";

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

export async function POST(req: Request) {
  try {
    const text = await req.text();
    const incoming = new URLSearchParams(text);

    // Prefer server-only env vars
    const clientId =
      process.env.SPOTIFY_CLIENT_ID || process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    if (!clientId) {
      return new Response(
        JSON.stringify({ error: "Missing SPOTIFY_CLIENT_ID (or NEXT_PUBLIC_SPOTIFY_CLIENT_ID)" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Rebuild params and optionally use Basic auth when client secret is available
    const params = new URLSearchParams();
    const useBasic = Boolean(clientSecret);
    // Allow only expected params to pass through
    const allow = new Set([
      "grant_type",
      "code",
      "redirect_uri",
      "code_verifier",
      "refresh_token",
    ]);
    for (const [k, v] of incoming.entries()) {
      if (allow.has(k) && v != null && v !== "") params.set(k, v);
    }
    // With PKCE/public client we include client_id in the body
    if (!useBasic) {
      params.set("client_id", clientId);
    }

    // Build headers. If we have a client secret, we use Basic auth per Authorization Code Flow
    const headers: Record<string, string> = {
      "Content-Type": "application/x-www-form-urlencoded",
    };
    if (useBasic) {
      const token = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
      headers["Authorization"] = `Basic ${token}`;
    }

    const res = await fetch(SPOTIFY_TOKEN_URL, {
      method: "POST",
      headers,
      body: params,
      // Route handler runs on server; direct outbound call
      cache: "no-store",
    });

    const body = await res.text();
    return new Response(body, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: unknown) {
    const message = e && typeof e === "object" && "message" in e ? String((e as { message?: unknown }).message) : "Spotify proxy error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
