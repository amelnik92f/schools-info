import { ConstructionProjectsResponse } from "@/types";

const CONSTRUCTION_API_URL =
  "https://www.berlin.de/sen/bildung/schule/bauen-und-sanieren/schulbaukarte/index.php/index/all.json?q=";

/**
 * Fetches all construction projects from the Berlin school construction API
 *
 * @returns Promise with construction projects data
 * @throws Error if the fetch fails or returns invalid data
 */
export async function fetchConstructionProjects(): Promise<ConstructionProjectsResponse> {
  try {
    const response = await fetch(CONSTRUCTION_API_URL, {
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
        `Failed to fetch construction projects: ${response.status} ${response.statusText}`,
      );
    }

    const data: ConstructionProjectsResponse = await response.json();

    // Validate the response has the expected structure
    if (!data.index || !Array.isArray(data.index)) {
      throw new Error("Invalid response format: missing index array");
    }

    return data;
  } catch (error) {
    console.error("Error fetching construction projects:", error);
    throw error;
  }
}
