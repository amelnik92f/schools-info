"use server";

/**
 * Server action for fetching AI summaries
 * This keeps the API key secure on the server
 * Uses unstable_cache to cache parsed response data (avoids 2MB fetch cache limit)
 */

import { unstable_cache } from "next/cache";

import { getApiHeaders } from "@/lib/api";

const API_BASE_URL =
  process.env.API_URL || "http://localhost:8080";
const API_VERSION = "v1";

interface AISummaryResponse {
  success: boolean;
  summary: string;
  schoolName: string;
}

/**
 * Internal function to fetch and parse AI summary from backend
 * Note: We use cache: "no-store" on fetch to avoid the 2MB limit,
 * and instead cache the parsed response data with unstable_cache
 */
async function fetchAISummaryFromBackend(
  schoolId: string,
): Promise<AISummaryResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/${API_VERSION}/schools/${schoolId}/summary`,
    {
      method: "GET",
      headers: getApiHeaders(),
      cache: "no-store", // Don't cache raw fetch (can exceed 2MB limit)
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to generate summary");
  }

  return data;
}

/**
 * Fetch AI-generated summary for a school
 * Cached for 7 days to avoid redundant expensive AI calls
 * @param schoolId - Database ID of the school
 * @returns Promise with the summary data
 */
export async function fetchAISummary(
  schoolId: string,
): Promise<AISummaryResponse> {
  try {
    // Cache the parsed response data (much smaller than raw fetch response)
    const getCachedSummary = unstable_cache(
      fetchAISummaryFromBackend,
      [`ai-summary-${schoolId}`],
      {
        tags: ["ai-summary", `ai-summary-${schoolId}`],
        revalidate: 604800, // 7 days
      },
    );

    return await getCachedSummary(schoolId);
  } catch (error: any) {
    console.error("Error fetching AI summary:", error);
    throw new Error(
      error.message || "Failed to generate summary. Please try again.",
    );
  }
}
