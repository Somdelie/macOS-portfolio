"use client";
import useWindowStore from "@/store/window";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
// ensure the Draggable plugin is registered before creating instances
gsap.registerPlugin(Draggable);
import { useLayoutEffect, useRef } from "react";

const WindowWrapper = <P extends object>(
  Component: React.ComponentType<P>,
  windowKey: string
) => {
  const Wrapped: React.FC<P> = (props) => {
    const { focusWindow, windows } = useWindowStore();
    const { zIndex, isOpen, isMaximized } = windows[windowKey] || { 
      zIndex: 0, 
      isOpen: false, 
      isMaximized: false 
    };
    const ref = useRef<HTMLDivElement>(null);  const draggableRef = useRef<{ kill?: () => void } | null>(null);

    useGSAP(() => {
      const el = ref.current;
      if (!el || !isOpen) return;

      el.style.display = "block";
      gsap.fromTo(
        el,
        { scale: 0.8, opacity: 0, y: 40 },
        { scale: 1, opacity: 1, duration: 0.4, ease: "power3.out", y: 0 }
      );
    }, [isOpen]);

    // function to make the draggable (re-run when window opens or maximized state changes)
    useGSAP(() => {
      const el = ref.current;
      if (!el || !isOpen || isMaximized) return;
      // create a Draggable instance for the window element and bring it to focus on press
      const [instance] = Draggable.create(el, {
        onPress: () => focusWindow(windowKey),
      });
      draggableRef.current = instance;

      return () => {
        if (draggableRef.current && typeof draggableRef.current.kill === "function") {
          draggableRef.current.kill();
          draggableRef.current = null;
        }
      };
    }, [isOpen, isMaximized]);

    useLayoutEffect(() => {
      const el = ref.current;
      if (!el) return;
      el.style.display = isOpen ? "block" : "none";
    }, [isOpen]);

    // if maximized, render full-screen like macOS green button behavior
    const baseClass = isMaximized ? "fixed inset-0 w-full h-full" : "absolute";

    return (
      <section
        id={windowKey}
        ref={ref}
        style={{ zIndex }}
        className={baseClass}
        onMouseDown={() => focusWindow(windowKey)}
      >
        <div className="window-body">
          <Component {...props} />
        </div>
      </section>
    );
  };

  Wrapped.displayName = `WindowWrapper(${
    Component.displayName || Component.name || "Component"
  })`;

  return Wrapped;
};

export default WindowWrapper;
