import { ConstructionProject, ProjectStatusInfo } from "@/types";

// School type colors for markers
export const SCHOOL_TYPE_COLORS: Record<string, string> = {
  Grundschule: "#3b82f6", // blue
  Gymnasium: "#8b5cf6", // violet
  "Integrierte Sekundarschule": "#10b981", // green
  Oberstufenzentrum: "#f59e0b", // amber
  Gemeinschaftsschule: "#06b6d4", // cyan
  Förderschule: "#ec4899", // pink
  Berufsschule: "#f97316", // orange
  default: "#6366f1", // indigo
};

// Construction indicator color (stripes)
export const CONSTRUCTION_STRIPE_COLOR = "#ffffff"; // white stripes for better visibility

// Helper function to get project status
export const getProjectStatus = (
  project: ConstructionProject,
): ProjectStatusInfo => {
  const dateStr = project.handover_date;
  const currentYear = new Date().getFullYear();

  if (!dateStr || dateStr === "k.A.") {
    return { status: "unknown", isCompleted: false };
  }

  const years = dateStr.match(/\d{4}/g);

  if (years) {
    const completionYear = Math.max(...years.map((y) => parseInt(y)));

    if (completionYear < currentYear) {
      return {
        status: "completed",
        completionYear,
        isCompleted: true,
      };
    } else if (completionYear === currentYear) {
      return {
        status: "ongoing",
        completionYear,
        isCompleted: false,
      };
    } else {
      return {
        status: "future",
        completionYear,
        isCompleted: false,
      };
    }
  }

  return { status: "unknown", isCompleted: false };
};

// Helper to get status color
export const getStatusColor = (
  status: ProjectStatusInfo["status"],
): "success" | "warning" | "primary" | "default" => {
  switch (status) {
    case "completed":
      return "success";
    case "ongoing":
      return "warning";
    case "future":
      return "primary";
    default:
      return "default";
  }
};

// Helper to get status label
export const getStatusLabel = (statusInfo: ProjectStatusInfo): string => {
  switch (statusInfo.status) {
    case "completed":
      return `✅ Completed ${statusInfo.completionYear}`;
    case "ongoing":
      return `🏗️ In Progress ${statusInfo.completionYear}`;
    case "future":
      return `📅 Planned ${statusInfo.completionYear}`;
    default:
      return "❓ Status Unknown";
  }
};

// Helper to get marker color by school type
export const getMarkerColor = (schoolType: string): string => {
  return SCHOOL_TYPE_COLORS[schoolType] || SCHOOL_TYPE_COLORS.default;
};
