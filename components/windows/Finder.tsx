/* eslint-disable @next/next/no-img-element */
"use client";

import { Search, ChevronLeft, ChevronRight, LayoutGrid, Share, MoreHorizontal } from "lucide-react";
import WindowControlls from "../common/WindowControlls";
import WindowWrapper from "@/hoc/WindowWrapper";
import { locations } from "@/constants";
import useLocationStore from "@/store/location";
import clsx from "clsx";
import useWindowStore from "@/store/window";
import { useEffect, useRef, useState } from "react";

interface LocationItem {
  id: number;
  name: string;
  icon: string;
  kind: string;
  type?: string;
  href?: string;
  fileType?: string;
  imageUrl?: string;
  children?: LocationItem[];
  [key: string]: unknown;
}

const Finder = () => {
  const { activeLocation, setActiveLocation } = useLocationStore();
  const { openWindow, windows, setIconSize } = useWindowStore();
  const iconSize = windows?.finder?.iconSize ?? "md";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!(e.target instanceof Node)) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Quickly cycle icon sizes with a single left click on the layout icon
  const cycleIconSize = () => {
    const next = iconSize === "sm" ? "md" : iconSize === "md" ? "lg" : "sm";
    setIconSize("finder", next);
  };

  const handleLocationClick = (item: LocationItem) => {
    setActiveLocation(item);
  };

  const openItem = (item: LocationItem) => {
    if (item.fileType === "pdf") return openWindow("resume", null);
    if (item.kind === "folder") {
      if (item.kind === "folder") {
        setActiveLocation(item);
      }
    }
    const ft = item.fileType ?? "";
    if (["fig", "url"].includes(ft) && item.href) {
      return window.open(item.href, "_blank");
    }
    openWindow(`${item.fileType}${item.kind}`, item);
  };

  const renderList = (name: string, items: LocationItem[]) => (
    <div>
      <h3>{name}</h3>
      <ul>
        {items.map((item: LocationItem) => (
          <li
            key={item.id}
            onClick={() => handleLocationClick(item)}
            className={clsx(
              "cursor-pointer",
              item.id === activeLocation?.id ? "active" : "not-active"
            )}
          >
            <img
              src={item.icon || "/placeholder.svg"}
              alt={item.name}
              className="w-4"
            />
            <p className="text-sm font-medium truncate">{item.name}</p>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <>
      <div id="window-header">
        <WindowControlls target="finder" />
        <div className="flex items-center gap-2 ml-6">
          <ChevronLeft size={18} className="icon" />
          <ChevronRight size={18} className="icon" />
        </div>
        <h2 className="flex-1 text-center font-medium text-gray-600">
          {activeLocation?.name ?? "Portfolio"}
        </h2>
        <div className="flex items-center gap-4 relative">
          {/* Left-click to cycle icon/content size */}
          <button
            type="button"
            title="Cycle icon size"
            onClick={cycleIconSize}
            onMouseDown={(e) => e.stopPropagation()}
            className="p-1 rounded hover:bg-gray-200"
          >
            <LayoutGrid size={18} className="icon" />
          </button>
          <Share size={18} className="icon" />
          <Search size={18} className="icon cursor-pointer" />
          <button
            type="button"
            title="View Options"
            onClick={() => setMenuOpen((v) => !v)}
            onMouseDown={(e) => e.stopPropagation()}
            className="p-1 rounded hover:bg-gray-200"
          >
            <MoreHorizontal size={18} className="icon" />
          </button>
          {menuOpen && (
            <div
              ref={menuRef}
              onMouseDown={(e) => e.stopPropagation()}
              className="absolute right-0 top-10 z-20 w-44 rounded-md border border-gray-200 bg-white shadow-lg py-1 text-sm"
            >
              <p className="px-3 py-1.5 text-xs text-gray-500">Icon size</p>
              {(["sm", "md", "lg"] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => {
                    setIconSize("finder", sz);
                    setMenuOpen(false);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className={clsx(
                    "w-full text-left px-3 py-2 hover:bg-gray-100",
                    iconSize === sz && "bg-blue-50 text-blue-700"
                  )}
                >
                  {sz === "sm" && "Small"}
                  {sz === "md" && "Medium"}
                  {sz === "lg" && "Large"}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="bg-white flex h-full min-h-0">
        <div className="sidebar overflow-auto min-h-0 shrink-0">
          {renderList("Favorites", Object.values(locations))}
          {renderList("My Projects", locations.work.children)}
        </div>
        <section className="finder-content overflow-auto min-h-0 p-4 flex-1">
          <div
            className={clsx(
              "flex flex-wrap items-stretch",
              // adjust gap and basis by icon size
              iconSize === "sm" && "gap-2",
              iconSize === "md" && "gap-4",
              iconSize === "lg" && "gap-6"
            )}
          >
            {activeLocation?.children?.map((item: LocationItem) => {
              const preview = item.imageUrl || item.icon || "/placeholder.svg";
              return (
                <div
                  key={item.id}
                  className={clsx(
                    "cursor-pointer select-none shrink-0",
                    iconSize === "sm" && "basis-18 sm:basis-22 md:basis-26",
                    iconSize === "md" && "basis-26 sm:basis-30 md:basis-34 lg:basis-38",
                    iconSize === "lg" && "basis-34 sm:basis-38 md:basis-46 lg:basis-54"
                  )}
                  onClick={() => openItem(item)}
                >
                  <div className="w-full aspect-square rounded-md bg-gray-50 flex items-center justify-center overflow-hidden">
                    <img
                      src={preview}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p
                    className={clsx(
                      "mt-2 text-center font-medium truncate max-w-full",
                      iconSize === "sm" && "text-[10px]",
                      iconSize === "md" && "text-xs",
                      iconSize === "lg" && "text-sm"
                    )}
                  >
                    {item.name.substring(0, 10) + (item.name.length > 10 ? "..." : "")}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
};

const FinderWindow = WindowWrapper(Finder, "finder");

export default FinderWindow;