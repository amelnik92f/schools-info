"use server";

/**
 * Server action for fetching AI summaries
 * This keeps the API key secure on the server
 */

import { getApiHeaders } from "@/lib/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8080";
const API_VERSION = "v1";

interface AISummaryResponse {
  success: boolean;
  summary: string;
  schoolName: string;
}

/**
 * Fetch AI-generated summary for a school
 * @param schoolId - Database ID of the school
 * @returns Promise with the summary data
 */
export async function fetchAISummary(
  schoolId: string,
): Promise<AISummaryResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/${API_VERSION}/schools/${schoolId}/summary`,
      {
        method: "GET",
        headers: getApiHeaders(),
        cache: "no-store", // Don't cache AI summaries
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to generate summary");
    }

    return data;
  } catch (error: any) {
    console.error("Error fetching AI summary:", error);
    throw new Error(
      error.message || "Failed to generate summary. Please try again.",
    );
  }
}

