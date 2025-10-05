"use client";

import { useEffect } from "react";
import { Divider } from "@heroui/divider";
import { Spinner } from "@heroui/spinner";
import { useCustomLocationsStore } from "@/lib/store/custom-locations-store";
import { useTravelTimeStore } from "@/lib/store/travel-time-store";
import { formatDuration, TRAVEL_MODES } from "@/lib/utils/travel-time";

interface TravelTimeSectionProps {
  schoolCoordinates: [number, number]; // [longitude, latitude]
  schoolId: string;
}

export function TravelTimeSection({
  schoolCoordinates,
  schoolId,
}: TravelTimeSectionProps) {
  const { getLocation, hasLocation } = useCustomLocationsStore();
  const {
    getTravelTimes,
    fetchAndCacheTravelTimes,
    isLoading: isLoadingFromStore,
  } = useTravelTimeStore();

  // Get home coordinates
  const homeLocation = hasLocation("home") ? getLocation("home") : null;
  const homeCoordinates = homeLocation?.coordinates;

  // Get cached travel times or null
  const travelTimesFromHome = homeCoordinates
    ? getTravelTimes(homeCoordinates, schoolCoordinates)
    : null;

  // Check loading state
  const isLoadingTravelTimes = homeCoordinates
    ? isLoadingFromStore(homeCoordinates, schoolCoordinates)
    : false;

  // Fetch travel times when school or home location changes
  useEffect(() => {
    const loadTravelTimes = async () => {
      if (!homeCoordinates) {
        return;
      }

      // Check if already cached
      const cached = getTravelTimes(homeCoordinates, schoolCoordinates);
      if (cached) {
        return; // Already have data
      }

      // Fetch and cache
      await fetchAndCacheTravelTimes(homeCoordinates, schoolCoordinates);
    };

    loadTravelTimes();
  }, [
    schoolId,
    homeCoordinates,
    schoolCoordinates,
    getTravelTimes,
    fetchAndCacheTravelTimes,
  ]);

  // Don't render if no home location is set
  if (!hasLocation("home")) {
    return null;
  }

  return (
    <>
      <Divider />
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-semibold text-foreground">
            🚀 Travel Time
          </span>
          {isLoadingTravelTimes && <Spinner size="sm" color="primary" />}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {isLoadingTravelTimes || !travelTimesFromHome
            ? // Show skeleton loading state
              TRAVEL_MODES.map((mode) => (
                <div
                  key={mode.mode}
                  className="p-2 rounded-lg bg-content2 border border-divider"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{mode.icon}</span>
                    <span className="text-xs font-medium text-foreground">
                      {mode.label}
                    </span>
                  </div>
                  <div className="h-5 w-16 bg-default-200 rounded animate-pulse" />
                  <div className="h-4 w-12 bg-default-100 rounded animate-pulse mt-1" />
                </div>
              ))
            : // Show actual travel times
              travelTimesFromHome.map((travel) => (
                <div
                  key={travel.mode}
                  className="p-2 rounded-lg bg-content2 border border-divider"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{travel.icon}</span>
                    <span className="text-xs font-medium text-foreground">
                      {travel.label}
                    </span>
                  </div>
                  {travel.error ? (
                    <div className="text-xs text-danger">Error</div>
                  ) : (
                    <>
                      <div className="text-sm font-bold text-primary">
                        {formatDuration(travel.durationMinutes)}
                      </div>
                      <div className="text-xs text-default-500">
                        {travel.distanceKm} km
                      </div>
                    </>
                  )}
                </div>
              ))}
        </div>
      </div>
    </>
  );
}
