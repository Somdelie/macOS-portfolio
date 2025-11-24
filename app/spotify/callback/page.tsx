/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useRef, useState } from "react";
import useSpotifyStore from "@/store/spotify";
import useWindowStore from "@/store/window";

// Simple OAuth callback handler for Spotify PKCE flow
export default function SpotifyCallbackPage() {
  const { handleCallback, handleImplicit } = useSpotifyStore();
  const { openWindow } = useWindowStore();
  const [msg, setMsg] = useState("Completing Spotify sign-in...");
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    // Some configurations return parameters in the URL hash (implicit grant)
    const hash = window.location.hash?.startsWith("#") ? window.location.hash.slice(1) : "";
    const hashParams = new URLSearchParams(hash);
    const hashError = hashParams.get("error");
    const accessToken = hashParams.get("access_token");
    const expiresInStr = hashParams.get("expires_in");

    const fail = (message: string) => {
      setMsg(message);
    };

    (async () => {
      if (error || hashError) {
        fail(`Spotify sign-in failed: ${error || hashError}`);
        return;
      }

      if (accessToken) {
        // Handle implicit grant fallback gracefully
        const expiresIn = expiresInStr ? Number(expiresInStr) : undefined;
        const ok = await handleImplicit(accessToken, expiresIn, null);
        if (ok) {
          setMsg("Signed in! Redirecting to Music...");
          openWindow("music", null);
          setTimeout(() => {
            window.location.replace("/");
          }, 400);
        } else {
          fail("Failed to accept access token from provider.");
        }
        return;
      }

      if (code) {
        const ok = await handleCallback(code);
        if (ok) {
          setMsg("Signed in! Redirecting to Music...");
          // Open/bring Music window to front
          openWindow("music", null);
          // Redirect back to root
          setTimeout(() => {
            window.location.replace("/");
          }, 400);
        } else {
          fail("Failed to complete sign-in.");
        }
        return;
      }

      // Neither code nor access token present
      fail("Missing authorization response. Please try signing in again from the Music window.");
    })();
  }, [handleCallback, handleImplicit, openWindow]);

  return (
    <main className="w-dvw h-dvh flex items-center justify-center text-white">
      <div className="rounded-xl bg-black/40 backdrop-blur-md p-6 text-sm flex flex-col gap-3 max-w-[520px] text-center">
        <div>{msg}</div>
        <div>
          <a href="/" className="underline text-blue-200 hover:text-blue-100">Back to home</a>
        </div>
      </div>
    </main>
  );
}
