"use client";
import { dockApps } from "@/constants";
import useWindowStore from "@/store/window";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import { useRef } from "react";
import { Tooltip } from "react-tooltip";

const Dock = () => {
  const {windows, openWindow, focusWindow, minimizeWindow}  = useWindowStore();
  const dockRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const dock = dockRef.current;
    if (!dock) return;

    const icons = dock.querySelectorAll(".dock-icon");
    const animateIcons = (mouseX: number) => {
      const { left } = dock.getBoundingClientRect();

      icons.forEach((icon) => {
        const { left: iconLeft, width: iconWidth } =
          icon.getBoundingClientRect();
        const center = iconLeft - left + iconWidth / 2;
        const distance = Math.abs(mouseX - center);

        const intensity = Math.exp(-(distance ** 2.5) / 20000);

        gsap.to(icon, {
          scale: 1 + 0.25 * intensity,
          y: -15 * intensity,
          duration: 0.2,
          ease: "power1.out",
        });
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      const { left } = dock.getBoundingClientRect();
      const mouseX = e.clientX - left;
      animateIcons(mouseX);
    };

    const resetIcons = () =>
      icons.forEach((icon) =>
        gsap.to(icon, {
          scale: 1,
          y: 0,
          duration: 0.2,
          ease: "power1.out",
        })
      );
    dock.addEventListener("mousemove", handleMouseMove);
    dock.addEventListener("mouseleave", resetIcons);

    return () => {
      dock.removeEventListener("mousemove", handleMouseMove);
      dock.removeEventListener("mouseleave", resetIcons);
    };
  }, []);

  const toggleApp = (app: { id: string; canOpen: boolean }) => {
    // Implement Open Window Logic 
    if (!app.canOpen) return;

    const window = windows[app.id];

    if(!window) {
        return;
    }

    // macOS-like behavior: if minimized -> restore/focus; if open -> minimize; otherwise open
    if (window.isMinimized) {
      // restore and focus
      focusWindow(app.id);
    } else if (window.isOpen) {
      minimizeWindow(app.id);
    } else {
      openWindow(app.id, null);
    }

  };

  return (
    <section id="dock">
      <div ref={dockRef} className="dock-container">
        {dockApps.map(({ id, canOpen, name, icon }) => (
          <div key={id} className="relative flex justify-center">
            <button
              type="button"
              className="dock-icon"
              aria-label={name}
              data-tooltip-id="dock-tooltip"
              data-tooltip={name}
              data-canopen={canOpen}
              data-tooltip-content={name}
              data-tooltip-delay-show={150}
              disabled={!canOpen}
              onClick={() =>
                toggleApp({
                  id,
                  canOpen,
                })
              }
            >
              <Image
                src={`/images/${icon}`}
                alt={name}
                width={60}
                height={20}
                className={canOpen ? "" : "opacity-60"}
              />
            </button>
          </div>
        ))}
        <Tooltip id="dock-tooltip" place="top" className="tooltip" />
      </div>
    </section>
  );
};

export default Dock;
