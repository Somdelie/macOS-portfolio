/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { Search } from "lucide-react";
import WindowControlls from "../common/WindowControlls";
import WindowWrapper from "@/hoc/WindowWrapper";
import { locations } from "@/constants";
import useLocationStore from "@/store/location";
import clsx from "clsx";
import useWindowStore from "@/store/window";

interface LocationItem {
  id: number;
  name: string;
  icon: string;
  kind: string;
  type?: string;
  children?: LocationItem[];
  [key: string]: any;
}

const Finder = () => {
  const { activeLocation, setActiveLocation } = useLocationStore();
  const { openWindow } = useWindowStore();

  const handleLocationClick = (item: LocationItem) => {
    setActiveLocation(item as any);
  };

  const openItem = (item: LocationItem) => {
    if (item.fileType === "pdf") return openWindow("resume", null);
    if (item.kind === "folder") {
      if (item.kind === "folder") {
        setActiveLocation(item as any);
      }
    }
    if (["fig", "url"].includes(item.fileType) && item.href) {
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
        <Search size={20} className="icon cursor-pointer" />
      </div>
      <div className="bg-white flex h-full">
        <div className="sidebar">
          {renderList("Favorites", Object.values(locations))}
          {renderList("My Projects", locations.work.children)}
        </div>
        <ul className="content">
          {activeLocation?.children?.map((item: LocationItem) => (
            <li
              key={item.id}
              className={`${item.position} cursor-pointer`}
              onClick={() => openItem(item)}
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
    </>
  );
};

const FinderWindow = WindowWrapper(Finder, "finder");

export default FinderWindow;