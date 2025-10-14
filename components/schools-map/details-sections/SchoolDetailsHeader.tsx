"use client";

import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";

import {
  getMarkerColor,
  getProjectStatus,
  getStatusColor,
  getStatusLabel,
} from "../utils";

import { EnrichedSchool, ConstructionProject } from "@/types";

interface SchoolDetailsHeaderProps {
  item: EnrichedSchool | ConstructionProject;
  onClose: () => void;
}

export function SchoolDetailsHeader({
  item,
  onClose,
}: SchoolDetailsHeaderProps) {
  const isSchool = "school" in item;
  const isStandaloneProject = !isSchool;

  const enrichedSchool = isSchool ? (item as EnrichedSchool) : null;
  const standaloneProject = isStandaloneProject
    ? (item as ConstructionProject)
    : null;

  const school = enrichedSchool?.school || null;
  const details = enrichedSchool?.details || null;

  const name = school?.name || standaloneProject?.school_name || "";
  const schoolType =
    school?.school_category || standaloneProject?.school_type || "";
  const operator = school?.operator || "öffentlich";

  if (isStandaloneProject && standaloneProject) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-3xl">🏗️</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-bold text-foreground">{name}</h3>
            <Button
              isIconOnly
              aria-label="Close details"
              className="flex-shrink-0"
              size="sm"
              variant="light"
              onPress={onClose}
            >
              ✕
            </Button>
          </div>
          <div className="flex gap-2 mt-1">
            <Chip color="warning" size="sm" variant="flat">
              Construction Project
            </Chip>
            <Chip
              color={getStatusColor(getProjectStatus(standaloneProject).status)}
              size="sm"
              variant="flat"
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
          isIconOnly
          aria-label="Close details"
          className="flex-shrink-0"
          size="sm"
          variant="light"
          onPress={onClose}
        >
          ✕
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Chip
          size="sm"
          style={{
            backgroundColor: `${getMarkerColor(schoolType)}20`,
            color: getMarkerColor(schoolType),
          }}
          variant="flat"
        >
          {schoolType}
        </Chip>
        <Chip color="default" size="sm" variant="flat">
          {operator}
        </Chip>
        {details?.available_after_4th_grade && (
          <Chip
            className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-semibold"
            size="sm"
            startContent={<span className="text-base">⚡</span>}
            variant="solid"
          >
            Entry After 4th Grade
          </Chip>
        )}
      </div>
    </>
  );
}
