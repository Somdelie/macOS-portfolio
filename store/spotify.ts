/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { create } from "zustand";

type SpotifyUser = {
  id: string;
  display_name?: string;
  images?: { url: string }[];
};

type SpotifyPlaylist = {
  id: string;
  name: string;
  images?: { url: string }[];
};

// Minimal representation of a user's liked (saved) track
export type SpotifyLikedTrack = {
  id: string;
  name: string;
  artists: string;
  image?: string;
  preview_url?: string | null;
  external_url?: string;
};

type SpotifyState = {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null; // epoch ms
  user: SpotifyUser | null;
  playlists: SpotifyPlaylist[];
  likedTracks: SpotifyLikedTrack[];
  isLoading: boolean;
  error: string | null;
  login: () => Promise<void>;
  handleCallback: (code: string) => Promise<boolean>;
  // Support implicit grant fallback (when provider returns access_token in URL hash)
  handleImplicit: (accessToken: string, expiresIn?: number, refreshToken?: string | null) => Promise<boolean>;
  refreshIfNeeded: () => Promise<void>;
  fetchMe: () => Promise<void>;
  fetchPlaylists: () => Promise<void>;
  fetchLikedTracks: () => Promise<void>;
  logout: () => void;
};

const STORAGE_KEY = "spotifyAuth:v1";

const saveAuth = (data: Partial<Pick<SpotifyState, "accessToken" | "refreshToken" | "expiresAt" | "user">>) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const base = raw ? JSON.parse(raw) : {};
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...base, ...data }));
  } catch {}
};

const loadAuth = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {} as Partial<SpotifyState>;
    return JSON.parse(raw) as Partial<SpotifyState>;
  } catch {
    return {} as Partial<SpotifyState>;
  }
};

// PKCE helpers
const generateCodeVerifier = (len = 128) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let out = "";
  const array = new Uint32Array(len);
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(array);
    for (let i = 0; i < len; i++) out += chars[array[i] % chars.length];
  } else {
    for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
};

const sha256 = async (plain: string) => {
  const enc = new TextEncoder().encode(plain);
  const digest = await crypto.subtle.digest("SHA-256", enc);
  return new Uint8Array(digest);
};

const base64url = (bytes: Uint8Array) => {
  let str = "";
  bytes.forEach((b) => (str += String.fromCharCode(b)));
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const createCodeChallenge = async (verifier: string) => base64url(await sha256(verifier));

// Configurable endpoints via env (client-side)
// Auth URL (authorization endpoint)
const SPOTIFY_AUTH_URL =
  process.env.NEXT_PUBLIC_SPOTIFY_AUTH_URL ||
  process.env.AUTH_URL ||
  "https://accounts.spotify.com/authorize";

// Use a server-side proxy route to avoid CORS issues on the token endpoint
// Can be overridden in env to point to a different proxy if needed
const SPOTIFY_TOKEN_URL =
  process.env.NEXT_PUBLIC_SPOTIFY_TOKEN_URL || "/api/spotify/token";

// Base API URL
const SPOTIFY_API_URL =
  process.env.NEXT_PUBLIC_SPOTIFY_API_URL || "https://api.spotify.com/v1";

const DEFAULT_SCOPES = [
  "user-read-email",
  "user-read-private",
  "playlist-read-private",
  "playlist-read-collaborative",
  // Needed to access user's Liked Songs
  "user-library-read",
];

const useSpotifyStore = create<SpotifyState>()((set, get) => {
  // hydrate from storage
  const initial = loadAuth() as Partial<SpotifyState>;
  return {
    accessToken: initial.accessToken ?? null,
    refreshToken: initial.refreshToken ?? null,
    expiresAt: initial.expiresAt ?? null,
    user: initial.user ?? null,
    playlists: [],
    likedTracks: [],
    isLoading: false,
    error: null,

    login: async () => {
      // Start login flow; show feedback if misconfigured
      const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
      // Default to PKCE (recommended); allow overriding with NEXT_PUBLIC_SPOTIFY_AUTH_FLOW=code to disable PKCE
      const flow = (process.env.NEXT_PUBLIC_SPOTIFY_AUTH_FLOW || "pkce").toLowerCase();
      if (!clientId) {
        // Surface a visible error so the user knows why clicking did nothing
        set({ error: "Spotify is not configured. Set NEXT_PUBLIC_SPOTIFY_CLIENT_ID.", isLoading: false });
        return;
      }
      set({ isLoading: true, error: null });
      // Allow configuring redirect URI explicitly to avoid INVALID_CLIENT redirect_uri mismatches
      const redirectUri =
        process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || `${window.location.origin}/spotify/callback`;

      const params = new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        scope: DEFAULT_SCOPES.join(" "),
        redirect_uri: redirectUri,
      });

      // Use PKCE unless explicitly disabled via flow=code
      if (flow !== "code") {
        const verifier = generateCodeVerifier();
        const challenge = await createCodeChallenge(verifier);
        sessionStorage.setItem("spotify:code_verifier", verifier);
        params.set("code_challenge_method", "S256");
        params.set("code_challenge", challenge);
      }

      window.location.href = `${SPOTIFY_AUTH_URL}?${params.toString()}`;
    },

    handleCallback: async (code: string) => {
      try {
        set({ isLoading: true, error: null });
        const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID as string;
        // Default to PKCE (recommended); allow overriding with NEXT_PUBLIC_SPOTIFY_AUTH_FLOW=code to disable PKCE
        const flow = (process.env.NEXT_PUBLIC_SPOTIFY_AUTH_FLOW || "pkce").toLowerCase();
        const verifier = sessionStorage.getItem("spotify:code_verifier") || "";
        const redirectUri =
          process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || `${window.location.origin}/spotify/callback`;
        const body = new URLSearchParams({
          client_id: clientId,
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
        });
        if (flow !== "code") {
          // PKCE requires code_verifier
          body.set("code_verifier", verifier);
        }

        const res = await fetch(SPOTIFY_TOKEN_URL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body,
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Token exchange failed: ${res.status} ${txt}`);
        }
        const data = await res.json();
        const now = Date.now();
        const expiresAt = now + (data.expires_in ? data.expires_in * 1000 : 3600_000);
        const accessToken = data.access_token as string;
        const refreshToken = (data.refresh_token as string) || get().refreshToken;
        set({ accessToken, refreshToken, expiresAt, isLoading: false });
        saveAuth({ accessToken, refreshToken, expiresAt });
        await get().fetchMe();
        await get().fetchPlaylists();
        await get().fetchLikedTracks();
        return true;
      } catch (e: unknown) {
        const message = e && typeof e === "object" && "message" in e ? String((e as { message?: unknown }).message) : "Spotify auth failed";
        set({ error: message, isLoading: false });
        return false;
      }
    },

    // Handle implicit grant (access_token returned in URL hash). Not recommended, but keeps deployed
    // instances working if the auth app is configured that way.
    handleImplicit: async (accessToken: string, expiresIn?: number, refreshToken?: string | null) => {
      try {
        const now = Date.now();
        const expiresAt = now + ((expiresIn ?? 3600) * 1000);
        set({ accessToken, refreshToken: refreshToken ?? null, expiresAt, isLoading: false, error: null });
        saveAuth({ accessToken, refreshToken: refreshToken ?? null, expiresAt });
        await get().fetchMe();
        await get().fetchPlaylists();
        await get().fetchLikedTracks();
        return true;
      } catch {
        set({ isLoading: false, error: "Failed to handle implicit token" });
        return false;
      }
    },

    refreshIfNeeded: async () => {
      const { expiresAt, refreshToken } = get();
      if (!refreshToken) return;
      const skew = 60_000; // 1 min early
      if (expiresAt && Date.now() < expiresAt - skew) return;
      try {
        const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID as string;
        const body = new URLSearchParams({
          client_id: clientId,
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        });
        const res = await fetch(SPOTIFY_TOKEN_URL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body,
        });
        if (!res.ok) return;
        const data = await res.json();
        const now = Date.now();
        const expiresAt = now + (data.expires_in ? data.expires_in * 1000 : 3600_000);
        const accessToken = data.access_token as string;
        const newRefresh = (data.refresh_token as string) || refreshToken;
        set({ accessToken, refreshToken: newRefresh, expiresAt });
        saveAuth({ accessToken, refreshToken: newRefresh, expiresAt });
      } catch {}
    },

    fetchMe: async () => {
      const { accessToken } = get();
      if (!accessToken) return;
      try {
        const res = await fetch(`${SPOTIFY_API_URL}/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const user = (await res.json()) as SpotifyUser;
        set({ user });
        saveAuth({ user });
      } catch (e) {
        // ignore
      }
    },

    fetchPlaylists: async () => {
      const { accessToken, refreshIfNeeded } = get();
      if (!accessToken) return;
      await refreshIfNeeded();
      try {
        const res = await fetch(`${SPOTIFY_API_URL}/me/playlists?limit=50`, {
          headers: { Authorization: `Bearer ${get().accessToken}` },
        });
        if (!res.ok) throw new Error("Failed to fetch playlists");
        const data = (await res.json()) as unknown;
        const items = Array.isArray((data as { items?: unknown }).items)
          ? ((data as { items?: unknown[] }).items as unknown[])
          : [];
        const playlists: SpotifyPlaylist[] = items.map((it) => {
          const obj = it as { id?: string; name?: string; images?: { url: string }[] };
          return {
            id: obj.id ?? "",
            name: obj.name ?? "",
            images: obj.images,
          };
        });
        set({ playlists });
      } catch (e) {
        // ignore for now
      }
    },

    // Fetch user's saved tracks (Liked Songs)
    fetchLikedTracks: async () => {
      const { accessToken, refreshIfNeeded } = get();
      if (!accessToken) return;
      await refreshIfNeeded();
      try {
        const out: SpotifyLikedTrack[] = [];
        let url = `${SPOTIFY_API_URL}/me/tracks?limit=50`;
        for (let i = 0; i < 4; i++) { // cap to ~200 to keep light
          const res = await fetch(url, { headers: { Authorization: `Bearer ${get().accessToken}` } });
          if (!res.ok) break;
          const data = (await res.json()) as {
            items?: {
              track?: {
                id?: string;
                name?: string;
                preview_url?: string | null;
                external_urls?: { spotify?: string };
                artists?: { name?: string }[];
                album?: { images?: { url: string }[] };
              };
            }[];
            next?: string | null;
          };
          const items = data.items ?? [];
          for (const it of items) {
            const t = it.track;
            if (!t?.id) continue;
            out.push({
              id: t.id,
              name: t.name ?? "Unknown",
              artists: (t.artists ?? []).map((a) => a.name ?? "").filter(Boolean).join(", "),
              image: t.album?.images?.[0]?.url,
              preview_url: t.preview_url ?? null,
              external_url: t.external_urls?.spotify,
            });
          }
          if (!data.next) break;
          url = data.next;
        }
        set({ likedTracks: out });
      } catch {
        // no-op
      }
    },

    logout: () => {
      set({ accessToken: null, refreshToken: null, expiresAt: null, user: null, playlists: [], likedTracks: [] });
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    },
  };
});

export default useSpotifyStore;
