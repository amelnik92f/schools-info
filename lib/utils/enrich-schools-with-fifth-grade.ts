import { SchoolsGeoJSON } from "@/types";
import { getFifthGradeSchoolBSNs } from "@/lib/api/fifth-grade-schools";

/**
 * Enriches schools data with information about accepting students after 4th grade
 * @param schoolsData - The schools GeoJSON data
 * @returns Enriched schools data with acceptsAfter4thGrade property
 */
export function enrichSchoolsWithFifthGrade(
  schoolsData: SchoolsGeoJSON,
): SchoolsGeoJSON {
  const fifthGradeBSNs = getFifthGradeSchoolBSNs();

  const enrichedFeatures = schoolsData.features.map((feature) => {
    const bsn = feature.properties.bsn;
    const acceptsAfter4thGrade = fifthGradeBSNs.has(bsn);

    return {
      ...feature,
      properties: {
        ...feature.properties,
        acceptsAfter4thGrade,
      },
    };
  });

  return {
    ...schoolsData,
    features: enrichedFeatures,
  };
}
