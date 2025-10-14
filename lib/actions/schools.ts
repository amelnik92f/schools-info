"use server";

/**
 * Server actions for fetching school data
 * These run on the server and keep the API key secure
 */

import {
  fetchEnrichedSchools as apiFetchEnrichedSchools,
  fetchStandaloneConstructionProjects as apiFetchStandaloneConstructionProjects,
} from "@/lib/api";
import { EnrichedSchool, ConstructionProject } from "@/types";

/**
 * Fetch all enriched schools with related data
 * Server action - API key stays on server
 */
export async function fetchEnrichedSchools(): Promise<EnrichedSchool[]> {
  return apiFetchEnrichedSchools();
}

/**
 * Fetch standalone construction projects
 * Server action - API key stays on server
 */
export async function fetchStandaloneConstructionProjects(): Promise<
  ConstructionProject[]
> {
  return apiFetchStandaloneConstructionProjects();
}
