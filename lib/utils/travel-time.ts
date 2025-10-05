/**
 * Calculate travel time between two coordinates using OpenRouteService API
 */

export interface TravelTime {
  mode: "walking" | "bicycle" | "car" | "publicTransport";
  durationMinutes: number;
  distanceKm: number;
  icon: string;
  label: string;
  error?: string;
}

export const TRAVEL_MODES: Array<{
  mode: TravelTime["mode"];
  icon: string;
  label: string;
}> = [
  { mode: "walking", icon: "🚶", label: "Walking" },
  { mode: "bicycle", icon: "🚴", label: "Bicycle" },
  { mode: "car", icon: "🚗", label: "Car" },
  { mode: "publicTransport", icon: "🚇", label: "Public Transport" },
];

export async function fetchTravelTimes(
  fromCoords: [number, number], // [longitude, latitude]
  toCoords: [number, number], // [longitude, latitude]
): Promise<TravelTime[]> {
  try {
    const response = await fetch("/api/travel-time", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        start: fromCoords,
        end: toCoords,
        modes: TRAVEL_MODES.map((m) => m.mode),
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Merge API results with mode metadata
    return TRAVEL_MODES.map((modeInfo) => {
      const result = data.results?.find(
        (r: { mode: string }) => r.mode === modeInfo.mode,
      );

      return {
        ...modeInfo,
        durationMinutes: result?.durationMinutes || 0,
        distanceKm: result?.distanceKm || 0,
        error: result?.error,
      };
    });
  } catch (error) {
    console.error("Error fetching travel times:", error);
    // Return empty results on error
    return TRAVEL_MODES.map((modeInfo) => ({
      ...modeInfo,
      durationMinutes: 0,
      distanceKm: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    }));
  }
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}min`;
}
