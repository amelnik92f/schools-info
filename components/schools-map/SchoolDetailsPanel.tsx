"use client";

import { Chip } from "@heroui/chip";
import { Link } from "@heroui/link";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Spinner } from "@heroui/spinner";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { EnrichedSchool, ConstructionProject } from "@/types";
import { useSchoolTagsStore } from "@/lib/store/school-tags-store";
import { useAISummaryStore } from "@/lib/store/ai-summary-store";
import { useCustomLocationsStore } from "@/lib/store/custom-locations-store";
import { SparklesIcon } from "@/components/icons";
import { TravelTimeSection } from "./TravelTimeSection";
import {
  getMarkerColor,
  getProjectStatus,
  getStatusColor,
  getStatusLabel,
} from "./utils";

function createGoogleEarthLink(latitude: number, longitude: number): string {
  // The part of the URL containing the fixed camera and data parameters.
  const fixedUrlEnd =
    ",65.01509008a,464.25589089d,35y,264.46221151h,60t,0r/data=CgRCAggBKAJCAggASg0I____________ARAA";

  // Combine the base URL, the dynamic coordinates, and the fixed parameters
  // using a template literal for clarity.
  const fullUrl = `https://earth.google.com/web/@${latitude},${longitude}${fixedUrlEnd}`;

  return fullUrl;
}

interface SchoolDetailsPanelProps {
  item: EnrichedSchool | ConstructionProject;
  onClose: () => void;
}

export function SchoolDetailsPanel({ item, onClose }: SchoolDetailsPanelProps) {
  const {
    tags,
    isLoaded: tagsLoaded,
    toggleTagOnSchool,
    schoolHasTag,
  } = useSchoolTagsStore();

  const {
    getSummary,
    isLoading: isSummaryLoading,
    getError: getSummaryError,
    fetchSummary,
  } = useAISummaryStore();

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
  const name = school?.name || standaloneProject?.school_name || "";
  const schoolType =
    school?.school_category || standaloneProject?.school_type || "";
  const district = school?.district || standaloneProject?.district || "";
  const street = school?.street || standaloneProject?.street || "";
  const houseNumber = school?.house_number || "";
  const postalCode =
    school?.postal_code || standaloneProject?.postal_code || "";
  const latitude = school?.latitude || standaloneProject?.latitude || 0;
  const longitude = school?.longitude || standaloneProject?.longitude || 0;
  const website = school?.website || "";
  const phone = school?.phone || "";
  const email = school?.email || "";
  const operator = school?.operator || "öffentlich";
  const stats = statistics && statistics.length > 0 ? statistics[0] : null;

  const handleSummarizeSchool = async () => {
    if (!isSchool) return; // Only schools can be summarized

    const statsForAI = stats
      ? {
          total_students: stats.students,
          total_teachers: stats.teachers,
          female_students: stats.students_female,
          male_students: stats.students_male,
        }
      : undefined;

    await fetchSummary({
      bsn,
      schoolName: name,
      schoolType,
      address: `${street} ${houseNumber}, ${postalCode} Berlin`,
      website,
      bezirk: district,
      stats: statsForAI,
    });
  };

  return (
    <div className="flex flex-col h-full bg-content1 border-l border-divider">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Show construction project header if it's a standalone project */}
          {isStandaloneProject && standaloneProject ? (
            <>
              <div className="flex items-center gap-3">
                <span className="text-3xl">🏗️</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold text-foreground">
                      {name}
                    </h3>
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
                      color={getStatusColor(
                        getProjectStatus(standaloneProject).status,
                      )}
                    >
                      {getStatusLabel(getProjectStatus(standaloneProject))}
                    </Chip>
                  </div>
                </div>
              </div>
            </>
          ) : (
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
          )}

          <Divider />

          {/* For construction projects, show construction details */}
          {isStandaloneProject && standaloneProject ? (
            <div className="space-y-3 text-sm text-default-700">
              <div>
                <span className="font-semibold text-foreground">
                  📍 Location:
                </span>
                <p className="mt-1">
                  {street}
                  <br />
                  {postalCode} {standaloneProject.city}, {district}
                </p>
              </div>

              <Divider />

              <div>
                <span className="font-semibold text-foreground">
                  🏫 School Type:
                </span>
                <p className="mt-1">{schoolType}</p>
              </div>

              <div>
                <span className="font-semibold text-foreground">
                  🔨 Construction Type:
                </span>
                <p className="mt-1">{standaloneProject.construction_measure}</p>
              </div>

              <div>
                <span className="font-semibold text-foreground">
                  📝 Description:
                </span>
                <p className="mt-1 leading-relaxed">
                  {standaloneProject.description}
                </p>
              </div>

              {standaloneProject.handover_date && (
                <div>
                  <span className="font-semibold text-foreground">
                    📅 Expected Completion:
                  </span>
                  <p className="mt-1">{standaloneProject.handover_date}</p>
                </div>
              )}

              {standaloneProject.total_costs && (
                <div>
                  <span className="font-semibold text-foreground">
                    💰 Total Cost:
                  </span>
                  <p className="mt-1">{standaloneProject.total_costs}</p>
                </div>
              )}

              <Divider />

              <div>
                <span className="font-semibold text-foreground">
                  🌍 Location:
                </span>
                <div className="mt-1">
                  <Link
                    href={createGoogleEarthLink(latitude, longitude)}
                    isExternal
                    size="sm"
                    className="text-primary"
                  >
                    View on Google Earth
                  </Link>
                </div>
              </div>

              {(standaloneProject.places_after_construction !== "k.A." ||
                standaloneProject.class_tracks_after_construction !==
                  "k.A.") && (
                <>
                  <Divider />
                  <div>
                    <span className="font-semibold text-foreground">
                      📊 Capacity After Construction:
                    </span>
                    {standaloneProject.places_after_construction !== "k.A." && (
                      <p className="mt-1">
                        Places: {standaloneProject.places_after_construction}
                      </p>
                    )}
                    {standaloneProject.class_tracks_after_construction !==
                      "k.A." && (
                      <p className="mt-1">
                        Tracks:{" "}
                        {standaloneProject.class_tracks_after_construction}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2 text-sm text-default-700">
              <div className="flex items-start gap-2">
                <span className="text-base">📍</span>
                <span>
                  {street} {houseNumber}
                  <br />
                  {postalCode} Berlin, {district}
                </span>
              </div>

              {phone && (
                <div className="flex items-center gap-2">
                  <span className="text-base">📞</span>
                  <span>{phone}</span>
                </div>
              )}

              {email && (
                <div className="flex items-center gap-2">
                  <span className="text-base">✉️</span>
                  <Link
                    href={`mailto:${email}`}
                    size="sm"
                    className="text-primary"
                  >
                    {email}
                  </Link>
                </div>
              )}

              {website && (
                <div className="flex items-center gap-2">
                  <span className="text-base">🌐</span>
                  <Link
                    href={website}
                    isExternal
                    size="sm"
                    className="text-primary break-all"
                  >
                    {website}
                  </Link>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-base">🌍</span>
                <Link
                  href={createGoogleEarthLink(latitude, longitude)}
                  isExternal
                  size="sm"
                  className="text-primary"
                >
                  View on Google Earth
                </Link>
              </div>
            </div>
          )}

          {/* School Details Sections */}
          {details && (
            <>
              {/* Languages Section */}
              {details.languages && details.languages.trim() && (
                <>
                  <Divider />
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-semibold text-foreground">
                        🌐 Languages Offered
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-content2">
                      <p className="text-xs text-default-700 leading-relaxed whitespace-pre-line">
                        {details.languages}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Advanced Courses Section */}
              {details.courses && details.courses.trim() && (
                <>
                  <Divider />
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-semibold text-foreground">
                        📚 Advanced Courses (Leistungskurse)
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-content2">
                      <p className="text-xs text-default-700 leading-relaxed whitespace-pre-line">
                        {details.courses}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Programs & Offerings Section */}
              {details.offerings && details.offerings.trim() && (
                <>
                  <Divider />
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-semibold text-foreground">
                        ✨ Programs & Special Offerings
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-content2">
                      <p className="text-xs text-default-700 leading-relaxed whitespace-pre-line">
                        {details.offerings}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Equipment & Facilities Section */}
              {details.equipment && details.equipment.trim() && (
                <>
                  <Divider />
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-semibold text-foreground">
                        🏢 Equipment & Facilities
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-content2">
                      <p className="text-xs text-default-700 leading-relaxed whitespace-pre-line">
                        {details.equipment}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Working Groups & Activities Section */}
              {details.working_groups && details.working_groups.trim() && (
                <>
                  <Divider />
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-semibold text-foreground">
                        🎯 Working Groups & Extracurricular Activities
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-content2">
                      <p className="text-xs text-default-700 leading-relaxed whitespace-pre-line">
                        {details.working_groups}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Partners Section */}
              {details.partners && details.partners.trim() && (
                <>
                  <Divider />
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-semibold text-foreground">
                        🤝 External Partners
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-content2">
                      <p className="text-xs text-default-700 leading-relaxed whitespace-pre-line">
                        {details.partners}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Differentiation Methods Section */}
              {details.differentiation && details.differentiation.trim() && (
                <>
                  <Divider />
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-semibold text-foreground">
                        🎓 Differentiation & Teaching Methods
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-content2">
                      <p className="text-xs text-default-700 leading-relaxed whitespace-pre-line">
                        {details.differentiation}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Lunch Information Section */}
              {details.lunch_info && details.lunch_info.trim() && (
                <>
                  <Divider />
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-semibold text-foreground">
                        🍽️ Lunch & Meal Services
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-content2">
                      <p className="text-xs text-default-700 leading-relaxed whitespace-pre-line">
                        {details.lunch_info}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Dual Learning Section */}
              {details.dual_learning && details.dual_learning.trim() && (
                <>
                  <Divider />
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-semibold text-foreground">
                        💼 Dual Learning Programs
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-content2">
                      <p className="text-xs text-default-700 leading-relaxed whitespace-pre-line">
                        {details.dual_learning}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Additional Information Section */}
              {details.additional_info && details.additional_info.trim() && (
                <>
                  <Divider />
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-semibold text-foreground">
                        ℹ️ Additional Information
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-content2">
                      <p className="text-xs text-default-700 leading-relaxed whitespace-pre-line">
                        {details.additional_info}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* AI Summary Button & Content Section */}
          {isSchool && (
            <>
              <Divider />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <SparklesIcon size={16} className="text-primary" />
                  <span className="text-xs font-semibold text-foreground">
                    AI-Powered School Summary
                  </span>
                  <Popover placement="top" showArrow>
                    <PopoverTrigger>
                      <button
                        className="flex items-center justify-center w-4 h-4 rounded-full bg-default-200 hover:bg-default-300 transition-colors cursor-help"
                        aria-label="Information about AI summary"
                      >
                        <span className="text-[10px] text-default-600 font-semibold">
                          ?
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="max-w-[280px]">
                      <div className="px-3 py-2">
                        <div className="text-xs font-semibold text-foreground mb-1">
                          ⚠️ AI-Generated Content
                        </div>
                        <p className="text-xs text-default-600 leading-relaxed">
                          This summary is generated by AI and may contain
                          inaccuracies. Please verify important information
                          directly with the school or visit their official
                          website.
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Summarize Button - Only show if no summary */}
                {!getSummary(bsn) && !getSummaryError(bsn) && (
                  <Button
                    size="sm"
                    variant="solid"
                    fullWidth
                    startContent={
                      isSummaryLoading(bsn) ? (
                        <Spinner size="sm" color="white" />
                      ) : (
                        <SparklesIcon size={16} />
                      )
                    }
                    onPress={handleSummarizeSchool}
                    isDisabled={isSummaryLoading(bsn)}
                    className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                    style={{
                      background:
                        "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #6366f1 100%)",
                    }}
                  >
                    {isSummaryLoading(bsn)
                      ? "Summarizing..."
                      : "Generate AI Summary"}
                  </Button>
                )}

                {/* AI Summary Content */}
                {getSummaryError(bsn) && (
                  <div className="p-3 rounded-lg bg-danger/10 border border-danger/20">
                    <p className="text-xs text-danger">
                      ⚠️ {getSummaryError(bsn)}
                    </p>
                  </div>
                )}

                {getSummary(bsn) && (
                  <div className="relative max-h-[200px] overflow-y-auto rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent">
                    <div className="p-3 text-xs text-default-700 leading-relaxed prose prose-sm max-w-none">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: getSummary(bsn)!
                            .replace(
                              /\*\*(.*?)\*\*/g,
                              '<strong class="text-foreground font-semibold">$1</strong>',
                            )
                            .replace(
                              /^• /gm,
                              '<span class="text-primary">•</span> ',
                            )
                            .replace(/\n/g, "<br />"),
                        }}
                      />
                    </div>
                    {/* Fade effect at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
                  </div>
                )}
              </div>
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
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-semibold text-foreground">
                    📊 Statistics ({stats.school_year})
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {/* Students Section */}
                  <div className="p-3 rounded-lg bg-content2">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">👨‍🎓</span>
                      <span className="text-xs font-semibold text-foreground">
                        Students
                      </span>
                    </div>
                    <div className="space-y-1 text-xs text-default-700">
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span className="font-semibold">{stats.students}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Female:</span>
                        <span>{stats.students_female}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Male:</span>
                        <span>{stats.students_male}</span>
                      </div>
                    </div>
                  </div>

                  {/* Teachers Section */}
                  <div className="p-3 rounded-lg bg-content2">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">👨‍🏫</span>
                      <span className="text-xs font-semibold text-foreground">
                        Teachers
                      </span>
                    </div>
                    <div className="space-y-1 text-xs text-default-700">
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span className="font-semibold">{stats.teachers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Female:</span>
                        <span>{stats.teachers_female}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Male:</span>
                        <span>{stats.teachers_male}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Student-Teacher Ratio */}
                {Number(stats.teachers) > 0 && (
                  <div className="mt-3 p-2 rounded-lg bg-primary/10">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground font-semibold">
                        📈 Student-Teacher Ratio:
                      </span>
                      <span className="text-foreground font-bold">
                        {(
                          Number(stats.students) / Number(stats.teachers)
                        ).toFixed(1)}
                        :1
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Residence Statistics Section */}
          {residenceStats && residenceStats.length > 0 && (
            <>
              <Divider />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-semibold text-foreground">
                    🏘️ Student Residence Distribution
                  </span>
                </div>
                <div className="space-y-2">
                  {residenceStats
                    .sort((a, b) => b.student_count - a.student_count)
                    .map((stat, index) => {
                      const totalStudents = residenceStats.reduce(
                        (sum, s) => sum + s.student_count,
                        0
                      );
                      const percentage =
                        totalStudents > 0
                          ? ((stat.student_count / totalStudents) * 100).toFixed(1)
                          : "0";

                      return (
                        <div
                          key={`${stat.district}-${index}`}
                          className="p-2 rounded-lg bg-content2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-foreground">
                              {stat.district}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-default-700">
                                {stat.student_count} students
                              </span>
                              <span className="text-xs font-semibold text-primary">
                                {percentage}%
                              </span>
                            </div>
                          </div>
                          {/* Progress bar */}
                          <div className="mt-1 h-1.5 bg-default-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </>
          )}

          {/* Citizenship Statistics Section */}
          {citizenshipStats && citizenshipStats.length > 0 && (() => {
            // Separate "Insgesamt" (total) from regional breakdown
            const totalRow = citizenshipStats.find(
              (stat) => stat.citizenship.toLowerCase() === "insgesamt"
            );
            const regionalStats = citizenshipStats.filter(
              (stat) => stat.citizenship.toLowerCase() !== "insgesamt"
            );

            return (
              <>
                <Divider />
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-semibold text-foreground">
                      🌍 Students with Non-German Citizenship
                    </span>
                  </div>

                  {/* Total Summary - Insgesamt */}
                  {totalRow && (
                    <div className="mb-3 p-3 rounded-lg bg-primary/10 border-2 border-primary/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-foreground">
                          Total Non-German Students
                        </span>
                        <span className="text-lg font-bold text-primary">
                          {totalRow.total}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-default-700 mb-2">
                        <div className="flex gap-3">
                          <span>👩 Female: {totalRow.female_students}%</span>
                          <span>👨 Male: {totalRow.male_students}%</span>
                        </div>
                        {stats && Number(stats.students) > 0 && (
                          <span className="font-semibold text-primary">
                            {((totalRow.total / Number(stats.students)) * 100).toFixed(1)}% of all students
                          </span>
                        )}
                      </div>
                      {/* Progress bar compared to total students */}
                      {stats && Number(stats.students) > 0 && (
                        <div className="h-2 bg-default-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{
                              width: `${((totalRow.total / Number(stats.students)) * 100).toFixed(1)}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Regional Breakdown */}
                  {regionalStats.length > 0 && (
                    <>
                      <div className="text-xs font-semibold text-default-600 mb-2">
                        Breakdown by Region:
                      </div>
                      <div className="space-y-2">
                        {regionalStats
                          .sort((a, b) => b.total - a.total)
                          .map((stat, index) => {
                            const totalNonGerman = totalRow?.total || regionalStats.reduce(
                              (sum, s) => sum + s.total,
                              0
                            );
                            const percentage =
                              totalNonGerman > 0
                                ? ((stat.total / totalNonGerman) * 100).toFixed(1)
                                : "0";

                            return (
                              <div
                                key={`${stat.citizenship}-${index}`}
                                className="p-2 rounded-lg bg-content2"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-foreground">
                                    {stat.citizenship}
                                  </span>
                                  <span className="text-xs font-semibold text-primary">
                                    {percentage}%
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-default-700 mb-1">
                                  <div className="flex gap-3">
                                    <span>👩 {stat.female_students}</span>
                                    <span>👨 {stat.male_students}</span>
                                  </div>
                                  <span className="font-semibold">
                                    Total: {stat.total}
                                  </span>
                                </div>
                                {/* Progress bar */}
                                <div className="h-1.5 bg-default-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary rounded-full transition-all"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </>
                  )}
                </div>
              </>
            );
          })()}

          {/* Language Statistics Section */}
          {languageStat && (
            <>
              <Divider />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-semibold text-foreground">
                    🗣️ Language & Heritage Statistics
                  </span>
                </div>

                {/* Summary Box */}
                <div className="mb-3 p-3 rounded-lg bg-primary/10 border-2 border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-foreground">
                      Students with Non-German Heritage
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {languageStat.ndh_total}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-default-700 mb-2">
                    <div className="flex gap-3">
                      <span>👩 Female: {languageStat.ndh_female_students}</span>
                      <span>👨 Male: {languageStat.ndh_male_students}</span>
                    </div>
                    <span className="font-semibold text-primary">
                      {languageStat.ndh_percentage.toFixed(1)}% of all students
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 bg-default-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{
                        width: `${languageStat.ndh_percentage.toFixed(1)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 rounded-lg bg-content2">
                    <div className="text-xs text-default-600 mb-1">
                      Total Students
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      {languageStat.total_students}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-content2">
                    <div className="text-xs text-default-600 mb-1">
                      German Heritage
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      {languageStat.total_students - languageStat.ndh_total}
                    </div>
                    <div className="text-xs text-default-600 mt-1">
                      {(100 - languageStat.ndh_percentage).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Absence Statistics Section */}
          {absenceStat && (
            <>
              <Divider />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-semibold text-foreground">
                    📅 Absence Statistics
                  </span>
                </div>

                {/* School Absence Summary */}
                <div className="mb-3 p-3 rounded-lg bg-primary/10 border-2 border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-foreground">
                      This School
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-default-600 mb-1">
                        Total Absence Rate
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {absenceStat.school_absence_rate.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-default-600 mb-1">
                        Unexcused Rate
                      </div>
                      <div className="text-2xl font-bold text-warning">
                        {absenceStat.school_unexcused_rate.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comparison with Other Levels */}
                <div className="space-y-2">
                  {/* School Type Comparison */}
                  <div className="p-2 rounded-lg bg-content2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-foreground">
                        School Type Average
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-default-700">Total Absence</span>
                          <span className="font-semibold text-foreground">
                            {absenceStat.school_type_absence_rate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-default-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-default-500 rounded-full transition-all"
                            style={{
                              width: `${Math.min(absenceStat.school_type_absence_rate, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-default-700">Unexcused</span>
                          <span className="font-semibold text-foreground">
                            {absenceStat.school_type_unexcused_rate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-default-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-warning rounded-full transition-all"
                            style={{
                              width: `${Math.min(absenceStat.school_type_unexcused_rate, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Region Comparison */}
                  <div className="p-2 rounded-lg bg-content2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-foreground">
                        Region Average
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-default-700">Total Absence</span>
                          <span className="font-semibold text-foreground">
                            {absenceStat.region_absence_rate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-default-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-default-500 rounded-full transition-all"
                            style={{
                              width: `${Math.min(absenceStat.region_absence_rate, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-default-700">Unexcused</span>
                          <span className="font-semibold text-foreground">
                            {absenceStat.region_unexcused_rate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-default-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-warning rounded-full transition-all"
                            style={{
                              width: `${Math.min(absenceStat.region_unexcused_rate, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Berlin Comparison */}
                  <div className="p-2 rounded-lg bg-content2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-foreground">
                        Berlin Average
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-default-700">Total Absence</span>
                          <span className="font-semibold text-foreground">
                            {absenceStat.berlin_absence_rate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-default-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-default-500 rounded-full transition-all"
                            style={{
                              width: `${Math.min(absenceStat.berlin_absence_rate, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-default-700">Unexcused</span>
                          <span className="font-semibold text-foreground">
                            {absenceStat.berlin_unexcused_rate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-default-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-warning rounded-full transition-all"
                            style={{
                              width: `${Math.min(absenceStat.berlin_unexcused_rate, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Construction History Section */}
          {constructionProjects && constructionProjects.length > 0 && (
            <>
              <Divider />
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
                      <div
                        key={project.id}
                        className="p-2 rounded-lg bg-content2"
                      >
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
            </>
          )}

          {/* Tags Section */}
          {tagsLoaded && (
            <>
              <Divider />
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-foreground">
                    🏷️ Tags
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => {
                    const isActive = schoolHasTag(`schulen.${bsn}`, tag.id);
                    return (
                      <Chip
                        key={tag.id}
                        size="sm"
                        variant={isActive ? "solid" : "bordered"}
                        style={{
                          backgroundColor: isActive ? tag.color : "transparent",
                          borderColor: tag.color,
                          color: isActive ? "#fff" : tag.color,
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          toggleTagOnSchool(`schulen.${bsn}`, tag.id)
                        }
                      >
                        {isActive ? "✓ " : ""}
                        {tag.name}
                      </Chip>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
