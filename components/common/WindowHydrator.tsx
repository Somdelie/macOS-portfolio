"use client";

import { useEffect } from "react";
import useWindowStore from "@/store/window";

// Hydrates persisted window preferences (size, icon size) on app mount
const WindowHydrator = () => {
  const { hydrate } = useWindowStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return null;
};

export default WindowHydrator;
