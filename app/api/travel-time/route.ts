import { NextRequest, NextResponse } from "next/server";

const OPENROUTESERVICE_API_KEY = process.env.OPENROUTESERVICE_API_KEY;
const OPENROUTESERVICE_BASE_URL = "https://api.openrouteservice.org/v2";

// Map our internal mode names to OpenRouteService profiles
const PROFILE_MAP: Record<string, string> = {
  walking: "foot-walking",
  bicycle: "cycling-regular",
  car: "driving-car",
};

export interface TravelTimeRequest {
  start: [number, number]; // [lng, lat]
  end: [number, number]; // [lng, lat]
  modes: string[]; // Array of mode names
}

export interface TravelTimeResponse {
  mode: string;
  durationMinutes: number;
  distanceKm: number;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    if (!OPENROUTESERVICE_API_KEY) {
      return NextResponse.json(
        { error: "OpenRouteService API key not configured" },
        { status: 500 },
      );
    }

    const body: TravelTimeRequest = await request.json();
    const { start, end, modes } = body;

    if (!start || !end || !modes || modes.length === 0) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    // Fetch travel times for all requested modes in parallel
    const results = await Promise.all(
      modes.map(async (mode) => {
        const profile = PROFILE_MAP[mode] || "foot-walking";

        try {
          const url = `${OPENROUTESERVICE_BASE_URL}/directions/${profile}?start=${start[0]},${start[1]}&end=${end[0]},${end[1]}`;

          const response = await fetch(url, {
            headers: {
              Authorization: OPENROUTESERVICE_API_KEY,
              Accept: "application/geo+json;charset=UTF-8",
            },
          });

          if (!response.ok) {
            console.error(
              `OpenRouteService API error for ${mode}:`,
              response.status,
              await response.text(),
            );
            return {
              mode,
              durationMinutes: 0,
              distanceKm: 0,
              error: `API error: ${response.status}`,
            };
          }

          const data = await response.json();

          // Extract duration and distance from the response
          const route = data.features?.[0];
          if (!route) {
            return {
              mode,
              durationMinutes: 0,
              distanceKm: 0,
              error: "No route found",
            };
          }

          const durationSeconds = route.properties?.summary?.duration || 0;
          const distanceMeters = route.properties?.summary?.distance || 0;

          return {
            mode,
            durationMinutes: Math.round(durationSeconds / 60),
            distanceKm: Math.round((distanceMeters / 1000) * 10) / 10,
          };
        } catch (error) {
          console.error(`Error fetching travel time for ${mode}:`, error);
          return {
            mode,
            durationMinutes: 0,
            distanceKm: 0,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      }),
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Travel time API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
