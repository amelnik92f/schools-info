import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CustomLocation, LocationType } from "@/types";

interface CustomLocationsState {
  locations: {
    home: CustomLocation | null;
    work: CustomLocation | null;
  };
  isLoaded: boolean;

  // Actions
  setLocation: (
    type: LocationType,
    coordinates: [number, number],
    label?: string,
  ) => void;
  removeLocation: (type: LocationType) => void;
  getLocation: (type: LocationType) => CustomLocation | null;
  hasLocation: (type: LocationType) => boolean;
}

export const useCustomLocationsStore = create<CustomLocationsState>()(
  persist(
    (set, get) => ({
      locations: {
        home: null,
        work: null,
      },
      isLoaded: false,

      setLocation: (type, coordinates, label) => {
        const newLocation: CustomLocation = {
          type,
          coordinates,
          label,
        };
        set((state) => ({
          locations: {
            ...state.locations,
            [type]: newLocation,
          },
        }));
      },

      removeLocation: (type) => {
        set((state) => ({
          locations: {
            ...state.locations,
            [type]: null,
          },
        }));
      },

      getLocation: (type) => {
        return get().locations[type];
      },

      hasLocation: (type) => {
        return get().locations[type] !== null;
      },
    }),
    {
      name: "custom-locations",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoaded = true;
        }
      },
    },
  ),
);
