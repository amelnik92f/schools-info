import { SchoolsGeoJSON } from "@/types";

const WFS_BASE_URL = "https://gdi.berlin.de/services/wfs/schulen";
const WFS_VERSION = "2.0.0";
const TYPENAMES = process.env.WFS_TYPENAMES ?? "fis:schulen";

/**
 * Fetches all schools data from the Berlin WFS service
 *
 * @returns Promise with GeoJSON FeatureCollection of schools
 * @throws Error if the fetch fails or returns invalid data
 */
export async function fetchBerlinSchools(): Promise<SchoolsGeoJSON> {
  const url =
    `${WFS_BASE_URL}?SERVICE=WFS&VERSION=${WFS_VERSION}&REQUEST=GetFeature` +
    `&TYPENAMES=${encodeURIComponent(TYPENAMES)}` +
    `&SRSNAME=EPSG:4326&OUTPUTFORMAT=application/json`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      // Add cache control for Next.js
      next: {
        revalidate: 3600, // Revalidate every hour
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch schools: ${response.status} ${response.statusText}`,
      );
    }

    const data: SchoolsGeoJSON = await response.json();

    // Validate the response has the expected structure
    if (!data.features || !Array.isArray(data.features)) {
      throw new Error("Invalid response format: missing features array");
    }

    return data;
  } catch (error) {
    console.error("Error fetching Berlin schools:", error);
    throw error;
  }
}

/**
 * Fetches schools data with optional filtering by district (Bezirk)
 *
 * @param bezirk - Optional district name to filter by
 * @returns Promise with GeoJSON FeatureCollection of schools
 */
export async function fetchSchoolsByDistrict(
  bezirk?: string,
): Promise<SchoolsGeoJSON> {
  const data = await fetchBerlinSchools();

  if (!bezirk) {
    return data;
  }

  // Filter features by district
  const filteredFeatures = data.features.filter(
    (feature) => feature.properties.bezirk === bezirk,
  );

  return {
    ...data,
    features: filteredFeatures,
    numberReturned: filteredFeatures.length,
  };
}
