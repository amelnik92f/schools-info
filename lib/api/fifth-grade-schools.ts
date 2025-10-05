import fs from "fs";
import path from "path";

export interface FifthGradeSchool {
  bsn: string;
  name: string;
  type: string;
}

/**
 * Parses the CSV file containing schools that accept students after 4th grade
 * @returns Map of BSN to school information
 */
export function parseFifthGradeSchools(): Map<string, FifthGradeSchool> {
  const csvPath = path.join(process.cwd(), "lib/api/berlin_5th-gymasium.csv");
  const csvContent = fs.readFileSync(csvPath, "utf-8");

  const lines = csvContent.trim().split("\n");
  const schoolsMap = new Map<string, FifthGradeSchool>();

  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const [bsn, name, type] = line.split(",");
    if (bsn && name && type) {
      schoolsMap.set(bsn, {
        bsn,
        name,
        type,
      });
    }
  }

  return schoolsMap;
}

/**
 * Gets the set of BSNs for schools that accept students after 4th grade
 */
export function getFifthGradeSchoolBSNs(): Set<string> {
  const schoolsMap = parseFifthGradeSchools();
  return new Set(schoolsMap.keys());
}
