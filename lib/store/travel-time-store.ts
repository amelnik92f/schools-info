import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TravelTime, fetchTravelTimes } from "@/lib/utils/travel-time";

// Generate a unique key for caching based on coordinates
function generateCacheKey(
  fromCoords: [number, number],
  toCoords: [number, number],
): string {
  // Round coordinates to 5 decimal places (~1 meter precision)
  const fromLng = fromCoords[0].toFixed(5);
  const fromLat = fromCoords[1].toFixed(5);
  const toLng = toCoords[0].toFixed(5);
  const toLat = toCoords[1].toFixed(5);

  return `${fromLng},${fromLat}-${toLng},${toLat}`;
}

interface CachedTravelTime {
  data: TravelTime[];
  timestamp: number; // When the data was cached
}

interface TravelTimeState {
  // Cache structure: { "fromLng,fromLat-toLng,toLat": { data, timestamp } }
  cache: Record<string, CachedTravelTime>;

  // Loading states for each cache key
  loadingStates: Record<string, boolean>;

  // Actions
  getTravelTimes: (
    fromCoords: [number, number],
    toCoords: [number, number],
  ) => TravelTime[] | null;

  fetchAndCacheTravelTimes: (
    fromCoords: [number, number],
    toCoords: [number, number],
  ) => Promise<TravelTime[]>;

  isLoading: (
    fromCoords: [number, number],
    toCoords: [number, number],
  ) => boolean;

  clearCache: () => void;

  // Clear old cache entries (older than 7 days)
  clearOldCache: () => void;
}

const CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const useTravelTimeStore = create<TravelTimeState>()(
  persist(
    (set, get) => ({
      cache: {},
      loadingStates: {},

      getTravelTimes: (fromCoords, toCoords) => {
        const key = generateCacheKey(fromCoords, toCoords);
        const cached = get().cache[key];

        if (!cached) {
          return null;
        }

        // Check if cache is still valid (not expired)
        const now = Date.now();
        if (now - cached.timestamp > CACHE_EXPIRY_MS) {
          // Cache expired, remove it
          set((state) => {
            const newCache = { ...state.cache };
            delete newCache[key];
            return { cache: newCache };
          });
          return null;
        }

        return cached.data;
      },

      fetchAndCacheTravelTimes: async (fromCoords, toCoords) => {
        const key = generateCacheKey(fromCoords, toCoords);

        // Check if already cached
        const cached = get().getTravelTimes(fromCoords, toCoords);
        if (cached) {
          return cached;
        }

        // Check if already loading
        if (get().loadingStates[key]) {
          // Wait for the existing request to complete
          return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
              const result = get().getTravelTimes(fromCoords, toCoords);
              if (result) {
                clearInterval(checkInterval);
                resolve(result);
              }
            }, 100);
          });
        }

        // Set loading state
        set((state) => ({
          loadingStates: { ...state.loadingStates, [key]: true },
        }));

        try {
          // Fetch travel times from API
          const travelTimes = await fetchTravelTimes(fromCoords, toCoords);

          // Cache the result
          set((state) => ({
            cache: {
              ...state.cache,
              [key]: {
                data: travelTimes,
                timestamp: Date.now(),
              },
            },
            loadingStates: { ...state.loadingStates, [key]: false },
          }));

          return travelTimes;
        } catch (error) {
          // Clear loading state on error
          set((state) => ({
            loadingStates: { ...state.loadingStates, [key]: false },
          }));
          throw error;
        }
      },

      isLoading: (fromCoords, toCoords) => {
        const key = generateCacheKey(fromCoords, toCoords);
        return get().loadingStates[key] || false;
      },

      clearCache: () => {
        set({ cache: {}, loadingStates: {} });
      },

      clearOldCache: () => {
        const now = Date.now();
        set((state) => {
          const newCache: Record<string, CachedTravelTime> = {};

          Object.entries(state.cache).forEach(([key, value]) => {
            if (now - value.timestamp <= CACHE_EXPIRY_MS) {
              newCache[key] = value;
            }
          });

          return { cache: newCache };
        });
      },
    }),
    {
      name: "travel-time-cache",
      // Only persist the cache, not loading states
      partialize: (state) => ({
        cache: state.cache,
      }),
      // Clean old cache on rehydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.clearOldCache();
        }
      },
    },
  ),
);
