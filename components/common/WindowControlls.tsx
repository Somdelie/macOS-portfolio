"use client";

import useWindowStore from "@/store/window";

interface WindowControllsProps {
  target: string;
}

const WindowControlls = ({ target }: WindowControllsProps) => {
  const { closeWindow, maximizeWindow, minimizeWindow } = useWindowStore();

  return (
    <div id="window-controls">
      <div className="close" onClick={() => closeWindow(target)} />
      <div className="minimize" onClick={() => minimizeWindow(target)} />
      <div className="maximize" onClick={() => maximizeWindow(target)} />
    </div>
  );
};

export default WindowControlls;
