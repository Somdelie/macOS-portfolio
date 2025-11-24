/* eslint-disable @next/next/no-img-element */
"use client";

import WindowWrapper from "@/hoc/WindowWrapper";
import WindowControlls from "../common/WindowControlls";
import { locations } from "@/constants";
import useWindowStore from "@/store/window";

const Archive = () => {
  const { openWindow } = useWindowStore();
  const trash = locations.trash;
  const items = trash?.children ?? [];

  return (
    <>
      <div id="window-header">
        <WindowControlls target="trash" />
        <h2>Archive</h2>
      </div>

      <div className="bg-white h-full p-4 overflow-auto">
        {items.length === 0 ? (
          <div className="text-center text-gray-500">Archive is empty</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(({ id, name, imageUrl }) => (
              <div
                key={id}
                onClick={() =>
                  openWindow("imgfile", {
                    id,
                    name: name || "Archived image",
                    icon: "/images/image.png",
                    kind: "file",
                    fileType: "img",
                    imageUrl,
                  })
                }
                className="w-full aspect-square overflow-hidden rounded-md bg-gray-50 cursor-pointer"
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={name || `archive-${id}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
                    No preview
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

const ArchiveWindow = WindowWrapper(Archive, "trash");

export default ArchiveWindow;
