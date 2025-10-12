"use client";

import { useMemo } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Checkbox } from "@heroui/checkbox";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import { MapRef } from "react-map-gl/maplibre";
import { EnrichedSchool, ConstructionProject } from "@/types";
import { useSchoolsMapStore } from "@/lib/store/schools-map-store";
import { useSchoolTagsStore } from "@/lib/store/school-tags-store";
import { useCustomLocationsStore } from "@/lib/store/custom-locations-store";
import { getMarkerColor } from "./utils";

interface FilterPanelProps {
  schools: EnrichedSchool[];
  standaloneProjects: ConstructionProject[];
  filteredItemsCount: number;
  mapRef: React.RefObject<MapRef>;
}

export function FilterPanel({
  schools,
  standaloneProjects,
  filteredItemsCount,
  mapRef,
}: FilterPanelProps) {
  const {
    searchQuery,
    setSearchQuery,
    selectedSchoolTypes,
    selectedCarriers,
    selectedDistricts,
    selectedTags,
    showAfter4thGradeOnly,
    setShowAfter4thGradeOnly,
    isSettingLocation,
    setIsSettingLocation,
    toggleSchoolType,
    toggleCarrier,
    toggleDistrict,
    toggleTag,
    clearAllFilters,
    hasActiveFilters,
  } = useSchoolsMapStore();

  const {
    tags,
    isLoaded: tagsLoaded,
    getSchoolTags,
    schoolHasTag,
  } = useSchoolTagsStore();

  const {
    locations,
    isLoaded: locationsLoaded,
    removeLocation,
    hasLocation,
  } = useCustomLocationsStore();

  // Combine all items
  const allItems = useMemo(() => {
    return [...schools, ...standaloneProjects];
  }, [schools, standaloneProjects]);

  // Extract unique values for filters
  const { schoolTypes, carriers, districts } = useMemo(() => {
    const typesSet = new Set<string>();
    const carriersSet = new Set<string>();
    const districtsSet = new Set<string>();

    allItems.forEach((item) => {
      const isSchool = "school" in item;
      const school = isSchool ? (item as EnrichedSchool).school : null;
      const project = !isSchool ? (item as ConstructionProject) : null;

      const schoolType = school?.school_category || project?.school_type || "";
      const operator = school?.operator || "öffentlich";
      const district = school?.district || project?.district || "";

      if (schoolType) typesSet.add(schoolType);
      if (operator) carriersSet.add(operator);
      if (district) districtsSet.add(district);
    });

    return {
      schoolTypes: Array.from(typesSet).sort(),
      carriers: Array.from(carriersSet).sort(),
      districts: Array.from(districtsSet).sort(),
    };
  }, [allItems]);

  // Helper to count items with specific filter applied
  const countItemsWithFilter = (filterFn: (item: any) => boolean) => {
    return allItems.filter((item) => {
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const isSchool = "school" in item;
        const school = isSchool ? (item as EnrichedSchool).school : null;
        const project = !isSchool ? (item as ConstructionProject) : null;

        const name = school?.name || project?.school_name || "";
        const street = school?.street || project?.street || "";
        const district = school?.district || project?.district || "";

        const matchesSearch =
          name.toLowerCase().includes(query) ||
          street.toLowerCase().includes(query) ||
          district.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      return filterFn(item);
    }).length;
  };

  return (
    <div className="border-b border-divider">
      <div className="p-4 pb-2">
        {/* Custom Location Buttons */}
        {locationsLoaded && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-semibold text-foreground">
              📍 My Locations:
            </span>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant={hasLocation("home") ? "solid" : "bordered"}
                color={isSettingLocation === "home" ? "primary" : "default"}
                startContent={<span className="text-base">🏠</span>}
                onPress={() => {
                  if (hasLocation("home")) {
                    const loc = locations.home;
                    if (loc && mapRef.current) {
                      mapRef.current.flyTo({
                        center: loc.coordinates,
                        zoom: 14,
                        duration: 1000,
                      });
                    }
                  } else {
                    setIsSettingLocation(
                      isSettingLocation === "home" ? null : "home",
                    );
                  }
                }}
              >
                {isSettingLocation === "home"
                  ? "Click on map..."
                  : hasLocation("home")
                    ? "Home"
                    : "Set Home"}
              </Button>
              {hasLocation("home") && (
                <Button
                  size="sm"
                  variant="light"
                  color="danger"
                  isIconOnly
                  onPress={() => removeLocation("home")}
                >
                  ✕
                </Button>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant={hasLocation("work") ? "solid" : "bordered"}
                color={isSettingLocation === "work" ? "primary" : "default"}
                startContent={<span className="text-base">💼</span>}
                onPress={() => {
                  if (hasLocation("work")) {
                    const loc = locations.work;
                    if (loc && mapRef.current) {
                      mapRef.current.flyTo({
                        center: loc.coordinates,
                        zoom: 14,
                        duration: 1000,
                      });
                    }
                  } else {
                    setIsSettingLocation(
                      isSettingLocation === "work" ? null : "work",
                    );
                  }
                }}
              >
                {isSettingLocation === "work"
                  ? "Click on map..."
                  : hasLocation("work")
                    ? "Work"
                    : "Set Work"}
              </Button>
              {hasLocation("work") && (
                <Button
                  size="sm"
                  variant="light"
                  color="danger"
                  isIconOnly
                  onPress={() => removeLocation("work")}
                >
                  ✕
                </Button>
              )}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Chip size="sm" variant="flat" color="primary">
              {filteredItemsCount} / {allItems.length} schools
            </Chip>
            {standaloneProjects.length > 0 && (
              <Chip size="sm" variant="flat" color="warning">
                🏗️ {standaloneProjects.length} projects
              </Chip>
            )}
          </div>
          {hasActiveFilters() && (
            <Button
              size="sm"
              variant="flat"
              color="danger"
              onPress={clearAllFilters}
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Search Input */}
        <Input
          placeholder="Search by school name, street, or district..."
          value={searchQuery}
          onValueChange={setSearchQuery}
          isClearable
          startContent={<span className="text-default-400 text-lg">🔎</span>}
          classNames={{
            input: "text-sm",
          }}
        />

        <div className="mt-4 space-y-4">
          <Divider />

          {/* School Type Filter */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              School Types
            </h3>
            <div className="flex flex-col gap-2">
              {schoolTypes.map((type) => {
                const count = countItemsWithFilter((item) => {
                  const isSchool = "school" in item;
                  const school = isSchool
                    ? (item as EnrichedSchool).school
                    : null;
                  const project = !isSchool
                    ? (item as ConstructionProject)
                    : null;

                  const operator = school?.operator || "öffentlich";
                  const district = school?.district || project?.district || "";
                  const schoolType =
                    school?.school_category || project?.school_type || "";
                  const acceptsAfter4th = isSchool
                    ? (item as EnrichedSchool).details
                        ?.available_after_4th_grade || false
                    : false;

                  if (
                    selectedCarriers.size > 0 &&
                    !selectedCarriers.has(operator)
                  )
                    return false;
                  if (
                    selectedDistricts.size > 0 &&
                    !selectedDistricts.has(district)
                  )
                    return false;
                  if (showAfter4thGradeOnly && !acceptsAfter4th) return false;
                  return schoolType === type;
                });
                return (
                  <Checkbox
                    key={type}
                    size="sm"
                    isSelected={selectedSchoolTypes.has(type)}
                    onValueChange={() => toggleSchoolType(type)}
                    classNames={{
                      wrapper: "min-w-0",
                      label: "w-full min-w-0",
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0 w-full">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getMarkerColor(type) }}
                      />
                      <span className="text-xs text-default-700 truncate">
                        {type} ({count})
                      </span>
                    </div>
                  </Checkbox>
                );
              })}
            </div>
          </div>

          <Divider />

          {/* Carrier Filter */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Operator Type
            </h3>
            <div className="flex flex-wrap gap-3">
              {carriers.map((carrier) => {
                const count = countItemsWithFilter((item) => {
                  const isSchool = "school" in item;
                  const school = isSchool
                    ? (item as EnrichedSchool).school
                    : null;
                  const project = !isSchool
                    ? (item as ConstructionProject)
                    : null;

                  const operator = school?.operator || "öffentlich";
                  const district = school?.district || project?.district || "";
                  const schoolType =
                    school?.school_category || project?.school_type || "";
                  const acceptsAfter4th = isSchool
                    ? (item as EnrichedSchool).details
                        ?.available_after_4th_grade || false
                    : false;

                  if (
                    selectedSchoolTypes.size > 0 &&
                    !selectedSchoolTypes.has(schoolType)
                  )
                    return false;
                  if (
                    selectedDistricts.size > 0 &&
                    !selectedDistricts.has(district)
                  )
                    return false;
                  if (showAfter4thGradeOnly && !acceptsAfter4th) return false;
                  return operator === carrier;
                });
                return (
                  <Checkbox
                    key={carrier}
                    size="sm"
                    isSelected={selectedCarriers.has(carrier)}
                    onValueChange={() => toggleCarrier(carrier)}
                  >
                    <span className="text-xs text-default-700">
                      {carrier} ({count})
                    </span>
                  </Checkbox>
                );
              })}
            </div>
          </div>

          <Divider />

          {/* District Filter */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Districts
            </h3>
            <div className="flex flex-col gap-2">
              {districts.map((district) => {
                const count = countItemsWithFilter((item) => {
                  const isSchool = "school" in item;
                  const school = isSchool
                    ? (item as EnrichedSchool).school
                    : null;
                  const project = !isSchool
                    ? (item as ConstructionProject)
                    : null;

                  const operator = school?.operator || "öffentlich";
                  const itemDistrict =
                    school?.district || project?.district || "";
                  const schoolType =
                    school?.school_category || project?.school_type || "";
                  const acceptsAfter4th = isSchool
                    ? (item as EnrichedSchool).details
                        ?.available_after_4th_grade || false
                    : false;

                  if (
                    selectedSchoolTypes.size > 0 &&
                    !selectedSchoolTypes.has(schoolType)
                  )
                    return false;
                  if (
                    selectedCarriers.size > 0 &&
                    !selectedCarriers.has(operator)
                  )
                    return false;
                  if (showAfter4thGradeOnly && !acceptsAfter4th) return false;
                  return itemDistrict === district;
                });
                return (
                  <Checkbox
                    key={district}
                    size="sm"
                    isSelected={selectedDistricts.has(district)}
                    onValueChange={() => toggleDistrict(district)}
                    classNames={{
                      wrapper: "min-w-0",
                      label: "w-full min-w-0",
                    }}
                  >
                    <span className="text-xs text-default-700 truncate block">
                      {district} ({count})
                    </span>
                  </Checkbox>
                );
              })}
            </div>
          </div>

          {/* Tag Filter */}
          {tagsLoaded && (
            <>
              <Divider />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => {
                    const count = countItemsWithFilter((item) => {
                      const isSchool = "school" in item;
                      if (!isSchool) return false; // Tags only apply to schools

                      const school = (item as EnrichedSchool).school;
                      const operator = school.operator;
                      const district = school.district;
                      const schoolType = school.school_category;
                      const acceptsAfter4th =
                        (item as EnrichedSchool).details
                          ?.available_after_4th_grade || false;

                      if (
                        selectedSchoolTypes.size > 0 &&
                        !selectedSchoolTypes.has(schoolType)
                      )
                        return false;
                      if (
                        selectedCarriers.size > 0 &&
                        !selectedCarriers.has(operator)
                      )
                        return false;
                      if (
                        selectedDistricts.size > 0 &&
                        !selectedDistricts.has(district)
                      )
                        return false;
                      if (showAfter4thGradeOnly && !acceptsAfter4th)
                        return false;
                      return schoolHasTag(
                        `schulen.${school.school_number}`,
                        tag.id,
                      );
                    });

                    return (
                      <Chip
                        key={tag.id}
                        size="sm"
                        variant={selectedTags.has(tag.id) ? "solid" : "flat"}
                        style={{
                          backgroundColor: selectedTags.has(tag.id)
                            ? tag.color
                            : `${tag.color}20`,
                          color: selectedTags.has(tag.id) ? "#fff" : tag.color,
                          cursor: "pointer",
                        }}
                        onClick={() => toggleTag(tag.id)}
                      >
                        {tag.name} ({count})
                      </Chip>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* After 4th Grade Filter */}
          <Divider />
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Special Programs
            </h3>
            <Checkbox
              size="sm"
              isSelected={showAfter4thGradeOnly}
              onValueChange={setShowAfter4thGradeOnly}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">⚡</span>
                <span className="text-xs text-default-700">
                  Entry After 4th Grade Available (
                  {countItemsWithFilter((item) => {
                    const isSchool = "school" in item;
                    const school = isSchool
                      ? (item as EnrichedSchool).school
                      : null;
                    const project = !isSchool
                      ? (item as ConstructionProject)
                      : null;

                    const operator = school?.operator || "öffentlich";
                    const district =
                      school?.district || project?.district || "";
                    const schoolType =
                      school?.school_category || project?.school_type || "";
                    const acceptsAfter4th = isSchool
                      ? (item as EnrichedSchool).details
                          ?.available_after_4th_grade || false
                      : false;

                    if (
                      selectedSchoolTypes.size > 0 &&
                      !selectedSchoolTypes.has(schoolType)
                    )
                      return false;
                    if (
                      selectedCarriers.size > 0 &&
                      !selectedCarriers.has(operator)
                    )
                      return false;
                    if (
                      selectedDistricts.size > 0 &&
                      !selectedDistricts.has(district)
                    )
                      return false;
                    if (selectedTags.size > 0 && isSchool) {
                      const schoolNumber = school?.school_number || "";
                      const schoolTagIds = getSchoolTags(
                        `schulen.${schoolNumber}`,
                      ).map((t) => t.id);
                      const hasAnySelectedTag = Array.from(selectedTags).some(
                        (tagId) => schoolTagIds.includes(tagId),
                      );
                      if (!hasAnySelectedTag) return false;
                    }
                    return acceptsAfter4th;
                  })}
                  )
                </span>
              </div>
            </Checkbox>
          </div>
        </div>
      </div>
    </div>
  );
}
