import { Metadata } from "next";

import { SchoolsMap } from "@/components/schools-map";
import {
  fetchEnrichedSchools,
  fetchStandaloneConstructionProjects,
} from "@/lib/actions/schools";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Interactive School Map",
  description:
    "Explore all schools in Berlin on an interactive map. View detailed statistics, student counts, construction projects, and calculate travel times to find the perfect school for your child.",
  openGraph: {
    title: "Berlin Schools Interactive Map",
    description:
      "Explore all schools in Berlin with detailed statistics, construction projects, and travel time estimates.",
    url: siteConfig.url,
    type: "website",
  },
  alternates: {
    canonical: siteConfig.url,
  },
};

export default async function Home() {
  const [schools, standaloneProjects] = await Promise.all([
    fetchEnrichedSchools(),
    fetchStandaloneConstructionProjects(),
  ]);

  return (
    <main className="flex-grow overflow-hidden">
      <div className="flex h-full overflow-hidden">
        <SchoolsMap schools={schools} standaloneProjects={standaloneProjects} />
      </div>
    </main>
  );
}

export const revalidate = 604800; // 7 days
export const maxDuration = 60; // 60 seconds
