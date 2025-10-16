"use server";

/**
 * Server action for calculating travel times
 * This keeps the API key secure on the server
 */

import { getApiHeaders } from "@/lib/api";
import { TRAVEL_MODES, TravelTime } from "@/lib/utils/formatDuration";

const API_BASE_URL = process.env.API_URL || "http://localhost:8080";
const API_VERSION = "v1";

/**
 * Calculate travel times from one location to another
 * @param fromCoords - [longitude, latitude]
 * @param toCoords - [longitude, latitude]
 * @param schoolId - Optional school ID for the endpoint
 * @returns Promise with travel time data for all modes
 */
export async function calculateTravelTimes(
  fromCoords: [number, number],
  toCoords: [number, number],
  schoolId?: string,
): Promise<TravelTime[]> {
  try {
    // Use school ID if provided, otherwise use "0" as a generic routes endpoint
    const id = schoolId || "0";
    const response = await fetch(
      `${API_BASE_URL}/api/${API_VERSION}/schools/${id}/routes`,
      {
        method: "POST",
        headers: {
          ...getApiHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start: fromCoords,
          end: toCoords,
          modes: TRAVEL_MODES.map((m) => m.mode),
        }),
        cache: "no-store", // Don't cache travel times as they may vary
      },
    );

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
    console.error("Error calculating travel times:", error);

    // Return empty results on error
    return TRAVEL_MODES.map((modeInfo) => ({
      ...modeInfo,
      durationMinutes: 0,
      distanceKm: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    }));
  }
}
