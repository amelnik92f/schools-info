import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { title, subtitle } from "@/components/primitives";
import { fetchBerlinSchools } from "@/lib/api/schools";
import { fetchConstructionProjects } from "@/lib/api/construction-projects";
import { SchoolsMap } from "@/components/schools-map";

export default async function Home() {
  const [schoolsData, constructionData] = await Promise.all([
    fetchBerlinSchools(),
    fetchConstructionProjects(),
  ]);

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
      <SchoolsMap
        schoolsData={schoolsData}
        constructionProjects={constructionData.index}
      />

      {/* Info Section */}
      <Card className="bg-content1 shadow-medium">
        <CardBody className="gap-4 p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <span className="text-2xl">ℹ️</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              About This Map
            </h2>
          </div>
          <p className="text-base text-default-700 leading-relaxed">
            This interactive map displays all schools in Berlin, sourced from
            the official Berlin geodata infrastructure (GDI). Click on any
            marker to view detailed information about a school, including its
            address, contact details, and website.
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Chip size="sm" variant="flat" color="primary">
              Data Source: Berlin GDI
            </Chip>
            <Chip size="sm" variant="flat" color="secondary">
              School Year:{" "}
              {schoolsData.features[0]?.properties.schuljahr || "2025/26"}
            </Chip>
            <Chip size="sm" variant="flat" color="success">
              Updated: {new Date(schoolsData.timeStamp).toLocaleDateString()}
            </Chip>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
