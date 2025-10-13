/**
 * API client for the school-go backend
 *
 * Base URL: http://localhost:8080
 * API Version: v1
 */

import { EnrichedSchool, ConstructionProject } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8080";
const API_VERSION = "v1";
const apiUrl = `${API_BASE_URL}/api/${API_VERSION}`;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

/**
 * Get common headers for API requests including authentication
 */
function getApiHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/json",
  };

  if (API_KEY) {
    headers["X-API-Key"] = API_KEY;
  }

  return headers;
}

export async function fetchEnrichedSchools(): Promise<EnrichedSchool[]> {
  const url = `${apiUrl}/schools`;

  try {
    const response = await fetch(url, {
      headers: getApiHeaders(),
      // Add cache control for Next.js
      next: {
        revalidate: 3600, // Revalidate every hour
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch enriched schools: ${response.status} ${response.statusText}`,
      );
    }

    const data: EnrichedSchool[] = await response.json();

    // Validate the response is an array
    if (!Array.isArray(data)) {
      throw new Error("Invalid response format: expected array of schools");
    }

    return data;
  } catch (error) {
    console.error("Error fetching enriched schools:", error);
    throw error;
  }
}

export async function fetchStandaloneConstructionProjects(): Promise<
  ConstructionProject[]
> {
  const url = `${apiUrl}/construction-projects/standalone`;

  try {
    const response = await fetch(url, {
      headers: getApiHeaders(),
      // Add cache control for Next.js
      next: {
        revalidate: 3600, // Revalidate every hour
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch standalone construction projects: ${response.status} ${response.statusText}`,
      );
    }

    const data: ConstructionProject[] = await response.json();

    // Validate the response is an array
    if (!Array.isArray(data)) {
      throw new Error(
        "Invalid response format: expected array of construction projects",
      );
    }

    return data;
  } catch (error) {
    console.error("Error fetching standalone construction projects:", error);
    throw error;
  }
}
