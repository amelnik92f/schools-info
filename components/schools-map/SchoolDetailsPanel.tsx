"use client";

import { Divider } from "@heroui/divider";

import { TravelTimeSection } from "./TravelTimeSection";
import {
  SchoolDetailsHeader,
  ContactSection,
  DetailFieldSection,
  AISummarySection,
  StatisticsSection,
  ResidenceStatisticsSection,
  CitizenshipStatisticsSection,
  LanguageStatisticsSection,
  AbsenceStatisticsSection,
  ConstructionHistorySection,
  TagsSection,
} from "./details-sections";

import { EnrichedSchool, ConstructionProject } from "@/types";
import { useCustomLocationsStore } from "@/lib/store/custom-locations-store";

interface SchoolDetailsPanelProps {
  item: EnrichedSchool | ConstructionProject;
  onClose: () => void;
}

export function SchoolDetailsPanel({ item, onClose }: SchoolDetailsPanelProps) {
  const { hasLocation } = useCustomLocationsStore();

  // Determine if this is a school or standalone construction project
  const isSchool = "school" in item;
  const isStandaloneProject = !isSchool;

  // Extract data based on type
  const enrichedSchool = isSchool ? (item as EnrichedSchool) : null;
  const standaloneProject = isStandaloneProject
    ? (item as ConstructionProject)
    : null;

  const school = enrichedSchool?.school || null;
  const details = enrichedSchool?.details || null;
  const constructionProjects = enrichedSchool?.construction_projects || [];

  // TODO: Display language, residence, absence, citizenship stats
  const languageStat = enrichedSchool?.language_stat || null;
  const absenceStat = enrichedSchool?.absence_stat || null;
  const citizenshipStats = enrichedSchool?.citizenship_stats || [];
  const residenceStats = enrichedSchool?.residence_stats || [];
  const statistics = enrichedSchool?.statistics || [];

  // Common properties
  const bsn = school?.school_number || standaloneProject?.school_number || "";

  const latitude = school?.latitude || standaloneProject?.latitude || 0;
  const longitude = school?.longitude || standaloneProject?.longitude || 0;
  const stats = statistics && statistics.length > 0 ? statistics[0] : null;

  return (
    <div className="flex flex-col h-full bg-content1 border-l border-divider">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Header Section */}
          <SchoolDetailsHeader item={item} onClose={onClose} />

          <Divider />

          {/* Contact/Location Section */}
          <ContactSection item={item} />

          {/* School Detail Fields */}
          {details?.languages && (
            <>
              <Divider />
              <DetailFieldSection
                content={details.languages}
                icon="🌐"
                title="Languages Offered"
              />
            </>
          )}

          {details?.courses && (
            <>
              <Divider />
              <DetailFieldSection
                content={details.courses}
                icon="📚"
                title="Advanced Courses (Leistungskurse)"
              />
            </>
          )}

          {details?.offerings && (
            <>
              <Divider />
              <DetailFieldSection
                content={details.offerings}
                icon="✨"
                title="Programs & Special Offerings"
              />
            </>
          )}

          {details?.equipment && (
            <>
              <Divider />
              <DetailFieldSection
                content={details.equipment}
                icon="🏢"
                title="Equipment & Facilities"
              />
            </>
          )}

          {details?.working_groups && (
            <>
              <Divider />
              <DetailFieldSection
                content={details.working_groups}
                icon="🎯"
                title="Working Groups & Extracurricular Activities"
              />
            </>
          )}

          {details?.partners && (
            <>
              <Divider />
              <DetailFieldSection
                content={details.partners}
                icon="🤝"
                title="External Partners"
              />
            </>
          )}

          {details?.differentiation && (
            <>
              <Divider />
              <DetailFieldSection
                content={details.differentiation}
                icon="🎓"
                title="Differentiation & Teaching Methods"
              />
            </>
          )}

          {details?.lunch_info && (
            <>
              <Divider />
              <DetailFieldSection
                content={details.lunch_info}
                icon="🍽️"
                title="Lunch & Meal Services"
              />
            </>
          )}

          {details?.dual_learning && (
            <>
              <Divider />
              <DetailFieldSection
                content={details.dual_learning}
                icon="💼"
                title="Dual Learning Programs"
              />
            </>
          )}

          {details?.additional_info && (
            <>
              <Divider />
              <DetailFieldSection
                content={details.additional_info}
                icon="ℹ️"
                title="Additional Information"
              />
            </>
          )}

          {/* AI Summary Section */}
          {isSchool && school && (
            <>
              <Divider />
              <AISummarySection bsn={bsn} schoolId={school.id.toString()} />
            </>
          )}

          {/* Travel Time Section */}
          {isSchool && hasLocation("home") && (
            <TravelTimeSection
              schoolCoordinates={[longitude, latitude]}
              schoolId={`schulen.${bsn}`}
            />
          )}

          {/* Statistics Section */}
          {stats && (
            <>
              <Divider />
              <StatisticsSection stats={stats} />
            </>
          )}

          {/* Residence Statistics Section */}
          {residenceStats && residenceStats.length > 0 && (
            <>
              <Divider />
              <ResidenceStatisticsSection residenceStats={residenceStats} />
            </>
          )}

          {/* Citizenship Statistics Section */}
          {citizenshipStats && citizenshipStats.length > 0 && (
            <>
              <Divider />
              <CitizenshipStatisticsSection
                citizenshipStats={citizenshipStats}
                stats={stats}
              />
            </>
          )}

          {/* Language Statistics Section */}
          {languageStat && (
            <>
              <Divider />
              <LanguageStatisticsSection languageStat={languageStat} />
            </>
          )}

          {/* Absence Statistics Section */}
          {absenceStat && (
            <>
              <Divider />
              <AbsenceStatisticsSection absenceStat={absenceStat} />
            </>
          )}

          {/* Construction History Section */}
          {constructionProjects && constructionProjects.length > 0 && (
            <>
              <Divider />
              <ConstructionHistorySection
                constructionProjects={constructionProjects}
              />
            </>
          )}

          {/* Tags Section */}
          {isSchool && (
            <>
              <Divider />
              <TagsSection schoolId={`schulen.${bsn}`} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
