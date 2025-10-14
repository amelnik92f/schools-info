"use client";

import { useCallback, useMemo, useRef } from "react";
import MapGL, {
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  MapRef,
} from "react-map-gl/maplibre";
import clsx from "clsx";

import { FilterPanel } from "./schools-map/FilterPanel";
import { SchoolMarker } from "./schools-map/SchoolMarker";
import { SchoolDetailsPanel } from "./schools-map/SchoolDetailsPanel";
import { CustomLocationMarker } from "./schools-map/CustomLocationMarker";
import { CustomLocationPopup } from "./schools-map/CustomLocationPopup";

import { useCustomLocationsStore } from "@/lib/store/custom-locations-store";
import { useSchoolTagsStore } from "@/lib/store/school-tags-store";
import { useSchoolsMapStore } from "@/lib/store/schools-map-store";
import { EnrichedSchool, ConstructionProject, LocationType } from "@/types";
import "maplibre-gl/dist/maplibre-gl.css";

interface SchoolsMapProps {
  schools: EnrichedSchool[];
  standaloneProjects: ConstructionProject[];
}

export function SchoolsMap({ schools, standaloneProjects }: SchoolsMapProps) {
  const mapRef = useRef<MapRef>(null);

  // Zustand store
  const {
    selectedSchool,
    setSelectedSchool,
    viewState,
    setViewState,
    searchQuery,
    selectedSchoolTypes,
    selectedCarriers,
    selectedDistricts,
    selectedTags,
    showAfter4thGradeOnly,
    isSettingLocation,
    setIsSettingLocation,
    selectedCustomLocation,
    setSelectedCustomLocation,
    showFilters,
    setShowFilters,
  } = useSchoolsMapStore();

  // Tags store
  const { getSchoolTags } = useSchoolTagsStore();

  // Custom locations store
  const {
    locations,
    isLoaded: locationsLoaded,
    setLocation,
    removeLocation,
  } = useCustomLocationsStore();

  const mapStyle = "https://tiles.openfreemap.org/styles/bright"; // OSM Bright GL Style

  // Combine schools and standalone projects
  const allItems = useMemo(() => {
    return [...schools, ...standaloneProjects];
  }, [schools, standaloneProjects]);

  // Filter schools based on all criteria
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      // Determine if it's a school or standalone project
      const isSchool = "school" in item;
      const school = isSchool ? (item as EnrichedSchool).school : null;
      const project = !isSchool ? (item as ConstructionProject) : null;

      const name = school?.name || project?.school_name || "";
      const street = school?.street || project?.street || "";
      const district = school?.district || project?.district || "";
      const schoolType = school?.school_category || project?.school_type || "";
      const operator = school?.operator || "öffentlich";
      const acceptsAfter4th = isSchool
        ? (item as EnrichedSchool).details?.available_after_4th_grade || false
        : false;

      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          name.toLowerCase().includes(query) ||
          street.toLowerCase().includes(query) ||
          district.toLowerCase().includes(query);

        if (!matchesSearch) return false;
      }

      // School type filter
      if (
        selectedSchoolTypes.size > 0 &&
        !selectedSchoolTypes.has(schoolType)
      ) {
        return false;
      }

      // Carrier filter
      if (selectedCarriers.size > 0 && !selectedCarriers.has(operator)) {
        return false;
      }

      // District filter
      if (selectedDistricts.size > 0 && !selectedDistricts.has(district)) {
        return false;
      }

      // Tag filter (only for schools)
      if (selectedTags.size > 0 && isSchool) {
        const schoolNumber = school?.school_number || "";
        const schoolTagIds = getSchoolTags(`schulen.${schoolNumber}`).map(
          (t) => t.id,
        );
        const hasAnySelectedTag = Array.from(selectedTags).some((tagId) =>
          schoolTagIds.includes(tagId),
        );

        if (!hasAnySelectedTag) return false;
      }

      // After 4th grade filter (only for schools)
      if (showAfter4thGradeOnly && !acceptsAfter4th) {
        return false;
      }

      return true;
    });
  }, [
    allItems,
    searchQuery,
    selectedSchoolTypes,
    selectedCarriers,
    selectedDistricts,
    selectedTags,
    showAfter4thGradeOnly,
    getSchoolTags,
  ]);

  const handleMarkerClick = useCallback(
    (item: EnrichedSchool | ConstructionProject) => {
      setSelectedSchool(item);
      // Close filter panel on mobile when selecting a school
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        setShowFilters(false);
      }
    },
    [setSelectedSchool, setShowFilters],
  );

  const handleClosePopup = useCallback(() => {
    setSelectedSchool(null);
  }, [setSelectedSchool]);

  const handleMapClick = useCallback(
    (event: any) => {
      if (isSettingLocation) {
        const { lngLat } = event;

        setLocation(isSettingLocation, [lngLat.lng, lngLat.lat]);
        setIsSettingLocation(null);
      }
    },
    [isSettingLocation, setLocation, setIsSettingLocation],
  );

  const handleCustomLocationClick = useCallback(
    (type: LocationType) => {
      setSelectedCustomLocation(type);
    },
    [setSelectedCustomLocation],
  );

  const handleCloseCustomLocationPopup = useCallback(() => {
    setSelectedCustomLocation(null);
  }, [setSelectedCustomLocation]);

  return (
    <>
      {/* Left Sidebar with Filters */}
      <div
        className={clsx(
          "w-full md:w-96 flex flex-col bg-content1 border-r border-divider",
          "md:relative md:translate-x-0",
          "fixed inset-y-0 left-0 z-40 transition-transform duration-300",
          showFilters ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-divider">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏫</span>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Berlin Schools
                </h1>
                <p className="text-sm text-default-500">
                  Find a school in your district
                </p>
              </div>
            </div>
            {/* Close button - only on mobile */}
            <button
              aria-label="Close filters"
              className="md:hidden p-2 rounded-lg hover:bg-default-100 transition-colors"
              onClick={() => setShowFilters(false)}
            >
              <span className="text-xl">✕</span>
            </button>
          </div>
        </div>

        {/* Filter Panel - scrollable */}
        <div className="flex-1 overflow-y-auto">
          <FilterPanel
            filteredItemsCount={filteredItems.length}
            mapRef={mapRef}
            schools={schools}
            standaloneProjects={standaloneProjects}
          />
        </div>
      </div>

      {/* School Details Panel (if school selected) */}
      {selectedSchool && (
        <div
          className={clsx(
            "w-full md:w-96 flex flex-col",
            "md:relative md:translate-x-0",
            "fixed inset-y-0 right-0 z-40 transition-transform duration-300",
          )}
        >
          <SchoolDetailsPanel
            item={selectedSchool}
            onClose={handleClosePopup}
          />
        </div>
      )}

      {/* Map on Right Side */}
      <div className="flex-1 relative">
        {/* Mobile Filter Toggle Button */}
        <button
          aria-label="Open filters"
          className="md:hidden absolute top-4 left-4 z-20 p-3 rounded-lg bg-content1 shadow-lg border border-divider hover:bg-content2 transition-colors"
          onClick={() => setShowFilters(true)}
        >
          <span className="text-xl">☰</span>
        </button>
        <MapGL
          ref={mapRef}
          {...viewState}
          attributionControl={{ compact: true }}
          cursor={isSettingLocation ? "crosshair" : "grab"}
          mapStyle={mapStyle}
          style={{ width: "100%", height: "100%" }}
          onClick={handleMapClick}
          onMove={(evt) => setViewState(evt.viewState)}
        >
          {/* Map Controls */}
          <NavigationControl position="top-right" />
          <FullscreenControl position="top-right" />
          <ScaleControl position="bottom-left" />

          {/* Custom Location Markers */}
          {locationsLoaded && locations.home && (
            <CustomLocationMarker
              coordinates={locations.home.coordinates}
              type="home"
              onClick={handleCustomLocationClick}
            />
          )}

          {locationsLoaded && locations.work && (
            <CustomLocationMarker
              coordinates={locations.work.coordinates}
              type="work"
              onClick={handleCustomLocationClick}
            />
          )}

          {/* School and Construction Project Markers */}
          {filteredItems.map((item) => {
            const isSchool = "school" in item;
            const school = isSchool ? (item as EnrichedSchool).school : null;
            const project = !isSchool ? (item as ConstructionProject) : null;
            const id = school
              ? `schulen.${school.school_number}`
              : `construction.${project?.id}`;
            const latitude = school?.latitude || project?.latitude || 0;
            const longitude = school?.longitude || project?.longitude || 0;

            return (
              <SchoolMarker
                key={id}
                isSelected={
                  isSchool
                    ? (selectedSchool as any)?.school?.school_number ===
                      school?.school_number
                    : (selectedSchool as any)?.id === project?.id
                }
                item={item}
                onClick={handleMarkerClick}
              />
            );
          })}

          {/* Custom Location Popups */}
          {selectedCustomLocation && locations[selectedCustomLocation] && (
            <CustomLocationPopup
              coordinates={locations[selectedCustomLocation].coordinates}
              type={selectedCustomLocation}
              onClose={handleCloseCustomLocationPopup}
              onRemove={removeLocation}
            />
          )}
        </MapGL>
      </div>
    </>
  );
}
