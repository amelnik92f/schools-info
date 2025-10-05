import fs from "fs";
import path from "path";

export interface SchoolStats {
  schuljahr: string; // School year (e.g., "2024/25")
  bsn: string; // School number (BSN)
  name: string; // School name
  schuelerGesamt: number; // Total students (m/w/d)
  schuelerWeiblich: number; // Female students
  schuelerMaennlich: number; // Male students
  lehrkraefteGesamt: number; // Total teachers (m/w/d)
  lehrkraefteWeiblich: number; // Female teachers
  lehrkraefteMaennlich: number; // Male teachers
}

/**
 * Parses a CSV value, handling empty strings and converting to number
 */
function parseNumber(value: string): number {
  const trimmed = value.trim();
  if (trimmed === "" || trimmed === "k.A.") {
    return 0;
  }
  const parsed = parseInt(trimmed, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Reads and parses the school statistics CSV file
 * CSV format: Schuljahr;BSN;NAME;Schüler (m/w/d);Schüler (w);Schüler (m);Lehrkräfte (m,w,d);Lehrkräfte (w);Lehrkräfte (m);
 *
 * @returns Map of BSN to SchoolStats
 */
export async function fetchSchoolStats(): Promise<Map<string, SchoolStats>> {
  const csvPath = path.join(process.cwd(), "lib", "api", "school-stats.csv");

  try {
    const fileContent = fs.readFileSync(csvPath, "utf-8");
    const lines = fileContent.split("\n");

    // Skip header line
    const dataLines = lines.slice(1).filter((line) => line.trim() !== "");

    const statsMap = new Map<string, SchoolStats>();

    for (const line of dataLines) {
      // Split by semicolon
      const parts = line.split(";");

      if (parts.length < 9) {
        console.warn(`Skipping invalid line: ${line}`);
        continue;
      }

      const [
        schuljahr,
        bsn,
        name,
        schuelerGesamt,
        schuelerWeiblich,
        schuelerMaennlich,
        lehrkraefteGesamt,
        lehrkraefteWeiblich,
        lehrkraefteMaennlich,
      ] = parts;

      const stats: SchoolStats = {
        schuljahr: schuljahr.trim(),
        bsn: bsn.trim(),
        name: name.trim(),
        schuelerGesamt: parseNumber(schuelerGesamt),
        schuelerWeiblich: parseNumber(schuelerWeiblich),
        schuelerMaennlich: parseNumber(schuelerMaennlich),
        lehrkraefteGesamt: parseNumber(lehrkraefteGesamt),
        lehrkraefteWeiblich: parseNumber(lehrkraefteWeiblich),
        lehrkraefteMaennlich: parseNumber(lehrkraefteMaennlich),
      };

      statsMap.set(stats.bsn, stats);
    }

    console.log(`Loaded statistics for ${statsMap.size} schools`);
    return statsMap;
  } catch (error) {
    console.error("Error reading school stats CSV:", error);
    // Return empty map on error
    return new Map();
  }
}
