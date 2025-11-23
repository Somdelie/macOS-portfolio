import { locations } from "@/constants";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

const DEFAULT_LOCATION = locations.work;

// Define the store's state interface
interface LocationState {
  activeLocation: typeof DEFAULT_LOCATION;
  setActiveLocation: (location: typeof DEFAULT_LOCATION | null) => void;
  resetActiveLocation: () => void;
}

const useLocationStore = create<LocationState>()(
  immer((set) => ({
    activeLocation: DEFAULT_LOCATION,

    setActiveLocation: (location) =>
      set((state) => {
        state.activeLocation = location ?? DEFAULT_LOCATION;
      }),

    resetActiveLocation: () =>
      set((state) => {
        state.activeLocation = DEFAULT_LOCATION;
      }),
  }))
);

export default useLocationStore;