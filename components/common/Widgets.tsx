/* eslint-disable @next/next/no-img-element */
"use client";

import { wallpapers } from "@/constants";
import useSettingsStore from "@/store/settings";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";

const Widgets = () => {
  const { wallpaperUrl, setWallpaper, hydrate } = useSettingsStore();
  const [now, setNow] = useState(() => new Date());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    hydrate();
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, [hydrate]);

  const time = useMemo(() => dayjs(now).format("HH:mm"), [now]);
  const date = useMemo(() => dayjs(now).format("ddd, MMM D"), [now]);

  return (
    <div className="fixed right-4 top-20 z-60 select-none">
      {/* Clock widget */}
      <div className="mb-3 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg p-3 text-white min-w-36">
        <div className="text-2xl font-semibold leading-none">{time}</div>
        <div className="text-xs opacity-90 mt-1">{date}</div>
        <div className="mt-2 flex justify-between items-center">
          <button
            type="button"
            className="text-[11px] px-2 py-1 rounded bg-black/20 hover:bg-black/30 transition"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            title="Change wallpaper"
          >
          Chose Wallpaper
          </button>
          {/* <span className="text-[10px] opacity-80 truncate max-w-28">{wallpaperUrl?.split("/").pop()}</span> */}
        </div>
      </div>

      {/* Wallpaper picker */}
      {open && (
        <div
          className="rounded-xl bg-white/85 backdrop-blur-xl border border-gray-200 shadow-2xl p-3 max-w-[70vw] w-[280px]"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <p className="text-xs text-gray-600 mb-2">Choose a wallpaper</p>
          <div className="grid grid-cols-3 gap-2">
            {wallpapers.map((url) => (
              <button
                key={url}
                type="button"
                className="relative w-full aspect-video rounded overflow-hidden border hover:border-blue-400 group"
                onClick={() => setWallpaper(url)}
                title={url.split("/").pop()}
              >
                <img src={url} alt="wallpaper" className="w-full h-full object-cover" />
                {wallpaperUrl === url && (
                  <span className="absolute inset-0 ring-2 ring-blue-500 rounded pointer-events-none" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Widgets;
