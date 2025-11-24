/* eslint-disable @next/next/no-img-element */
"use client";

import WindowWrapper from "@/hoc/WindowWrapper";
import WindowControlls from "../common/WindowControlls";
import { photosLinks, gallery } from "@/constants";
import useWindowStore from "@/store/window";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

const Photos = () => {
  const { openWindow, windows, setIconSize } = useWindowStore();
  const iconSize = windows?.photos?.iconSize ?? "md";
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
  return (
    <>
      <div id="window-header">
        <WindowControlls target="photos" />
        <h2>Gallery</h2>
        <div className="relative">
          <button
            type="button"
            title="View Options"
            onClick={() => setMenuOpen((v) => !v)}
            onMouseDown={(e) => e.stopPropagation()}
            className="p-1 rounded hover:bg-gray-200"
          >
            <span className="text-xs text-gray-600">View</span>
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
                    setIconSize("photos", sz);
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

      <div className="bg-white h-full min-h-0 flex">
        {/* Sidebar - fixed width, non-resizable */}
        <aside className="w-56 md:w-60 p-4 border-r border-gray-200 overflow-auto min-h-0 flex-shrink-0">
          <ul className="space-y-3">
            {photosLinks.map(({ id, icon, title }) => (
              <li
                key={id}
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => openWindow("imgfile", {
                  id,
                  name: "Gallery image",
                  icon: "/images/image.png",
                  kind: "file",
                  fileType: "img",
                  imageUrl: icon,
                })}
              >
                <img src={icon} alt={title}/>
                <span>{title}</span>
              </li>
            ))}
          </ul>
        </aside>

        {/* Content - wraps items responsively */}
        <section className="flex-1 p-4 overflow-auto min-h-0">
          <div
            className={clsx(
              "flex flex-wrap items-stretch",
              iconSize === "sm" && "gap-2",
              iconSize === "md" && "gap-4",
              iconSize === "lg" && "gap-6"
            )}
          >
            {gallery.map(({ id, img }) => (
              <div
                key={id}
                onClick={() => openWindow("imgfile", {
                  id,
                  name: "Gallery image",
                  icon: "/images/image.png",
                  kind: "file",
                  fileType: "img",
                  imageUrl: img,
                })}
                className={clsx(
                  "aspect-square overflow-hidden rounded-md bg-gray-50 cursor-pointer flex-shrink-0",
                  iconSize === "sm" && "basis-28 sm:basis-32 md:basis-36",
                  iconSize === "md" && "basis-36 sm:basis-40 md:basis-44 lg:basis-48",
                  iconSize === "lg" && "basis-44 sm:basis-48 md:basis-56 lg:basis-64"
                )}
              >
                <img
                  src={img}
                  alt={`gallery-${id}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

const PhotosWindow = WindowWrapper(Photos, "photos");

export default PhotosWindow;
