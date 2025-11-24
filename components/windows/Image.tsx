/* eslint-disable @next/next/no-img-element */
"use client";

import WindowWrapper from "@/hoc/WindowWrapper";
import WindowControlls from "../common/WindowControlls";
import useWindowStore from "@/store/window";

type ImgData = {
  id?: number;
  name: string;
  imageUrl?: string; // provided by constants for img files
  [key: string]: unknown;
};

const Image = () => {
  const { windows } = useWindowStore();
  const data = (windows?.imgfile?.data as ImgData) || null;

  if (!data || !data.name) return null;

  const { name, imageUrl } = data;

  if (!imageUrl) return null;

  return (
    <>
      <div id="window-header">
        <WindowControlls target="imgfile" />
        <h2>{name}</h2>
      </div>

      <div className="p-4 overflow-auto h-full bg-white">
        <div className="w-full h-full flex items-center justify-center">
          <img src={imageUrl} alt={name} className="max-h-full max-w-full rounded" />
        </div>
      </div>
    </>
  );
};

const ImageWindow = WindowWrapper(Image, "imgfile");

export default ImageWindow;
