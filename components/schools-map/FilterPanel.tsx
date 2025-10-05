"use client";

import { useMemo } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Checkbox } from "@heroui/checkbox";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import { MapRef } from "react-map-gl/maplibre";
import { SchoolsGeoJSON } from "@/types";
import { useSchoolsMapStore } from "@/lib/store/schools-map-store";
import { useSchoolTagsStore } from "@/lib/store/school-tags-store";
import { useCustomLocationsStore } from "@/lib/store/custom-locations-store";
import { getMarkerColor } from "./utils";

interface FilterPanelProps {
  schoolsData: SchoolsGeoJSON;
  filteredSchoolsCount: number;
  mapRef: React.RefObject<MapRef>;
}

export function FilterPanel({
  schoolsData,
  filteredSchoolsCount,
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
    showFilters,
    setShowFilters,
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

  // Extract unique values for filters
  const { schoolTypes, carriers, districts } = useMemo(() => {
    const typesSet = new Set<string>();
    const carriersSet = new Set<string>();
    const districtsSet = new Set<string>();

    schoolsData.features.forEach((school) => {
      typesSet.add(school.properties.schultyp);
      carriersSet.add(school.properties.traeger);
      districtsSet.add(school.properties.bezirk);
    });

    return {
      schoolTypes: Array.from(typesSet).sort(),
      carriers: Array.from(carriersSet).sort(),
      districts: Array.from(districtsSet).sort(),
    };
  }, [schoolsData]);

  // Helper to count schools with specific filter applied
  const countSchoolsWithFilter = (filterFn: (school: any) => boolean) => {
    return schoolsData.features.filter((s) => {
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          s.properties.schulname.toLowerCase().includes(query) ||
          s.properties.strasse.toLowerCase().includes(query) ||
          s.properties.bezirk.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      return filterFn(s);
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
              {filteredSchoolsCount} / {schoolsData.features.length} schools
            </Chip>
            {schoolsData.features.some(
              (f) => f.properties.isConstructionProject,
            ) && (
              <Chip size="sm" variant="flat" color="warning">
                🏗️{" "}
                {
                  schoolsData.features.filter(
                    (f) => f.properties.isConstructionProject,
                  ).length
                }{" "}
                projects
              </Chip>
            )}
          </div>
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

        {/* Expandable Filters */}
        {showFilters && (
          <div className="mt-4 space-y-4">
            <Divider />

            {/* School Type Filter */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                School Types
              </h3>
              <div className="flex flex-col gap-2">
                {schoolTypes.map((type) => {
                  const count = countSchoolsWithFilter((s) => {
                    if (
                      selectedCarriers.size > 0 &&
                      !selectedCarriers.has(s.properties.traeger)
                    )
                      return false;
                    if (
                      selectedDistricts.size > 0 &&
                      !selectedDistricts.has(s.properties.bezirk)
                    )
                      return false;
                    if (
                      showAfter4thGradeOnly &&
                      !s.properties.acceptsAfter4thGrade
                    )
                      return false;
                    return s.properties.schultyp === type;
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
                  const count = countSchoolsWithFilter((s) => {
                    if (
                      selectedSchoolTypes.size > 0 &&
                      !selectedSchoolTypes.has(s.properties.schultyp)
                    )
                      return false;
                    if (
                      selectedDistricts.size > 0 &&
                      !selectedDistricts.has(s.properties.bezirk)
                    )
                      return false;
                    if (
                      showAfter4thGradeOnly &&
                      !s.properties.acceptsAfter4thGrade
                    )
                      return false;
                    return s.properties.traeger === carrier;
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
                  const count = countSchoolsWithFilter((s) => {
                    if (
                      selectedSchoolTypes.size > 0 &&
                      !selectedSchoolTypes.has(s.properties.schultyp)
                    )
                      return false;
                    if (
                      selectedCarriers.size > 0 &&
                      !selectedCarriers.has(s.properties.traeger)
                    )
                      return false;
                    if (
                      showAfter4thGradeOnly &&
                      !s.properties.acceptsAfter4thGrade
                    )
                      return false;
                    return s.properties.bezirk === district;
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
                      const count = countSchoolsWithFilter((s) => {
                        if (
                          selectedSchoolTypes.size > 0 &&
                          !selectedSchoolTypes.has(s.properties.schultyp)
                        )
                          return false;
                        if (
                          selectedCarriers.size > 0 &&
                          !selectedCarriers.has(s.properties.traeger)
                        )
                          return false;
                        if (
                          selectedDistricts.size > 0 &&
                          !selectedDistricts.has(s.properties.bezirk)
                        )
                          return false;
                        if (
                          showAfter4thGradeOnly &&
                          !s.properties.acceptsAfter4thGrade
                        )
                          return false;
                        return schoolHasTag(s.id, tag.id);
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
                            color: selectedTags.has(tag.id)
                              ? "#fff"
                              : tag.color,
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
                    {countSchoolsWithFilter((s) => {
                      if (
                        selectedSchoolTypes.size > 0 &&
                        !selectedSchoolTypes.has(s.properties.schultyp)
                      )
                        return false;
                      if (
                        selectedCarriers.size > 0 &&
                        !selectedCarriers.has(s.properties.traeger)
                      )
                        return false;
                      if (
                        selectedDistricts.size > 0 &&
                        !selectedDistricts.has(s.properties.bezirk)
                      )
                        return false;
                      if (selectedTags.size > 0) {
                        const schoolTagIds = getSchoolTags(s.id).map(
                          (t) => t.id,
                        );
                        const hasAnySelectedTag = Array.from(selectedTags).some(
                          (tagId) => schoolTagIds.includes(tagId),
                        );
                        if (!hasAnySelectedTag) return false;
                      }
                      return s.properties.acceptsAfter4thGrade;
                    })}
                    )
                  </span>
                </div>
              </Checkbox>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
