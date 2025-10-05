import { SchoolsGeoJSON, SchoolFeature } from "@/types";
import { SchoolStats } from "@/lib/api/school-stats";

/**
 * Enriches schools data with statistics from CSV
 *
 * This function merges school statistics (students, teachers) into the school features
 * by matching on BSN (school number)
 *
 * @param schoolsData - Schools GeoJSON data (already enriched with construction)
 * @param statsMap - Map of BSN to SchoolStats
 * @returns Enriched schools GeoJSON with statistics
 */
export function enrichSchoolsWithStats(
  schoolsData: SchoolsGeoJSON,
  statsMap: Map<string, SchoolStats>,
): SchoolsGeoJSON {
  let enrichedCount = 0;

  const enrichedFeatures: SchoolFeature[] = schoolsData.features.map(
    (school) => {
      const bsn = school.properties.bsn;
      const stats = statsMap.get(bsn);

      if (stats) {
        enrichedCount++;
        return {
          ...school,
          properties: {
            ...school.properties,
            stats: stats,
          },
        };
      }

      return school;
    },
  );

  console.log(
    `Enriched ${enrichedCount} schools with statistics out of ${schoolsData.features.length} total schools`,
  );

  return {
    ...schoolsData,
    features: enrichedFeatures,
  };
}
