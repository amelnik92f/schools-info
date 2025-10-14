import { SchoolsMap } from "@/components/schools-map";
import {
  fetchEnrichedSchools,
  fetchStandaloneConstructionProjects,
} from "@/lib/actions/schools";

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