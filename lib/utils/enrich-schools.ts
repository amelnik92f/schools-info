import {
  SchoolsGeoJSON,
  SchoolFeature,
  ConstructionProject,
} from "@/types";

/**
 * Enriches schools data with construction project information
 * 
 * This function:
 * 1. Merges construction history into existing schools by BSN
 * 2. Creates new school features for standalone construction projects (new schools)
 * 
 * @param schoolsData - Original schools GeoJSON data
 * @param constructionProjects - Construction projects data
 * @returns Enriched schools GeoJSON with construction information
 */
export function enrichSchoolsWithConstruction(
  schoolsData: SchoolsGeoJSON,
  constructionProjects: ConstructionProject[],
): SchoolsGeoJSON {
  // Create a map of construction projects by school number
  const projectsBySchool = new Map<string, ConstructionProject[]>();
  const standaloneProjects: ConstructionProject[] = [];

  // Get all existing school numbers
  const existingSchoolNumbers = new Set(
    schoolsData.features.map((school) => school.properties.bsn),
  );

  // Categorize projects
  constructionProjects.forEach((project) => {
    const schulnummer = project.schulnummer;

    if (schulnummer && existingSchoolNumbers.has(schulnummer)) {
      // Project belongs to an existing school
      if (!projectsBySchool.has(schulnummer)) {
        projectsBySchool.set(schulnummer, []);
      }
      projectsBySchool.get(schulnummer)!.push(project);
    } else {
      // Standalone project (new school or no school number)
      standaloneProjects.push(project);
    }
  });

  // Merge construction history into existing schools
  const enrichedFeatures: SchoolFeature[] = schoolsData.features.map(
    (school) => {
      const bsn = school.properties.bsn;
      const projects = projectsBySchool.get(bsn) || [];

      return {
        ...school,
        properties: {
          ...school.properties,
          constructionHistory: projects.length > 0 ? projects : undefined,
        },
      };
    },
  );

  // Note: Standalone projects will be handled separately for geocoding
  // They are not added to the features array here because they don't have coordinates yet

  return {
    ...schoolsData,
    features: enrichedFeatures,
    // Store standalone projects for later geocoding
    // @ts-ignore - adding custom property for internal use
    _standaloneProjects: standaloneProjects,
  };
}

/**
 * Extracts standalone construction projects from enriched data
 */
export function getStandaloneProjects(
  enrichedData: SchoolsGeoJSON,
): ConstructionProject[] {
  // @ts-ignore - accessing custom property
  return enrichedData._standaloneProjects || [];
}