"use client";

import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { EnrichedSchool, ConstructionProject } from "@/types";
import { getMarkerColor, getProjectStatus, getStatusColor, getStatusLabel } from "../utils";

interface SchoolDetailsHeaderProps {
  item: EnrichedSchool | ConstructionProject;
  onClose: () => void;
}

export function SchoolDetailsHeader({ item, onClose }: SchoolDetailsHeaderProps) {
  const isSchool = "school" in item;
  const isStandaloneProject = !isSchool;

  const enrichedSchool = isSchool ? (item as EnrichedSchool) : null;
  const standaloneProject = isStandaloneProject ? (item as ConstructionProject) : null;

  const school = enrichedSchool?.school || null;
  const details = enrichedSchool?.details || null;

  const name = school?.name || standaloneProject?.school_name || "";
  const schoolType = school?.school_category || standaloneProject?.school_type || "";
  const operator = school?.operator || "öffentlich";

  if (isStandaloneProject && standaloneProject) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-3xl">🏗️</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-bold text-foreground">{name}</h3>
            <Button
              size="sm"
              variant="light"
              isIconOnly
              onPress={onClose}
              aria-label="Close details"
              className="flex-shrink-0"
            >
              ✕
            </Button>
          </div>
          <div className="flex gap-2 mt-1">
            <Chip size="sm" variant="flat" color="warning">
              Construction Project
            </Chip>
            <Chip
              size="sm"
              variant="flat"
              color={getStatusColor(getProjectStatus(standaloneProject).status)}
            >
              {getStatusLabel(getProjectStatus(standaloneProject))}
            </Chip>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-xl font-bold text-foreground">{name}</h3>
        <Button
          size="sm"
          variant="light"
          isIconOnly
          onPress={onClose}
          aria-label="Close details"
          className="flex-shrink-0"
        >
          ✕
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Chip
          size="sm"
          variant="flat"
          style={{
            backgroundColor: `${getMarkerColor(schoolType)}20`,
            color: getMarkerColor(schoolType),
          }}
        >
          {schoolType}
        </Chip>
        <Chip size="sm" variant="flat" color="default">
          {operator}
        </Chip>
        {details?.available_after_4th_grade && (
          <Chip
            size="sm"
            variant="solid"
            className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-semibold"
            startContent={<span className="text-base">⚡</span>}
          >
            Entry After 4th Grade
          </Chip>
        )}
      </div>
    </>
  );
}

