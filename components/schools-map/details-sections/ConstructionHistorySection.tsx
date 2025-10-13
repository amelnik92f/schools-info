"use client";

import { Chip } from "@heroui/chip";
import { ConstructionProject } from "@/types";
import { getProjectStatus, getStatusColor, getStatusLabel } from "../utils";

interface ConstructionHistorySectionProps {
  constructionProjects: ConstructionProject[];
}

export function ConstructionHistorySection({
  constructionProjects,
}: ConstructionHistorySectionProps) {
  if (!constructionProjects || constructionProjects.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-semibold text-foreground">
          🏗️ Construction History
        </span>
      </div>
      <div className="space-y-2">
        {constructionProjects.map((project) => {
          // Convert to frontend format for getProjectStatus
          const statusInfo = getProjectStatus(project);
          return (
            <div key={project.id} className="p-2 rounded-lg bg-content2">
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-xs font-semibold text-foreground">
                  {project.construction_measure}
                </span>
                <Chip
                  size="sm"
                  variant="flat"
                  color={getStatusColor(statusInfo.status)}
                  className="h-5"
                >
                  {getStatusLabel(statusInfo)}
                </Chip>
              </div>
              {project.description && (
                <p className="text-xs text-default-600 leading-relaxed">
                  {project.description}
                </p>
              )}
              {project.total_costs && (
                <p className="text-xs text-default-500 mt-1">
                  💰 {project.total_costs}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

