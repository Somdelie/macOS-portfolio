/* eslint-disable @next/next/no-img-element */
"use client";

import WindowWrapper from "@/hoc/WindowWrapper";
import WindowControlls from "../common/WindowControlls";
import useWindowStore from "@/store/window";

type TxtData = {
  id?: number;
  name: string;
  image?: string;
  subtitle?: string;
  description?: string[];
  [key: string]: unknown;
};

const Text = () => {
  const { windows } = useWindowStore();
  const data = (windows?.txtfile?.data as TxtData) || null;

  if (!data) return null;

  const { name, image, subtitle, description } = data;

  return (
    <>
      <div id="window-header">
        <WindowControlls target="txtfile" />
        <h2>{name}</h2>
      </div>

      <div className="p-4 overflow-auto h-full bg-white">
        {image && (
          <div className="mb-4">
            <img src={image} alt={name} className="max-h-56 rounded" />
          </div>
        )}

        {subtitle && <h3 className="text-lg font-semibold mb-3">{subtitle}</h3>}

        {Array.isArray(description) && description.length > 0 && (
          <div className="space-y-3 text-sm leading-6 text-gray-800">
            {description.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

const TextWindow = WindowWrapper(Text, "txtfile");

export default TextWindow;
