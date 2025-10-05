import { fetchBerlinSchools } from "@/lib/api/schools";
import { fetchConstructionProjects } from "@/lib/api/construction-projects";
import { fetchSchoolStats } from "@/lib/api/school-stats";
import { enrichSchoolsWithConstruction } from "@/lib/utils/enrich-schools";
import { enrichSchoolsWithStats } from "@/lib/utils/enrich-schools-with-stats";
import { enrichSchoolsWithFifthGrade } from "@/lib/utils/enrich-schools-with-fifth-grade";
import { SchoolsMap } from "@/components/schools-map";

export default async function Home() {
  const [schoolsData, constructionData, statsMap] = await Promise.all([
    fetchBerlinSchools(),
    fetchConstructionProjects(),
    fetchSchoolStats(),
  ]);

  // Enrich schools data with construction information (includes server-side geocoding)
  let enrichedSchoolsData = await enrichSchoolsWithConstruction(
    schoolsData,
    constructionData.index,
  );

  // Enrich schools data with statistics
  enrichedSchoolsData = enrichSchoolsWithStats(enrichedSchoolsData, statsMap);

  // Enrich schools data with 5th grade acceptance information
  enrichedSchoolsData = enrichSchoolsWithFifthGrade(enrichedSchoolsData);

  return (
    <div className="flex h-full overflow-hidden">
      <SchoolsMap schoolsData={enrichedSchoolsData} />
    </div>
  );
}
