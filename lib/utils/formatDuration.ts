

export interface TravelTime {
    mode: "walking" | "bicycle" | "car";
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
  ];

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
  