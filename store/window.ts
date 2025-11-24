import { INITIAL_Z_INDEX, WINDOW_CONFIG } from "@/constants";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Draft } from "immer";

type WindowEntry = {
  isOpen: boolean;
  isMinimized?: boolean;
  isMaximized?: boolean;
  zIndex: number;
  data: unknown | null;
  // dimensions in pixels when not maximized
  width?: number;
  height?: number;
  // position in pixels (translation) when not maximized
  x?: number;
  y?: number;
  // optional per-window content/icon size preference
  iconSize?: "sm" | "md" | "lg";
};

type WindowConfig = Record<string, WindowEntry>;

type WindowStore = {
  windows: WindowConfig;
  nextZIndex: number;
  openWindow: (windowKey: string, data: WindowEntry["data"]) => void;
  closeWindow: (windowKey: string) => void;
  focusWindow: (windowKey: string) => void;
  minimizeWindow: (windowKey: string) => void;
  maximizeWindow: (windowKey: string) => void;
  resizeWindow: (windowKey: string, width: number, height: number) => void;
  setIconSize: (windowKey: string, size: NonNullable<WindowEntry["iconSize"]>) => void;
  setPosition: (windowKey: string, x: number, y: number) => void;
  hydrate: () => void;
};

// localStorage persistence (client-only)
const STORAGE_KEY = "windowPrefs:v1";

type PersistShape = {
  windows: Record<string, Pick<WindowEntry, "width" | "height" | "iconSize" | "x" | "y">>;
};

const safeRead = (): PersistShape | null => {
  try {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistShape;
  } catch {
    return null;
  }
};

const safeWrite = (data: PersistShape) => {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
};

const useWindowStore = create<WindowStore>()(
  immer((set, get) => ({
    windows: WINDOW_CONFIG as WindowConfig,
    nextZIndex: INITIAL_Z_INDEX + 1,

    openWindow: (windowKey: string, data: WindowEntry["data"]) =>
      set((state: Draft<WindowStore>) => {
        // initialize entry if it doesn't exist to avoid runtime errors
        if (!state.windows[windowKey]) {
          state.windows[windowKey] = {
            isOpen: false,
            isMinimized: false,
            isMaximized: false,
            zIndex: INITIAL_Z_INDEX,
            data: null,
            width: 900,
            height: 600,
            iconSize: "md",
          } as WindowEntry;
        }
        const win = state.windows[windowKey];
        // ensure consistent default size for pre-seeded windows
        if (win.width == null) win.width = 900;
        if (win.height == null) win.height = 600;
        if (win.iconSize == null) win.iconSize = "md";
        if (win.x == null) win.x = 0;
        if (win.y == null) win.y = 0;
        win.isOpen = true;
        win.isMinimized = false;
        win.isMaximized = false;
        win.zIndex = state.nextZIndex;
        win.data = data ?? win.data;
        state.nextZIndex++;
      }),
    closeWindow: (windowKey: string) =>
      set((state: Draft<WindowStore>) => {
        const win = state.windows[windowKey];
        if (!win) return; // no-op if window entry is missing
        win.isOpen = false;
        win.isMinimized = false;
        win.isMaximized = false;
        win.zIndex = INITIAL_Z_INDEX;
        win.data = null;
      }),

    minimizeWindow: (windowKey: string) =>
      set((state: Draft<WindowStore>) => {
        const win = state.windows[windowKey];
        if (!win) return;
        // mark minimized and hide the window (isOpen false), reset zIndex
        win.isMinimized = true;
        win.isMaximized = false;
        win.isOpen = false;
        win.zIndex = INITIAL_Z_INDEX;
      }),

    // toggle maximize (macOS green button behavior)
    maximizeWindow: (windowKey: string) =>
      set((state: Draft<WindowStore>) => {
        const win = state.windows[windowKey];
        if (!win) return;
        if (win.isMaximized) {
          // restore
          win.isMaximized = false;
          win.isOpen = true;
          win.zIndex = state.nextZIndex;
          state.nextZIndex++;
        } else {
          // maximize
          win.isMaximized = true;
          win.isMinimized = false;
          win.isOpen = true;
          win.zIndex = state.nextZIndex;
          state.nextZIndex++;
        }
      }),

    focusWindow: (windowKey: string) =>
      set((state: Draft<WindowStore>) => {
        const win = state.windows[windowKey];
        if (!win) return;
        // bring to front; also unminimize if it was minimized
        win.zIndex = state.nextZIndex;
        win.isOpen = true;
        win.isMinimized = false;
        state.nextZIndex++;
      }),

    resizeWindow: (windowKey: string, width: number, height: number) =>
      set((state: Draft<WindowStore>) => {
        const win = state.windows[windowKey];
        if (!win) return;
        if (win.isMaximized) return; // ignore when maximized
        // enforce minimum and reasonable maximums
        const MIN_W = 480;
        const MIN_H = 320;
        const vw = typeof window !== "undefined"
          ? window.innerWidth
          : (typeof document !== "undefined" ? document.documentElement.clientWidth : 1920);
        const vh = typeof window !== "undefined"
          ? window.innerHeight
          : (typeof document !== "undefined" ? document.documentElement.clientHeight : 1080);
        const MAX_W = vw || 1920;
        const MAX_H = vh || 1080;
        const clampedW = Math.max(MIN_W, Math.min(width, MAX_W));
        const clampedH = Math.max(MIN_H, Math.min(height, MAX_H));
        win.width = Math.round(clampedW);
        win.height = Math.round(clampedH);
        // persist size preferences
        try {
          const current = safeRead() || { windows: {} };
          current.windows[windowKey] = {
            ...(current.windows[windowKey] || {}),
            width: win.width,
            height: win.height,
            iconSize: win.iconSize,
            x: win.x,
            y: win.y,
          };
          safeWrite(current);
        } catch {
          // ignore
        }
      }),

    setIconSize: (windowKey: string, size: NonNullable<WindowEntry["iconSize"]>) =>
      set((state: Draft<WindowStore>) => {
        const win = state.windows[windowKey];
        if (!win) return;
        win.iconSize = size;
        // persist icon size preference
        try {
          const current = safeRead() || { windows: {} };
          current.windows[windowKey] = {
            ...(current.windows[windowKey] || {}),
            width: win.width,
            height: win.height,
            iconSize: win.iconSize,
            x: win.x,
            y: win.y,
          };
          safeWrite(current);
        } catch {
          // ignore
        }
      }),

    setPosition: (windowKey: string, x: number, y: number) =>
      set((state: Draft<WindowStore>) => {
        const win = state.windows[windowKey];
        if (!win) return;
        if (win.isMaximized) return; // ignore while maximized
        win.x = Math.round(x);
        win.y = Math.round(y);
        try {
          const current = safeRead() || { windows: {} };
          current.windows[windowKey] = {
            ...(current.windows[windowKey] || {}),
            width: win.width,
            height: win.height,
            iconSize: win.iconSize,
            x: win.x,
            y: win.y,
          };
          safeWrite(current);
        } catch {
          // ignore
        }
      }),

    // hydrate persisted width/height/iconSize on client
    hydrate: () => {
      const persisted = safeRead();
      if (!persisted) return;
      set((state: Draft<WindowStore>) => {
        Object.entries(persisted.windows || {}).forEach(([key, val]) => {
          const win = state.windows[key];
          if (!win) return;
          if (typeof val.width === "number" && val.width > 0) win.width = val.width;
          if (typeof val.height === "number" && val.height > 0) win.height = val.height;
          if (val.iconSize) win.iconSize = val.iconSize;
          if (typeof val.x === "number") win.x = val.x;
          if (typeof val.y === "number") win.y = val.y;
        });
      });
    },
  }))
);

export default useWindowStore;
