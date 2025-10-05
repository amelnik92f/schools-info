"use client";

import { Chip } from "@heroui/chip";
import { Link } from "@heroui/link";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Spinner } from "@heroui/spinner";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { SchoolFeature } from "@/types";
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

interface SchoolDetailsPanelProps {
  school: SchoolFeature;
  onClose: () => void;
}

export function SchoolDetailsPanel({
  school,
  onClose,
}: SchoolDetailsPanelProps) {
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

  const handleSummarizeSchool = async () => {
    await fetchSummary({
      bsn: school.properties.bsn,
      schoolName: school.properties.schulname,
      schoolType: school.properties.schultyp,
      address: `${school.properties.strasse} ${school.properties.hausnr}, ${school.properties.plz} Berlin`,
      website: school.properties.internet,
      bezirk: school.properties.bezirk,
      stats: school.properties.stats,
    });
  };

  return (
    <div className="flex flex-col h-full bg-content1 border-l border-divider">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Show construction project header if it's a standalone project */}
          {school.properties.isConstructionProject &&
          school.properties.constructionData ? (
            <>
              <div className="flex items-center gap-3">
                <span className="text-3xl">🏗️</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold text-foreground">
                      {school.properties.schulname}
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
                        getProjectStatus(school.properties.constructionData)
                          .status,
                      )}
                    >
                      {getStatusLabel(
                        getProjectStatus(school.properties.constructionData),
                      )}
                    </Chip>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-xl font-bold text-foreground">
                  {school.properties.schulname}
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

              <div className="flex flex-wrap gap-2">
                <Chip
                  size="sm"
                  variant="flat"
                  style={{
                    backgroundColor: `${getMarkerColor(school.properties.schultyp)}20`,
                    color: getMarkerColor(school.properties.schultyp),
                  }}
                >
                  {school.properties.schultyp}
                </Chip>
                <Chip size="sm" variant="flat" color="default">
                  {school.properties.traeger}
                </Chip>
                {school.properties.acceptsAfter4thGrade && (
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
          {school.properties.isConstructionProject &&
          school.properties.constructionData ? (
            <div className="space-y-3 text-sm text-default-700">
              <div>
                <span className="font-semibold text-foreground">
                  📍 Location:
                </span>
                <p className="mt-1">
                  {school.properties.constructionData.strasse}
                  <br />
                  {school.properties.constructionData.plz}{" "}
                  {school.properties.constructionData.ort},{" "}
                  {school.properties.constructionData.bezirk}
                </p>
              </div>

              <Divider />

              <div>
                <span className="font-semibold text-foreground">
                  🏫 School Type:
                </span>
                <p className="mt-1">
                  {school.properties.constructionData.schulart}
                </p>
              </div>

              <div>
                <span className="font-semibold text-foreground">
                  🔨 Construction Type:
                </span>
                <p className="mt-1">
                  {school.properties.constructionData.baumassnahme}
                </p>
              </div>

              <div>
                <span className="font-semibold text-foreground">
                  📝 Description:
                </span>
                <p className="mt-1 leading-relaxed">
                  {school.properties.constructionData.beschreibung}
                </p>
              </div>

              {school.properties.constructionData.nutzungsuebergabe && (
                <div>
                  <span className="font-semibold text-foreground">
                    📅 Expected Completion:
                  </span>
                  <p className="mt-1">
                    {school.properties.constructionData.nutzungsuebergabe}
                  </p>
                </div>
              )}

              {school.properties.constructionData.gesamtkosten && (
                <div>
                  <span className="font-semibold text-foreground">
                    💰 Total Cost:
                  </span>
                  <p className="mt-1">
                    {school.properties.constructionData.gesamtkosten}
                  </p>
                </div>
              )}

              {(school.properties.constructionData
                .schulplaetze_nach_baumassnahme !== "k.A." ||
                school.properties.constructionData
                  .zuegigkeit_nach_baumassnahme !== "k.A.") && (
                <>
                  <Divider />
                  <div>
                    <span className="font-semibold text-foreground">
                      📊 Capacity After Construction:
                    </span>
                    {school.properties.constructionData
                      .schulplaetze_nach_baumassnahme !== "k.A." && (
                      <p className="mt-1">
                        Places:{" "}
                        {
                          school.properties.constructionData
                            .schulplaetze_nach_baumassnahme
                        }
                      </p>
                    )}
                    {school.properties.constructionData
                      .zuegigkeit_nach_baumassnahme !== "k.A." && (
                      <p className="mt-1">
                        Tracks:{" "}
                        {
                          school.properties.constructionData
                            .zuegigkeit_nach_baumassnahme
                        }
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
                  {school.properties.strasse} {school.properties.hausnr}
                  <br />
                  {school.properties.plz} Berlin, {school.properties.bezirk}
                </span>
              </div>

              {school.properties.telefon && (
                <div className="flex items-center gap-2">
                  <span className="text-base">📞</span>
                  <span>{school.properties.telefon}</span>
                </div>
              )}

              {school.properties.email && (
                <div className="flex items-center gap-2">
                  <span className="text-base">✉️</span>
                  <Link
                    href={`mailto:${school.properties.email}`}
                    size="sm"
                    className="text-primary"
                  >
                    {school.properties.email}
                  </Link>
                </div>
              )}

              {school.properties.internet && (
                <div className="flex items-center gap-2">
                  <span className="text-base">🌐</span>
                  <Link
                    href={school.properties.internet}
                    isExternal
                    size="sm"
                    className="text-primary break-all"
                  >
                    {school.properties.internet}
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* AI Summary Button & Content Section */}
          {!school.properties.isConstructionProject && (
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
                {!getSummary(school.properties.bsn) &&
                  !getSummaryError(school.properties.bsn) && (
                    <Button
                      size="sm"
                      variant="solid"
                      fullWidth
                      startContent={
                        isSummaryLoading(school.properties.bsn) ? (
                          <Spinner size="sm" color="white" />
                        ) : (
                          <SparklesIcon size={16} />
                        )
                      }
                      onPress={handleSummarizeSchool}
                      isDisabled={isSummaryLoading(school.properties.bsn)}
                      className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                      style={{
                        background:
                          "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #6366f1 100%)",
                      }}
                    >
                      {isSummaryLoading(school.properties.bsn)
                        ? "Summarizing..."
                        : "Generate AI Summary"}
                    </Button>
                  )}

                {/* AI Summary Content */}
                {getSummaryError(school.properties.bsn) && (
                  <div className="p-3 rounded-lg bg-danger/10 border border-danger/20">
                    <p className="text-xs text-danger">
                      ⚠️ {getSummaryError(school.properties.bsn)}
                    </p>
                  </div>
                )}

                {getSummary(school.properties.bsn) && (
                  <div className="relative max-h-[200px] overflow-y-auto rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent">
                    <div className="p-3 text-xs text-default-700 leading-relaxed prose prose-sm max-w-none">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: getSummary(school.properties.bsn)!
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
          {!school.properties.isConstructionProject && hasLocation("home") && (
            <TravelTimeSection
              schoolCoordinates={school.geometry.coordinates}
              schoolId={school.id}
            />
          )}

          {/* Statistics Section */}
          {school.properties.stats && (
            <>
              <Divider />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-semibold text-foreground">
                    📊 Statistics ({school.properties.stats.schuljahr})
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
                        <span className="font-semibold">
                          {school.properties.stats.schuelerGesamt.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Female:</span>
                        <span>
                          {school.properties.stats.schuelerWeiblich.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Male:</span>
                        <span>
                          {school.properties.stats.schuelerMaennlich.toLocaleString()}
                        </span>
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
                        <span className="font-semibold">
                          {school.properties.stats.lehrkraefteGesamt.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Female:</span>
                        <span>
                          {school.properties.stats.lehrkraefteWeiblich.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Male:</span>
                        <span>
                          {school.properties.stats.lehrkraefteMaennlich.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Student-Teacher Ratio */}
                {school.properties.stats.lehrkraefteGesamt > 0 && (
                  <div className="mt-3 p-2 rounded-lg bg-primary/10">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground font-semibold">
                        📈 Student-Teacher Ratio:
                      </span>
                      <span className="text-foreground font-bold">
                        {(
                          school.properties.stats.schuelerGesamt /
                          school.properties.stats.lehrkraefteGesamt
                        ).toFixed(1)}
                        :1
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Construction History Section */}
          {school.properties.constructionHistory &&
            school.properties.constructionHistory.length > 0 && (
              <>
                <Divider />
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-foreground">
                      🏗️ Construction History
                    </span>
                  </div>
                  <div className="space-y-2">
                    {school.properties.constructionHistory.map((project) => {
                      const statusInfo = getProjectStatus(project);
                      return (
                        <div
                          key={project.id}
                          className="p-2 rounded-lg bg-content2"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="text-xs font-semibold text-foreground">
                              {project.baumassnahme}
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
                          {project.beschreibung && (
                            <p className="text-xs text-default-600 leading-relaxed">
                              {project.beschreibung}
                            </p>
                          )}
                          {project.gesamtkosten && (
                            <p className="text-xs text-default-500 mt-1">
                              💰 {project.gesamtkosten}
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
                    const isActive = schoolHasTag(school.id, tag.id);
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
                        onClick={() => toggleTagOnSchool(school.id, tag.id)}
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
