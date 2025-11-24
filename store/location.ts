import { locations } from "@/constants";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

const DEFAULT_LOCATION = locations.work;

// Define the store's state interface
interface LocationState {
  activeLocation: typeof DEFAULT_LOCATION;
  setActiveLocation: (location: unknown) => void;
  resetActiveLocation: () => void;
}

const useLocationStore = create<LocationState>()(
  immer((set) => ({
    activeLocation: DEFAULT_LOCATION,

    setActiveLocation: (location) =>
      set((state) => {
        // Coerce incoming value to the expected location shape to satisfy TS
        state.activeLocation = (location as typeof DEFAULT_LOCATION | null | undefined) ?? DEFAULT_LOCATION;
      }),

    resetActiveLocation: () =>
      set((state) => {
        state.activeLocation = DEFAULT_LOCATION;
      }),
  }))
);

export default useLocationStore;