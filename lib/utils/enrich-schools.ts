import { SchoolsGeoJSON, SchoolFeature, ConstructionProject } from "@/types";
import { geocodeConstructionProjects } from "./geocode";

/**
 * Enriches schools data with construction project information
 *
 * This function:
 * 1. Merges construction history into existing schools by BSN
 * 2. Creates new school features for standalone construction projects (new schools)
 *    - These features are marked with isConstructionProject flag
 *    - Geocodes addresses to get coordinates
 *
 * @param schoolsData - Original schools GeoJSON data
 * @param constructionProjects - Construction projects data
 * @returns Enriched schools GeoJSON with construction information
 */
export async function enrichSchoolsWithConstruction(
  schoolsData: SchoolsGeoJSON,
  constructionProjects: ConstructionProject[],
): Promise<SchoolsGeoJSON> {
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

  // Geocode standalone construction projects on server side
  const geocodedCoords = await geocodeConstructionProjects(standaloneProjects);

  // Create features for standalone construction projects with geocoded coordinates
  const constructionFeatures = standaloneProjects
    .map((project) => {
      const coords = geocodedCoords.get(project.id);

      // Skip projects that couldn't be geocoded
      if (!coords) {
        console.warn(
          `Skipping project ${project.id} (${project.schulname}) - geocoding failed`,
        );
        return null;
      }

      return {
        type: "Feature",
        id: `construction.${project.id}`,
        geometry: {
          type: "Point",
          coordinates: coords,
        },
        geometry_name: "geom",
        properties: {
          bsn: project.schulnummer || `CONSTRUCTION-${project.id}`,
          schulname: project.schulname,
          schulart: project.schulart,
          traeger: "öffentlich",
          schultyp: project.schulart, // Use schulart as schultyp
          bezirk: project.bezirk,
          ortsteil: "", // Not available in construction data
          plz: project.plz,
          strasse: project.strasse,
          hausnr: "", // Combined in strasse field
          telefon: "", // Not available in construction data
          fax: "",
          email: "",
          internet: "",
          schuljahr: "",
          isConstructionProject: true,
          constructionData: project,
        },
        bbox: [coords[0], coords[1], coords[0], coords[1]],
      };
    })
    .filter((f) => f !== null) as SchoolFeature[];

  console.log(
    `Enriched ${enrichedFeatures.length} schools, added ${constructionFeatures.length} construction projects`,
  );

  return {
    ...schoolsData,
    features: [...enrichedFeatures, ...constructionFeatures],
    numberReturned: enrichedFeatures.length,
  };
}
