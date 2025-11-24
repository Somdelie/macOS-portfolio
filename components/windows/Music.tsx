/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";

import WindowWrapper from "@/hoc/WindowWrapper";
import WindowControlls from "../common/WindowControlls";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Headphones,
  ListMusic,
  Music2,
  Share2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
} from "lucide-react";
import useSpotifyStore from "@/store/spotify";

type Preset = {
  id: string;
  label: string;
  // Full Spotify embed URL (track, album, playlist, or artist)
  embedUrl: string;
};

type Track = {
  id: string | number;
  title: string;
  artist?: string;
  url: string; // mp3 url
  cover?: string; // image url
};

type Playlist = {
  id: string;
  label: string;
  tracks: Track[];
};

// Renders user's Liked Songs fetched from Spotify
const SpotifyLikedList = () => {
  const { likedTracks, isLoading } = useSpotifyStore();
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (audio.current) {
        audio.current.pause();
      }
    };
  }, []);

  const onPlayClick = (t: { id: string; preview_url?: string | null; external_url?: string }) => {
    if (!t.preview_url) {
      if (t.external_url) window.open(t.external_url, "_blank");
      return;
    }
    if (!audio.current) {
      audio.current = new Audio();
    }
    const el = audio.current;
    if (playingId === t.id && !el.paused) {
      el.pause();
      setPlayingId(null);
      return;
    }
    el.src = t.preview_url;
    el.currentTime = 0;
    el.play().catch(() => {});
    setPlayingId(t.id);
    el.onended = () => setPlayingId(null);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="text-sm text-gray-700 font-medium mb-2">Your Liked Songs</div>
      {isLoading && likedTracks.length === 0 ? (
        <div className="text-xs text-gray-500">Loading…</div>
      ) : likedTracks.length === 0 ? (
        <div className="text-xs text-gray-500">No liked songs found or missing permission.</div>
      ) : (
        <ul className="divide-y divide-gray-100 bg-white rounded-md border border-gray-200 overflow-hidden">
          {likedTracks.map((t) => (
            <li key={t.id} className="flex items-center gap-3 p-2 hover:bg-gray-50">
              {t.image ? (
                <img src={t.image} alt="" className="w-10 h-10 rounded object-cover" />
              ) : (
                <div className="w-10 h-10 rounded bg-gray-200" />)
              }
              <div className="min-w-0 flex-1">
                <div className="text-sm text-gray-800 truncate">{t.name}</div>
                <div className="text-xs text-gray-500 truncate">{t.artists}</div>
              </div>
              <button
                type="button"
                className={`px-3 py-1 rounded text-sm ${t.preview_url ? "bg-blue-600 text-white hover:bg-blue-500" : "bg-gray-200 text-gray-700"}`}
                onClick={() => onPlayClick(t)}
                title={t.preview_url ? (playingId === t.id ? "Pause preview" : "Play preview") : "Open in Spotify"}
              >
                {t.preview_url ? (playingId === t.id ? "Pause" : "Play") : "Open"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const presets: Preset[] = [
  {
    id: "focus",
    label: "Focus Playlist",
    embedUrl:
      "https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator",
  },
  {
    id: "lofi",
    label: "Lo‑Fi Beats",
    embedUrl:
      "https://open.spotify.com/embed/playlist/37i9dQZF1DXdLK5wjKyhVm?utm_source=generator",
  },
  {
    id: "coding",
    label: "Coding Mode",
    embedUrl:
      "https://open.spotify.com/embed/playlist/6xGLprv9fmlMgeAMpW0x51?utm_source=generator",
  },
  {
    id: "radio",
    label: "Chill Radio",
    embedUrl:
      "https://open.spotify.com/embed/artist/3TVXtAsR1Inumwj472S9r4/radio?utm_source=generator",
  },
];

// Lightweight demo playlists using public sample mp3 URLs
const playerPlaylists: Playlist[] = [
  {
    id: "focus",
    label: "Focus Playlist",
    tracks: [
      {
        id: 1,
        title: "Acoustic Breeze",
        artist: "Benjamin Tissot",
        url: "https://www.bensound.com/bensound-music/bensound-acousticbreeze.mp3",
        cover: "/images/music1.jpg",
      },
      {
        id: 2,
        title: "A Day To Remember",
        artist: "Bensound",
        url: "https://www.bensound.com/bensound-music/bensound-remember.mp3",
        cover: "/images/music2.jpg",
      },
    ],
  },
  {
    id: "lofi",
    label: "Lo‑Fi Beats",
    tracks: [
      {
        id: 3,
        title: "Dreams",
        artist: "Bensound",
        url: "https://www.bensound.com/bensound-music/bensound-dreams.mp3",
        cover: "/images/music3.jpg",
      },
      {
        id: 4,
        title: "Slow Motion",
        artist: "Bensound",
        url: "https://www.bensound.com/bensound-music/bensound-slowmotion.mp3",
        cover: "/images/music4.jpg",
      },
    ],
  },
  {
    id: "coding",
    label: "Coding Mode",
    tracks: [
      {
        id: 5,
        title: "Going Higher",
        artist: "Bensound",
        url: "https://www.bensound.com/bensound-music/bensound-goinghigher.mp3",
        cover: "/images/music5.jpg",
      },
      {
        id: 6,
        title: "Energy",
        artist: "Bensound",
        url: "https://www.bensound.com/bensound-music/bensound-energy.mp3",
        cover: "/images/music.png",
      },
    ],
  },
  {
    id: "radio",
    label: "Chill Radio",
    tracks: [
      {
        id: 7,
        title: "Sunny",
        artist: "Bensound",
        url: "https://www.bensound.com/bensound-music/bensound-sunny.mp3",
        cover: "/images/music7.jpg",
      },
      {
        id: 8,
        title: "Tenderness",
        artist: "Bensound",
        url: "https://www.bensound.com/bensound-music/bensound-tenderness.mp3",
        cover: "/images/music8.jpg",
      },
    ],
  },
];

const STORAGE_KEY = "musicPlayer:v1";

const Music = () => {
  const [mode, setMode] = useState<"player" | "spotify">("player");
  const [active, setActive] = useState<string>(presets[0].id);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [loop, setLoop] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Spotify auth + library
  const {
    accessToken,
    user,
    playlists,
    // likedTracks,
    isLoading: sLoading,
    error: sError,
    login: spotifyLogin,
    fetchMe: fetchSpotifyMe,
    fetchPlaylists: fetchSpotifyPlaylists,
    fetchLikedTracks,
    logout: spotifyLogout,
  } = useSpotifyStore();

  // On mount, if previously authenticated, refresh profile, playlists and liked songs
  useEffect(() => {
    if (accessToken) {
      fetchSpotifyMe();
      fetchSpotifyPlaylists();
      fetchLikedTracks();
    }
     
  }, [accessToken]);

  // hydrate simple prefs
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as {
        active?: string;
        trackIndex?: number;
        volume?: number;
        mode?: "player" | "spotify";
      };
      if (data.active) setActive(data.active);
      if (typeof data.trackIndex === "number") setTrackIndex(data.trackIndex);
      if (typeof data.volume === "number") setVolume(Math.min(1, Math.max(0, data.volume)));
      if (data.mode) setMode(data.mode);
    } catch {}
  }, []);

  const persist = (next?: Partial<{ active: string; trackIndex: number; volume: number; mode: "player" | "spotify" }>) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const base = raw ? JSON.parse(raw) : {};
      const merged = { active, trackIndex, volume, mode, ...base, ...next };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch {}
  };

  const currentPreset = useMemo(() => presets.find((p) => p.id === active) || presets[0], [active]);
  const currentPlaylist = useMemo(() => playerPlaylists.find((p) => p.id === active) || playerPlaylists[0], [active]);
  const currentTrack = currentPlaylist.tracks[trackIndex % currentPlaylist.tracks.length];

  // Selected user playlist to view in Spotify mode
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  // Show user's liked songs list instead of an embed
  const [showLiked, setShowLiked] = useState(false);
  // Compute embed URL: user playlist takes precedence, else preset embed
  const embedUrl = useMemo(() => {
    if (showLiked) return "";
    if (selectedPlaylistId) return `https://open.spotify.com/embed/playlist/${selectedPlaylistId}?utm_source=generator`;
    return currentPreset.embedUrl;
  }, [showLiked, selectedPlaylistId, currentPreset.embedUrl]);

  useEffect(() => {
    // reset times when track changes
    setCurrentTime(0);
    setDuration(0);
    if (!audioRef.current) return;
    const el = audioRef.current;
    el.load();
    el.volume = muted ? 0 : volume;
    el.loop = loop;
    if (isPlaying) {
      void el.play().catch(() => setIsPlaying(false));
    }
    persist();
     
  }, [trackIndex, active]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = muted ? 0 : volume;
    persist({ volume });
  }, [volume, muted]);

  useEffect(() => {
    persist({ active, mode, trackIndex });
  }, [active, mode, trackIndex]);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch {
        // autoplay blocked
      }
    }
  };

  const prevTrack = () => {
    const len = currentPlaylist.tracks.length;
    setTrackIndex((i) => (i - 1 + len) % len);
  };
  const nextTrack = () => {
    const len = currentPlaylist.tracks.length;
    if (shuffle) {
      const r = Math.floor(Math.random() * len);
      setTrackIndex(r);
    } else {
      setTrackIndex((i) => (i + 1) % len);
    }
  };

  const onTimeUpdate = () => {
    const el = audioRef.current;
    if (!el) return;
    setCurrentTime(el.currentTime || 0);
    setDuration(el.duration || 0);
  };

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = audioRef.current;
    if (!el) return;
    const v = Number(e.target.value);
    el.currentTime = v;
    setCurrentTime(v);
  };

  const format = (sec: number) => {
    if (!isFinite(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <div id="window-header">
        <WindowControlls target="music" />
        <h2 className="flex items-center gap-2 text-gray-700">
          <Music2 size={16} className="text-pink-500" /> Music
        </h2>
        <div className="flex items-center gap-2">
          {/* Mode switch */}
          <div className="text-xs bg-white border border-gray-300 rounded-md overflow-hidden">
            <button
              type="button"
              onClick={() => setMode("player")}
              onMouseDown={(e) => e.stopPropagation()}
              className={`px-2 py-1 ${mode === "player" ? "bg-blue-50 text-blue-700" : "text-gray-700"}`}
              title="Built-in Player"
            >
              Player
            </button>
            <button
              type="button"
              onClick={() => setMode("spotify")}
              onMouseDown={(e) => e.stopPropagation()}
              className={`px-2 py-1 ${mode === "spotify" ? "bg-blue-50 text-blue-700" : "text-gray-700"}`}
              title="Spotify Embed"
            >
              Spotify
            </button>
          </div>
          {/* Auth status */}
          {mode === "spotify" && (
            <div className="ml-2 flex items-center gap-2">
              {accessToken ? (
                <>
                  {user?.images?.[0]?.url && (
                     
                    <img src={user.images[0].url} alt={user.display_name || "User"} className="w-6 h-6 rounded-full" />
                  )}
                  <span className="text-xs text-gray-600 max-w-40 truncate" title={user?.display_name || user?.id}>
                    {user?.display_name || user?.id}
                  </span>
                  <button
                    type="button"
                    className="text-[11px] px-2 py-1 rounded hover:bg-gray-200"
                    onClick={() => spotifyLogout()}
                    onMouseDown={(e) => e.stopPropagation()}
                    title="Disconnect Spotify"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className={`text-[11px] px-2 py-1 rounded text-white ${sLoading ? "bg-emerald-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-500"}`}
                    onClick={() => spotifyLogin()}
                    onMouseDown={(e) => e.stopPropagation()}
                    title="Sign in with Spotify"
                    disabled={sLoading}
                  >
                    {sLoading ? "Signing in..." : "Sign in"}
                  </button>
                  {sError && (
                    <span className="text-[11px] text-red-600 max-w-44 truncate" title={sError}>
                      {sError}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
          <Share2 size={18} className="icon" />
        </div>
      </div>

      <div className="bg-white h-full min-h-0 flex">
        {/* Sidebar: fixed width, independent scroll */}
        <aside className="w-56 md:w-60 p-3 border-r border-gray-200 overflow-auto min-h-0 shrink-0">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <ListMusic size={16} /> Presets
          </div>
          <ul className="space-y-1">
            {presets.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setActive(p.id)}
                  onMouseDown={(e) => e.stopPropagation()}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${
                    p.id === active ? "bg-blue-50 text-blue-700" : "text-gray-700"
                  }`}
                  title={p.label}
                >
                  <span className="inline-flex items-center gap-2">
                    <Headphones size={16} className="opacity-70" /> {p.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {/* Spotify library */}
          {mode === "spotify" && (
            <div className="mt-4">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <Headphones size={16} /> My Library
              </div>
              {!accessToken ? (
                <div className="text-xs text-gray-500">
                  Sign in to see your playlists.
                </div>
              ) : (
                <ul className="space-y-1">
                  {/* Liked Songs */}
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setShowLiked(true);
                        setSelectedPlaylistId(null);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className={`w-full flex items-center gap-2 text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${
                        showLiked ? "bg-blue-50 text-blue-700" : "text-gray-700"
                      }`}
                      title="Liked Songs"
                    >
                      <span className="w-6 h-6 rounded bg-pink-100 flex items-center justify-center text-pink-600">
                        ❤
                      </span>
                      <span className="truncate">Liked Songs</span>
                    </button>
                  </li>
                  {sLoading && playlists.length === 0 && (
                    <li className="text-xs text-gray-400 px-3">Loading...</li>
                  )}
                  {playlists.map((pl) => (
                    <li key={pl.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPlaylistId(pl.id);
                          setShowLiked(false);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        className={`w-full flex items-center gap-2 text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${
                          !showLiked && selectedPlaylistId === pl.id ? "bg-blue-50 text-blue-700" : "text-gray-700"
                        }`}
                        title={pl.name}
                      >
                        {pl.images?.[0]?.url ? (
                           
                          <img src={pl.images[0].url} alt="" className="w-6 h-6 rounded object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded bg-gray-200" />
                        )}
                        <span className="truncate">{pl.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </aside>

        {/* Content */}
        <section className="flex-1 p-4 overflow-auto min-h-0">
          {mode === "spotify" ? (
            <div className="h-full w-full flex flex-col gap-4">
              {!showLiked ? (
                <>
                  <div className="text-sm text-gray-700 font-medium">
                    {selectedPlaylistId
                      ? "Now Playing: Your playlist"
                      : `Now Playing: ${currentPreset.label}`}
                  </div>
                  <div className="flex-1 min-h-0">
                    <iframe
                      title={`spotify-${selectedPlaylistId ?? currentPreset.id}`}
                      src={embedUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0, borderRadius: 12, minHeight: 360 }}
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Note: Spotify embeds may require being logged in for full playback.
                  </p>
                </>
              ) : (
                <SpotifyLikedList />
              )}
            </div>
          ) : (
            <div className="h-full w-full flex flex-col gap-4">
              <div className="flex items-center gap-3">
                {currentTrack?.cover && (
                  <img src={currentTrack.cover} alt={currentTrack.title} className="w-16 h-16 rounded object-cover" />
                )}
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">{currentTrack?.title}</div>
                  <div className="text-xs text-gray-500 truncate">{currentTrack?.artist ?? "Unknown artist"}</div>
                </div>
              </div>

              {/* Seek bar */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-gray-500 w-10 text-right">{format(currentTime)}</span>
                <input
                  type="range"
                  min={0}
                  max={isFinite(duration) && duration > 0 ? Math.floor(duration) : 0}
                  value={Math.floor(currentTime)}
                  onChange={onSeek}
                  className="flex-1 cursor-pointer accent-blue-500"
                />
                <span className="text-[11px] text-gray-500 w-10">{format(Math.max(0, duration - currentTime))}</span>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  className={`p-2 rounded ${shuffle ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100"}`}
                  onClick={() => setShuffle((v) => !v)}
                  onMouseDown={(e) => e.stopPropagation()}
                  title="Shuffle"
                >
                  <Shuffle size={18} />
                </button>

                <button
                  type="button"
                  className="p-2 rounded hover:bg-gray-100"
                  onClick={prevTrack}
                  onMouseDown={(e) => e.stopPropagation()}
                  title="Previous"
                >
                  <SkipBack size={18} />
                </button>

                <button
                  type="button"
                  className="p-2 rounded bg-blue-600 text-white hover:bg-blue-500"
                  onClick={togglePlay}
                  onMouseDown={(e) => e.stopPropagation()}
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </button>

                <button
                  type="button"
                  className="p-2 rounded hover:bg-gray-100"
                  onClick={nextTrack}
                  onMouseDown={(e) => e.stopPropagation()}
                  title="Next"
                >
                  <SkipForward size={18} />
                </button>

                <button
                  type="button"
                  className={`p-2 rounded ${loop ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100"}`}
                  onClick={() => setLoop((v) => !v)}
                  onMouseDown={(e) => e.stopPropagation()}
                  title="Loop current track"
                >
                  <Repeat size={18} />
                </button>

                {/* Volume */}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    className="p-2 rounded hover:bg-gray-100"
                    onClick={() => setMuted((m) => !m)}
                    onMouseDown={(e) => e.stopPropagation()}
                    title={muted ? "Unmute" : "Mute"}
                  >
                    {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={muted ? 0 : volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-28 cursor-pointer accent-blue-500"
                  />
                </div>

                {/* Invisible audio element */}
                <audio
                  ref={audioRef}
                  onTimeUpdate={onTimeUpdate}
                  onLoadedMetadata={onTimeUpdate}
                  onEnded={() => {
                    if (loop) {
                      if (audioRef.current) {
                        audioRef.current.currentTime = 0;
                        void audioRef.current.play();
                      }
                    } else {
                      nextTrack();
                    }
                  }}
                >
                  <source src={currentTrack?.url} type="audio/mpeg" />
                </audio>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
};

const MusicWindow = WindowWrapper(Music, "music");

export default MusicWindow;
