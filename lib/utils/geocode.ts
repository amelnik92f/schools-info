import { ConstructionProject } from "@/types";

interface GeocodeResult {
  lat: string;
  lon: string;
}

/**
 * Geocodes an address using Nominatim API
 *
 * @param address - Full address string
 * @returns Coordinates [longitude, latitude] or null if geocoding fails
 */
async function geocodeAddress(
  address: string,
): Promise<[number, number] | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=de`,
      {
        headers: {
          "User-Agent": "Berlin Schools Map App",
        },
        next: {
          revalidate: 86400, // Cache for 24 hours
        },
      },
    );

    if (response.ok) {
      const data: GeocodeResult[] = await response.json();
      if (data.length > 0) {
        return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
      }
    }
  } catch (error) {
    console.error(`Failed to geocode address: ${address}`, error);
  }

  return null;
}

/**
 * Geocodes multiple construction projects in batches
 *
 * @param projects - Array of construction projects to geocode
 * @param maxProjects - Maximum number of projects to geocode (default: 100)
 * @returns Map of project ID to coordinates
 */
export async function geocodeConstructionProjects(
  projects: ConstructionProject[],
  maxProjects: number = 100,
): Promise<Map<number, [number, number]>> {
  const coordsMap = new Map<number, [number, number]>();

  // Limit the number of projects to geocode
  const projectsToGeocode = projects.slice(0, maxProjects);

  for (let i = 0; i < projectsToGeocode.length; i++) {
    const project = projectsToGeocode[i];

    try {
      const address = `${project.strasse}, ${project.plz} ${project.ort}`;
      const coords = await geocodeAddress(address);

      if (coords) {
        coordsMap.set(project.id, coords);
      }

      // Add delay to respect Nominatim rate limits (1 request per second)
      // Only add delay between requests, not after the last one
      if (i < projectsToGeocode.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1100));
      }
    } catch (error) {
      console.error(`Failed to geocode project ${project.id}:`, error);
    }
  }

  return coordsMap;
}
