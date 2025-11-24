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
    const { focusWindow, windows, resizeWindow, setPosition } = useWindowStore();
    const { zIndex, isOpen, isMaximized, width, height, x, y } = (windows[windowKey] || {
      zIndex: 0,
      isOpen: false,
      isMaximized: false,
      width: 700,
      height: 400,
      x: 0,
      y: 0,
    }) as {
      zIndex: number;
      isOpen: boolean;
      isMaximized: boolean;
      width: number;
      height: number;
      x: number;
      y: number;
    };
    const ref = useRef<HTMLDivElement>(null);
    // store gsap Draggable instance
    const draggableRef = useRef<Draggable | null>(null);
    const resizingRef = useRef<
      | {
          startX: number;
          startY: number;
          startW: number;
          startH: number;
          startTX: number; // transform x from Draggable/GSAP
          startTY: number; // transform y from Draggable/GSAP
          dir: string;
        }
      | null
    >(null);

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

      // Only allow dragging from the window header to avoid conflicts with resize handles/content
      const header = el.querySelector("#window-header") as HTMLElement | null;

      const [instance] = Draggable.create(el, {
        type: "x,y",
        trigger: header ?? el, // fallback to whole window if header missing
        onPress: () => focusWindow(windowKey),
        // allow clicking inputs/links inside content without dragging
        dragClickables: true,
        onDragEnd: function () {
          // persist the final position
          // `this` is the Draggable instance
          try {
            // Read from Draggable instance; readonly in types but readable
            const finalX = (this as unknown as Draggable).x as number;
            const finalY = (this as unknown as Draggable).y as number;
            setPosition(windowKey, Number(finalX) || 0, Number(finalY) || 0);
          } catch {
            // ignore
          }
        },
      });
      draggableRef.current = instance;

      // Apply hydrated position if available
      try {
        const initX = typeof x === "number" ? x : 0;
        const initY = typeof y === "number" ? y : 0;
        gsap.set(el, { x: initX, y: initY });
        if (instance && typeof instance.update === "function") instance.update();
      } catch {
        // ignore
      }

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

    // generic resize starter for any edge/corner
    const startResize = (dir: string) => (e: React.MouseEvent) => {
      if (isMaximized) return;
      e.preventDefault();
      e.stopPropagation();
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const tx = draggableRef.current?.x ?? (gsap.getProperty(el, "x") as number) ?? 0;
      const ty = draggableRef.current?.y ?? (gsap.getProperty(el, "y") as number) ?? 0;

      resizingRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startW: rect.width,
        startH: rect.height,
        startTX: Number(tx) || 0,
        startTY: Number(ty) || 0,
        dir,
      };

      // Temporarily disable dragging while resizing to prevent the window from moving
      const instStart = draggableRef.current;
      if (instStart && typeof instStart.disable === "function") {
        instStart.disable();
      }

      const onMove = (ev: MouseEvent) => {
        const st = resizingRef.current;
        if (!st) return;
        let newW = st.startW;
        let newH = st.startH;
        let newTX = st.startTX;
        let newTY = st.startTY;

        const dx = ev.clientX - st.startX;
        const dy = ev.clientY - st.startY;

        const hasE = st.dir.includes("e");
        const hasS = st.dir.includes("s");
        const hasW = st.dir.includes("w");
        const hasN = st.dir.includes("n");

        if (hasE) newW = st.startW + dx;
        if (hasS) newH = st.startH + dy;
        if (hasW) {
          newW = st.startW - dx;
          newTX = st.startTX + dx; // shift window as left edge moves
        }
        if (hasN) {
          newH = st.startH - dy;
          newTY = st.startTY + dy; // shift window as top edge moves
        }

        // apply size through store (with clamping inside)
        resizeWindow(windowKey, newW, newH);

        // move the element when resizing from north/west
        if (hasW || hasN) {
          // Clamp new translation to keep window within viewport
          const vw = typeof window !== "undefined"
            ? window.innerWidth
            : (typeof document !== "undefined" ? document.documentElement.clientWidth : 1920);
          const vh = typeof window !== "undefined"
            ? window.innerHeight
            : (typeof document !== "undefined" ? document.documentElement.clientHeight : 1080);

          const minW = 360;
          const minH = 240;
          const maxX = Math.max(0, vw - Math.max(newW, minW));
          const maxY = Math.max(0, vh - Math.max(newH, minH));
          newTX = Math.min(Math.max(0, newTX), maxX);
          newTY = Math.min(Math.max(0, newTY), maxY);

          const inst = draggableRef.current;
          if (el) {
            gsap.set(el, { x: newTX, y: newTY });
          }
          if (inst && typeof inst.update === "function") {
            inst.update();
          }
        }
      };
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        resizingRef.current = null;
        const inst = draggableRef.current;
        if (inst && typeof inst.enable === "function") {
          inst.enable();
        }
        // persist position after a resize that may have shifted x/y
        try {
          const finalX = (inst && typeof inst.x === "number") ? inst.x : (gsap.getProperty(el!, "x") as number) || 0;
          const finalY = (inst && typeof inst.y === "number") ? inst.y : (gsap.getProperty(el!, "y") as number) || 0;
          setPosition(windowKey, Number(finalX) || 0, Number(finalY) || 0);
        } catch {
          // ignore
        }
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    };

    return (
      <section
        id={windowKey}
        ref={ref}
        style={{
          zIndex,
          // Respect stored size when not maximized but keep things responsive
          width: isMaximized ? undefined : (width ?? 900),
          height: isMaximized ? undefined : (height ?? 600),
          // Responsive constraints so windows never overflow the viewport
          maxWidth: isMaximized ? undefined : '95vw',
          maxHeight: isMaximized ? undefined : '85vh',
          minWidth: isMaximized ? undefined : 480,
          minHeight: isMaximized ? undefined : 320,
        }}
        className={baseClass}
        onMouseDown={() => focusWindow(windowKey)}
      >
        <div className="window-body">
          <Component {...props} />
        </div>
        {/* Resize handles: edges and corners for OS-like behavior */}
        {!isMaximized && (
          <>
            {/* Edges */}
            <div
              aria-hidden
              onMouseDown={startResize("n")}
              className="absolute top-0 left-0 w-full cursor-ns-resize select-none"
              style={{ pointerEvents: "auto", height: 8, zIndex: 10 }}
            />
            <div
              aria-hidden
              onMouseDown={startResize("s")}
              className="absolute bottom-0 left-0 w-full cursor-ns-resize select-none"
              style={{ pointerEvents: "auto", height: 8, zIndex: 10 }}
            />
            <div
              aria-hidden
              onMouseDown={startResize("e")}
              className="absolute right-0 top-0 h-full cursor-ew-resize select-none"
              style={{ pointerEvents: "auto", width: 8, zIndex: 10 }}
            />
            <div
              aria-hidden
              onMouseDown={startResize("w")}
              className="absolute left-0 top-0 h-full cursor-ew-resize select-none"
              style={{ pointerEvents: "auto", width: 8, zIndex: 10 }}
            />

            {/* Corners */}
            <div
              aria-hidden
              onMouseDown={startResize("nw")}
              className="absolute left-0 top-0 cursor-nwse-resize select-none"
              style={{ width: 12, height: 12, zIndex: 11 }}
            />
            <div
              aria-hidden
              onMouseDown={startResize("ne")}
              className="absolute right-0 top-0 cursor-nesw-resize select-none"
              style={{ width: 12, height: 12, zIndex: 11 }}
            />
            <div
              aria-hidden
              onMouseDown={startResize("sw")}
              className="absolute left-0 bottom-0 cursor-nesw-resize select-none"
              style={{ width: 12, height: 12, zIndex: 11 }}
            />
            <div
              aria-hidden
              onMouseDown={startResize("se")}
              className="absolute right-0 bottom-0 cursor-nwse-resize select-none"
              style={{ width: 12, height: 12, zIndex: 11 }}
            />
          </>
        )}
      </section>
    );
  };

  Wrapped.displayName = `WindowWrapper(${
    Component.displayName || Component.name || "Component"
  })`;

  return Wrapped;
};

export default WindowWrapper;
