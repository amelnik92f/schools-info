"use client";

import { useCallback, useMemo, useRef } from "react";
import MapGL, {
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  MapRef,
} from "react-map-gl/maplibre";
import { Card, CardBody } from "@heroui/card";
import { SchoolsGeoJSON, SchoolFeature, LocationType } from "@/types";
import { useSchoolsMapStore } from "@/lib/store/schools-map-store";
import { useSchoolTagsStore } from "@/lib/store/school-tags-store";
import { useCustomLocationsStore } from "@/lib/store/custom-locations-store";
import { FilterPanel } from "./schools-map/FilterPanel";
import { SchoolMarker } from "./schools-map/SchoolMarker";
import { SchoolPopup } from "./schools-map/SchoolPopup";
import { CustomLocationMarker } from "./schools-map/CustomLocationMarker";
import { CustomLocationPopup } from "./schools-map/CustomLocationPopup";
import { MapLegend } from "./schools-map/MapLegend";
import "maplibre-gl/dist/maplibre-gl.css";

interface SchoolsMapProps {
  schoolsData: SchoolsGeoJSON; // Already enriched with construction data
}

export function SchoolsMap({ schoolsData }: SchoolsMapProps) {
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

  // Filter schools based on all criteria
  const filteredSchools = useMemo(() => {
    return schoolsData.features.filter((school) => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          school.properties.schulname.toLowerCase().includes(query) ||
          school.properties.strasse.toLowerCase().includes(query) ||
          school.properties.bezirk.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // School type filter
      if (
        selectedSchoolTypes.size > 0 &&
        !selectedSchoolTypes.has(school.properties.schultyp)
      ) {
        return false;
      }

      // Carrier filter
      if (
        selectedCarriers.size > 0 &&
        !selectedCarriers.has(school.properties.traeger)
      ) {
        return false;
      }

      // District filter
      if (
        selectedDistricts.size > 0 &&
        !selectedDistricts.has(school.properties.bezirk)
      ) {
        return false;
      }

      // Tag filter
      if (selectedTags.size > 0) {
        const schoolTagIds = getSchoolTags(school.id).map((t) => t.id);
        const hasAnySelectedTag = Array.from(selectedTags).some((tagId) =>
          schoolTagIds.includes(tagId),
        );
        if (!hasAnySelectedTag) return false;
      }

      // After 4th grade filter
      if (showAfter4thGradeOnly && !school.properties.acceptsAfter4thGrade) {
        return false;
      }

      return true;
    });
  }, [
    schoolsData.features,
    searchQuery,
    selectedSchoolTypes,
    selectedCarriers,
    selectedDistricts,
    selectedTags,
    showAfter4thGradeOnly,
    getSchoolTags,
  ]);

  const handleMarkerClick = useCallback(
    (school: SchoolFeature) => {
      setSelectedSchool(school);

      // Smoothly fly to the selected school with animation
      const [lng, lat] = school.geometry.coordinates;
      const latOffset = 0.01; // Offset to position popup nicely

      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [lng, lat - latOffset],
          zoom: Math.max(mapRef.current.getZoom(), 13),
          duration: 1000, // 1 second animation
          essential: true,
        });
      }
    },
    [setSelectedSchool],
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
      {/* Left Sidebar */}
      <div className="w-96 flex flex-col bg-content1 border-r border-divider overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-divider">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏫</span>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Berlin Schools
              </h1>
              <p className="text-sm text-default-500">
                Making school search in Berlin easier
              </p>
            </div>
          </div>
        </div>

        {/* Filter Panel and Legend */}
        <FilterPanel
          schoolsData={schoolsData}
          filteredSchoolsCount={filteredSchools.length}
          mapRef={mapRef}
        />
        {/*<MapLegend />*/}
      </div>

      {/* Map on Right Side */}
      <div className="flex-1 relative">
        <MapGL
          ref={mapRef}
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          onClick={handleMapClick}
          style={{ width: "100%", height: "100%" }}
          mapStyle={mapStyle}
          attributionControl={{ compact: true }}
          cursor={isSettingLocation ? "crosshair" : "grab"}
        >
          {/* Map Controls */}
          <NavigationControl position="top-right" />
          <FullscreenControl position="top-right" />
          <ScaleControl position="bottom-left" />

          {/* Custom Location Markers */}
          {locationsLoaded && locations.home && (
            <CustomLocationMarker
              type="home"
              coordinates={locations.home.coordinates}
              onClick={handleCustomLocationClick}
            />
          )}

          {locationsLoaded && locations.work && (
            <CustomLocationMarker
              type="work"
              coordinates={locations.work.coordinates}
              onClick={handleCustomLocationClick}
            />
          )}

          {/* School and Construction Project Markers */}
          {filteredSchools.map((school) => (
            <SchoolMarker
              key={school.id}
              school={school}
              isSelected={selectedSchool?.id === school.id}
              onClick={handleMarkerClick}
            />
          ))}

          {/* Popup for selected school */}
          {selectedSchool && (
            <SchoolPopup school={selectedSchool} onClose={handleClosePopup} />
          )}

          {/* Custom Location Popups */}
          {selectedCustomLocation && locations[selectedCustomLocation] && (
            <CustomLocationPopup
              type={selectedCustomLocation}
              coordinates={locations[selectedCustomLocation].coordinates}
              onClose={handleCloseCustomLocationPopup}
              onRemove={removeLocation}
            />
          )}
        </MapGL>
      </div>
    </>
  );
}
