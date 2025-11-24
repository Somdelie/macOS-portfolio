/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import useSpotifyStore from "@/store/spotify";
import useWindowStore from "@/store/window";

// Simple OAuth callback handler for Spotify PKCE flow
export default function SpotifyCallbackPage() {
  const { handleCallback } = useSpotifyStore();
  const { openWindow } = useWindowStore();
  const [msg, setMsg] = useState("Completing Spotify sign-in...");

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");
    if (error) {
      setMsg(`Spotify sign-in failed: ${error}`);
      return;
    }
    if (!code) {
      setMsg("Missing authorization code.");
      return;
    }
    (async () => {
      const ok = await handleCallback(code);
      if (ok) {
        setMsg("Signed in! Redirecting to Music...");
        // Open/bring Music window to front
        openWindow("music", null);
        // Redirect back to root
        setTimeout(() => {
          window.location.replace("/");
        }, 500);
      } else {
        setMsg("Failed to complete sign-in.");
      }
    })();
  }, [handleCallback, openWindow]);

  return (
    <main className="w-dvw h-dvh flex items-center justify-center text-white">
      <div className="rounded-xl bg-black/40 backdrop-blur-md p-6 text-sm">
        {msg}
      </div>
    </main>
  );
}
