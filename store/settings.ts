import { create } from "zustand";

type SettingsState = {
  wallpaperUrl: string;
  setWallpaper: (url: string) => void;
  hydrate: () => void;
};

const DEFAULT_WALLPAPER = "/images/wallpaper.png";

const useSettingsStore = create<SettingsState>()((set, get) => ({
  wallpaperUrl: DEFAULT_WALLPAPER,
  setWallpaper: (url: string) => {
    // apply to CSS variable for body/html background
    try {
      const root = document.documentElement as HTMLElement;
      root.style.setProperty("--wallpaper", `url("${url}")`);
      localStorage.setItem("wallpaperUrl", url);
    } catch (e) {
      // ignore SSR or storage errors
    }
    set({ wallpaperUrl: url || DEFAULT_WALLPAPER });
  },
  hydrate: () => {
    try {
      const saved = localStorage.getItem("wallpaperUrl");
      const url = saved || get().wallpaperUrl || DEFAULT_WALLPAPER;
      const root = document.documentElement as HTMLElement;
      root.style.setProperty("--wallpaper", `url("${url}")`);
      set({ wallpaperUrl: url });
    } catch (e) {
      // no-op on SSR
    }
  },
}));

export default useSettingsStore;
