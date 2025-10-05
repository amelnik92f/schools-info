import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { title, subtitle } from "@/components/primitives";
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
    <div className="flex flex-col gap-8 max-w-7xl mx-auto py-8 px-4">
      {/* Page Header */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <span className="text-4xl">🏫</span>
          </div>
        </div>
        <h1 className={title({ size: "lg" })}>Berlin Schools Map</h1>
        <p className={subtitle({ class: "mt-4" })}>
          Explore {schoolsData.numberReturned.toLocaleString()} schools across
          Berlin
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-4">
        <Card className="bg-content1 shadow-medium">
          <CardBody className="gap-2 p-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <p className="text-sm text-default-500">Total Schools</p>
                <p className="text-2xl font-bold text-foreground">
                  {schoolsData.numberReturned.toLocaleString()}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-content1 shadow-medium">
          <CardBody className="gap-2 p-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <span className="text-2xl">🏛️</span>
              </div>
              <div>
                <p className="text-sm text-default-500">Public Schools</p>
                <p className="text-2xl font-bold text-foreground">
                  {
                    schoolsData.features.filter(
                      (s) => s.properties.traeger === "öffentlich",
                    ).length
                  }
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-content1 shadow-medium">
          <CardBody className="gap-2 p-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <span className="text-2xl">🎓</span>
              </div>
              <div>
                <p className="text-sm text-default-500">Private Schools</p>
                <p className="text-2xl font-bold text-foreground">
                  {
                    schoolsData.features.filter(
                      (s) => s.properties.traeger === "privat",
                    ).length
                  }
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Map */}
      <SchoolsMap schoolsData={enrichedSchoolsData} />
    </div>
  );
}
