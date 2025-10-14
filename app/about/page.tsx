import { Card, CardBody } from "@heroui/card";
import { Link } from "@heroui/link";

import { title } from "@/components/primitives";

export default function AboutPage() {
  return (
    <div className="inset-0 overflow-y-auto">
      <div className="flex flex-col gap-8 max-w-4xl mx-auto py-8 px-4">
        <div className="text-center mb-4">
          <h1 className={title({ size: "lg" })}>About</h1>
          <p className="text-lg text-default-500 mt-4">
            Making school search in Berlin easier
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-1">
          <Card className="bg-content1 shadow-medium">
            <CardBody className="gap-4 p-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  <span className="text-2xl">👨‍💻</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">About Me</h2>
              </div>
              <p className="text-base text-default-700 leading-relaxed">
                I&apos;m a software engineer based in Berlin and a dad who has
                experienced firsthand how challenging it can be to search for
                the right school. The process of gathering information from
                multiple sources and comparing options inspired me to create
                this tool to help other parents navigate the school search more
                easily.
              </p>
            </CardBody>
          </Card>

          <Card className="bg-content1 shadow-medium">
            <CardBody className="gap-4 p-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  <span className="text-2xl">ℹ️</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  Motivation
                </h2>
              </div>
              <p className="text-base text-default-700 leading-relaxed">
                This interactive map displays all schools in Berlin, sourced
                from the official Berlin geodata infrastructure (GDI). Finding
                the right school can be challenging when information is spread
                across multiple government websites and databases, often in
                formats that are hard to navigate. This project brings all that
                data together in one accessible place, making it easier for
                parents to explore and compare schools.
              </p>
            </CardBody>
          </Card>

          <Card className="bg-content1 shadow-medium">
            <CardBody className="gap-4 p-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  <span className="text-2xl">📊</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  Data Sources
                </h2>
              </div>
              <p className="text-base text-default-700 leading-relaxed mb-4">
                All data displayed on this platform is publicly available and
                provided by official Berlin government sources:
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    School Students & Teachers Statistics
                  </h3>
                  <p className="text-base text-default-700 leading-relaxed mb-2">
                    Student and teacher counts are sourced from the Berlin Open
                    Data portal.
                  </p>
                  <Link
                    isExternal
                    showAnchorIcon
                    className="text-primary"
                    href="https://daten.berlin.de/datensaetze/schulen-in-berlin-1096779"
                  >
                    Berlin Open Data - Schools Dataset
                  </Link>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Schools After 4th Grade
                  </h3>
                  <p className="text-base text-default-700 leading-relaxed mb-2">
                    Information about schools accepting students after 4th grade
                    (Gymnasiums and Integrated Secondary Schools) is sourced
                    from the Berlin Education Authority.
                  </p>
                  <Link
                    isExternal
                    showAnchorIcon
                    className="text-primary"
                    href="https://www.bildung.berlin.de/Schulverzeichnis/SchulListe.aspx?IDKategorie=45&IDAngebot=336&Sort=BSN&TextID=35"
                  >
                    Berlin Education Authority - School Directory
                  </Link>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    School Locations
                  </h3>
                  <p className="text-base text-default-700 leading-relaxed mb-2">
                    School locations, addresses, and contact information are
                    sourced from the Berlin Geodata Infrastructure (GDI).
                  </p>
                  <Link
                    isExternal
                    showAnchorIcon
                    className="text-primary"
                    href="https://gdi.berlin.de/geonetwork/srv/api/records/ddb39227-00df-380a-9d00-6f919a721d4f"
                  >
                    Berlin GDI - Schools Geodata
                  </Link>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Construction Projects
                  </h3>
                  <p className="text-base text-default-700 leading-relaxed mb-2">
                    Information about ongoing and planned school construction
                    and renovation projects.
                  </p>
                  <Link
                    isExternal
                    showAnchorIcon
                    className="text-primary"
                    href="https://daten.berlin.de/datensaetze/simple_search_wwwberlindesenbildungschulebauenundsanierenschulbaukarte"
                  >
                    Berlin Open Data - School Construction Map
                  </Link>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

export const revalidate = 604800; // 7 days
