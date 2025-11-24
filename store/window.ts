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
};

const useWindowStore = create<WindowStore>()(
  immer((set) => ({
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
          } as WindowEntry;
        }
        const win = state.windows[windowKey];
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
  }))
);

export default useWindowStore;
