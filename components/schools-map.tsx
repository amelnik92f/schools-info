"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import MapGL, {
  Marker,
  Popup,
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  MapRef,
} from "react-map-gl/maplibre";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Link } from "@heroui/link";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Checkbox } from "@heroui/checkbox";
import { Divider } from "@heroui/divider";
import {
  SchoolsGeoJSON,
  SchoolFeature,
  LocationType,
  ConstructionProject,
  ProjectStatusInfo,
} from "@/types";
import { getStandaloneProjects } from "@/lib/utils/enrich-schools";
import { useSchoolsMapStore } from "@/lib/store/schools-map-store";
import { useSchoolTagsStore } from "@/lib/store/school-tags-store";
import { useCustomLocationsStore } from "@/lib/store/custom-locations-store";
import "maplibre-gl/dist/maplibre-gl.css";

// Helper function to get project status
const getProjectStatus = (project: ConstructionProject): ProjectStatusInfo => {
  const dateStr = project.nutzungsuebergabe;
  const currentYear = 2025; // October 2025

  if (!dateStr || dateStr === "k.A.") {
    return { status: "unknown", isCompleted: false };
  }

  const years = dateStr.match(/\d{4}/g);
  if (years) {
    const completionYear = Math.max(...years.map((y) => parseInt(y)));

    if (completionYear < currentYear) {
      return {
        status: "completed",
        completionYear,
        isCompleted: true,
      };
    } else if (completionYear === currentYear) {
      return {
        status: "ongoing",
        completionYear,
        isCompleted: false,
      };
    } else {
      return {
        status: "future",
        completionYear,
        isCompleted: false,
      };
    }
  }

  return { status: "unknown", isCompleted: false };
};

// Helper to get status color
const getStatusColor = (
  status: ProjectStatusInfo["status"],
): "success" | "warning" | "primary" | "default" => {
  switch (status) {
    case "completed":
      return "success";
    case "ongoing":
      return "warning";
    case "future":
      return "primary";
    default:
      return "default";
  }
};

// Helper to get status label
const getStatusLabel = (statusInfo: ProjectStatusInfo): string => {
  switch (statusInfo.status) {
    case "completed":
      return `✅ Completed ${statusInfo.completionYear}`;
    case "ongoing":
      return `🏗️ In Progress ${statusInfo.completionYear}`;
    case "future":
      return `📅 Planned ${statusInfo.completionYear}`;
    default:
      return "❓ Status Unknown";
  }
};

interface SchoolsMapProps {
  schoolsData: SchoolsGeoJSON; // Already enriched with construction data
}

// School type colors for markers
const SCHOOL_TYPE_COLORS: Record<string, string> = {
  Grundschule: "#3b82f6", // blue
  Gymnasium: "#8b5cf6", // violet
  "Integrierte Sekundarschule": "#10b981", // green
  Oberstufenzentrum: "#f59e0b", // amber
  Gemeinschaftsschule: "#06b6d4", // cyan
  Förderschule: "#ec4899", // pink
  Berufsschule: "#f97316", // orange
  default: "#6366f1", // indigo
};

// Construction indicator color (stripes)
const CONSTRUCTION_STRIPE_COLOR = "#ffffff"; // white stripes for better visibility

export function SchoolsMap({ schoolsData }: SchoolsMapProps) {
  const mapRef = useRef<MapRef>(null);

  // Extract standalone construction projects from enriched data
  const standaloneProjects = useMemo(
    () => getStandaloneProjects(schoolsData),
    [schoolsData],
  );

  // Zustand store
  const {
    selectedSchool,
    setSelectedSchool,
    viewState,
    setViewState,
    searchQuery,
    setSearchQuery,
    selectedSchoolTypes,
    selectedCarriers,
    selectedDistricts,
    selectedTags,
    showFilters,
    setShowFilters,
    isSettingLocation,
    setIsSettingLocation,
    selectedCustomLocation,
    setSelectedCustomLocation,
    toggleSchoolType,
    toggleCarrier,
    toggleDistrict,
    toggleTag,
    clearAllFilters,
    hasActiveFilters,
  } = useSchoolsMapStore();

  // Tags store
  const {
    tags,
    isLoaded: tagsLoaded,
    toggleTagOnSchool,
    getSchoolTags,
    schoolHasTag,
    getUsedTags,
  } = useSchoolTagsStore();

  // Custom locations store
  const {
    locations,
    isLoaded: locationsLoaded,
    setLocation,
    removeLocation,
    hasLocation,
  } = useCustomLocationsStore();

  const mapStyle = "https://tiles.openfreemap.org/styles/bright"; // OSM Bright GL Style

  // State for selected construction project
  const [selectedProject, setSelectedProject] = useState<
    (ConstructionProject & { coordinates: [number, number] }) | null
  >(null);

  // State for geocoded construction projects (with coordinates)
  const [geocodedProjects, setGeocodedProjects] = useState<
    Array<ConstructionProject & { coordinates: [number, number] }>
  >([]);

  // Geocode construction projects using Nominatim (with caching and batching)
  useEffect(() => {
    const geocodeProjects = async () => {
      // Check if we have cached geocoded projects
      const cacheKey = "construction-projects-geocoded-v2"; // v2 to invalidate old cache
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        try {
          const cachedData = JSON.parse(cached);
          // Check if cache is still valid (24 hours) and matches current standalone projects
          if (
            cachedData.timestamp &&
            Date.now() - cachedData.timestamp < 24 * 60 * 60 * 1000 &&
            cachedData.projectCount === standaloneProjects.length
          ) {
            setGeocodedProjects(cachedData.projects);
            return;
          }
        } catch (e) {
          console.error("Failed to parse cached geocoded projects:", e);
        }
      }

      // Geocode in batches with rate limiting
      const projectsWithCoords: Array<
        ConstructionProject & { coordinates: [number, number] }
      > = [];

      // Process only first 100 standalone projects to avoid rate limits
      const projectsToGeocode = standaloneProjects.slice(0, 100);

      for (let i = 0; i < projectsToGeocode.length; i++) {
        const project = projectsToGeocode[i];
        try {
          // Use Nominatim to geocode the address
          const address = `${project.strasse}, ${project.plz} ${project.ort}`;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=de`,
            {
              headers: {
                "User-Agent": "Berlin Schools Map App",
              },
            },
          );

          if (response.ok) {
            const data = await response.json();
            if (data.length > 0) {
              projectsWithCoords.push({
                ...project,
                coordinates: [parseFloat(data[0].lon), parseFloat(data[0].lat)],
              });
            }
          }

          // Update progress incrementally
          if ((i + 1) % 10 === 0 || i === projectsToGeocode.length - 1) {
            setGeocodedProjects([...projectsWithCoords]);
          }

          // Add delay to respect Nominatim rate limits (1 request per second)
          await new Promise((resolve) => setTimeout(resolve, 1100));
        } catch (error) {
          console.error(`Failed to geocode project ${project.id}:`, error);
        }
      }

      // Cache the results
      try {
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            timestamp: Date.now(),
            projectCount: standaloneProjects.length,
            projects: projectsWithCoords,
          }),
        );
      } catch (e) {
        console.error("Failed to cache geocoded projects:", e);
      }
    };

    if (standaloneProjects.length > 0 && geocodedProjects.length === 0) {
      geocodeProjects();
    }
  }, [standaloneProjects, geocodedProjects.length]);

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

      return true;
    });
  }, [
    schoolsData.features,
    searchQuery,
    selectedSchoolTypes,
    selectedCarriers,
    selectedDistricts,
    selectedTags,
    getSchoolTags,
  ]);

  // Calculate bounds from school data
  const bounds = useMemo(() => {
    if (!schoolsData.bbox) return null;
    const [minLng, minLat, maxLng, maxLat] = schoolsData.bbox;
    return {
      minLng,
      minLat,
      maxLng,
      maxLat,
    };
  }, [schoolsData.bbox]);

  const getMarkerColor = (schoolType: string): string => {
    return SCHOOL_TYPE_COLORS[schoolType] || SCHOOL_TYPE_COLORS.default;
  };

  const handleMarkerClick = useCallback((school: SchoolFeature) => {
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
  }, []);

  const handleClosePopup = useCallback(() => {
    setSelectedSchool(null);
  }, []);

  const handleMapClick = useCallback(
    (event: any) => {
      if (isSettingLocation) {
        const { lngLat } = event;
        setLocation(isSettingLocation, [lngLat.lng, lngLat.lat]);
        setIsSettingLocation(null);
      }
    },
    [isSettingLocation, setLocation],
  );

  const handleCustomLocationClick = useCallback((type: LocationType) => {
    setSelectedCustomLocation(type);
  }, []);

  const handleCloseCustomLocationPopup = useCallback(() => {
    setSelectedCustomLocation(null);
  }, []);

  const getLocationIcon = (type: LocationType): string => {
    return type === "home" ? "🏠" : "💼";
  };

  const getLocationLabel = (type: LocationType): string => {
    return type === "home" ? "Home" : "Work";
  };

  return (
    <Card className="bg-content1 shadow-medium overflow-hidden">
      <CardBody className="p-0">
        {/* Filter Panel */}
        <div className="border-b border-divider">
          <div className="p-4">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-foreground">
                  🔍 Filters
                </span>
                <Chip size="sm" variant="flat" color="primary">
                  {filteredSchools.length} / {schoolsData.features.length}{" "}
                  schools
                </Chip>
                {geocodedProjects.length > 0 && (
                  <Chip size="sm" variant="flat" color="warning">
                    🏗️ {geocodedProjects.length} Construction projects
                  </Chip>
                )}
              </div>
              <div className="flex items-center gap-2">
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
                <Button
                  size="sm"
                  variant="flat"
                  onPress={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? "Hide" : "Show"} Filters
                </Button>
              </div>
            </div>

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
                        // If location exists, fly to it
                        const loc = locations.home;
                        if (loc && mapRef.current) {
                          mapRef.current.flyTo({
                            center: loc.coordinates,
                            zoom: 14,
                            duration: 1000,
                          });
                        }
                      } else {
                        // Start setting location
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
                        // If location exists, fly to it
                        const loc = locations.work;
                        if (loc && mapRef.current) {
                          mapRef.current.flyTo({
                            center: loc.coordinates,
                            zoom: 14,
                            duration: 1000,
                          });
                        }
                      } else {
                        // Start setting location
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

            {/* Search Input */}
            <Input
              placeholder="Search by school name, street, or district..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              isClearable
              startContent={
                <span className="text-default-400 text-lg">🔎</span>
              }
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {schoolTypes.map((type) => {
                      // Count based on other active filters (excluding school type)
                      const count = schoolsData.features.filter((s) => {
                        // Apply search filter
                        if (searchQuery) {
                          const query = searchQuery.toLowerCase();
                          const matchesSearch =
                            s.properties.schulname
                              .toLowerCase()
                              .includes(query) ||
                            s.properties.strasse
                              .toLowerCase()
                              .includes(query) ||
                            s.properties.bezirk.toLowerCase().includes(query);
                          if (!matchesSearch) return false;
                        }
                        // Apply carrier filter
                        if (
                          selectedCarriers.size > 0 &&
                          !selectedCarriers.has(s.properties.traeger)
                        ) {
                          return false;
                        }
                        // Apply district filter
                        if (
                          selectedDistricts.size > 0 &&
                          !selectedDistricts.has(s.properties.bezirk)
                        ) {
                          return false;
                        }
                        // Check if this is the current type
                        return s.properties.schultyp === type;
                      }).length;
                      return (
                        <Checkbox
                          key={type}
                          size="sm"
                          isSelected={selectedSchoolTypes.has(type)}
                          onValueChange={() => toggleSchoolType(type)}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: getMarkerColor(type),
                              }}
                            />
                            <span className="text-xs text-default-700">
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
                      // Count based on other active filters (excluding carrier)
                      const count = schoolsData.features.filter((s) => {
                        // Apply search filter
                        if (searchQuery) {
                          const query = searchQuery.toLowerCase();
                          const matchesSearch =
                            s.properties.schulname
                              .toLowerCase()
                              .includes(query) ||
                            s.properties.strasse
                              .toLowerCase()
                              .includes(query) ||
                            s.properties.bezirk.toLowerCase().includes(query);
                          if (!matchesSearch) return false;
                        }
                        // Apply school type filter
                        if (
                          selectedSchoolTypes.size > 0 &&
                          !selectedSchoolTypes.has(s.properties.schultyp)
                        ) {
                          return false;
                        }
                        // Apply district filter
                        if (
                          selectedDistricts.size > 0 &&
                          !selectedDistricts.has(s.properties.bezirk)
                        ) {
                          return false;
                        }
                        // Check if this is the current carrier
                        return s.properties.traeger === carrier;
                      }).length;
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
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {districts.map((district) => {
                      // Count based on other active filters (excluding district)
                      const count = schoolsData.features.filter((s) => {
                        // Apply search filter
                        if (searchQuery) {
                          const query = searchQuery.toLowerCase();
                          const matchesSearch =
                            s.properties.schulname
                              .toLowerCase()
                              .includes(query) ||
                            s.properties.strasse
                              .toLowerCase()
                              .includes(query) ||
                            s.properties.bezirk.toLowerCase().includes(query);
                          if (!matchesSearch) return false;
                        }
                        // Apply school type filter
                        if (
                          selectedSchoolTypes.size > 0 &&
                          !selectedSchoolTypes.has(s.properties.schultyp)
                        ) {
                          return false;
                        }
                        // Apply carrier filter
                        if (
                          selectedCarriers.size > 0 &&
                          !selectedCarriers.has(s.properties.traeger)
                        ) {
                          return false;
                        }
                        // Check if this is the current district
                        return s.properties.bezirk === district;
                      }).length;
                      return (
                        <Checkbox
                          key={district}
                          size="sm"
                          isSelected={selectedDistricts.has(district)}
                          onValueChange={() => toggleDistrict(district)}
                        >
                          <span className="text-xs text-default-700">
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
                          // Count schools with this tag
                          const count = schoolsData.features.filter((s) => {
                            // Apply search filter
                            if (searchQuery) {
                              const query = searchQuery.toLowerCase();
                              const matchesSearch =
                                s.properties.schulname
                                  .toLowerCase()
                                  .includes(query) ||
                                s.properties.strasse
                                  .toLowerCase()
                                  .includes(query) ||
                                s.properties.bezirk
                                  .toLowerCase()
                                  .includes(query);
                              if (!matchesSearch) return false;
                            }
                            // Apply school type filter
                            if (
                              selectedSchoolTypes.size > 0 &&
                              !selectedSchoolTypes.has(s.properties.schultyp)
                            ) {
                              return false;
                            }
                            // Apply carrier filter
                            if (
                              selectedCarriers.size > 0 &&
                              !selectedCarriers.has(s.properties.traeger)
                            ) {
                              return false;
                            }
                            // Apply district filter
                            if (
                              selectedDistricts.size > 0 &&
                              !selectedDistricts.has(s.properties.bezirk)
                            ) {
                              return false;
                            }
                            // Check if this school has the current tag
                            return schoolHasTag(s.id, tag.id);
                          }).length;

                          return (
                            <Chip
                              key={tag.id}
                              size="sm"
                              variant={
                                selectedTags.has(tag.id) ? "solid" : "flat"
                              }
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
              </div>
            )}
          </div>
        </div>
        <div className="relative w-full h-[600px]">
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
              <Marker
                longitude={locations.home.coordinates[0]}
                latitude={locations.home.coordinates[1]}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  handleCustomLocationClick("home");
                }}
              >
                <div
                  className="cursor-pointer transition-all hover:scale-110 flex items-center justify-center"
                  style={{
                    width: "40px",
                    height: "40px",
                    fontSize: "32px",
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                  }}
                >
                  🏠
                </div>
              </Marker>
            )}

            {locationsLoaded && locations.work && (
              <Marker
                longitude={locations.work.coordinates[0]}
                latitude={locations.work.coordinates[1]}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  handleCustomLocationClick("work");
                }}
              >
                <div
                  className="cursor-pointer transition-all hover:scale-110 flex items-center justify-center"
                  style={{
                    width: "40px",
                    height: "40px",
                    fontSize: "32px",
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                  }}
                >
                  💼
                </div>
              </Marker>
            )}

            {/* School Markers */}
            {filteredSchools.map((school) => {
              const [lng, lat] = school.geometry.coordinates;
              const color = getMarkerColor(school.properties.schultyp);
              const isSelected = selectedSchool?.id === school.id;
              const schoolTags = getSchoolTags(school.id);
              const hasTag = schoolTags.length > 0;
              const primaryTag = schoolTags[0]; // Use first tag for color accent

              return (
                <Marker
                  key={school.id}
                  longitude={lng}
                  latitude={lat}
                  anchor="bottom"
                  onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    handleMarkerClick(school);
                  }}
                >
                  <div
                    className={`cursor-pointer transition-all ${
                      isSelected ? "scale-125" : "hover:scale-110"
                    }`}
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50% 50% 50% 0",
                      backgroundColor: color,
                      border: isSelected
                        ? "3px solid #fff"
                        : hasTag
                          ? `3px solid ${primaryTag.color}`
                          : "2px solid white",
                      transform: "rotate(-45deg)",
                      boxShadow: isSelected
                        ? "0 0 0 4px rgba(59, 130, 246, 0.5), 0 4px 8px rgba(0,0,0,0.4)"
                        : hasTag
                          ? `0 0 0 2px ${primaryTag.color}, 0 2px 4px rgba(0,0,0,0.3)`
                          : "0 2px 4px rgba(0,0,0,0.3)",
                    }}
                  />
                </Marker>
              );
            })}

            {/* Construction Project Markers */}
            {geocodedProjects
              .filter((project) => {
                // Apply search query filter
                if (searchQuery) {
                  const query = searchQuery.toLowerCase();
                  const matchesSearch =
                    project.schulname.toLowerCase().includes(query) ||
                    project.strasse.toLowerCase().includes(query) ||
                    project.bezirk.toLowerCase().includes(query);
                  if (!matchesSearch) return false;
                }

                // Apply school type filter
                if (
                  selectedSchoolTypes.size > 0 &&
                  !selectedSchoolTypes.has(project.schulart)
                ) {
                  return false;
                }

                // Apply district filter
                if (
                  selectedDistricts.size > 0 &&
                  !selectedDistricts.has(project.bezirk)
                ) {
                  return false;
                }

                // Note: Construction projects don't have carrier (traeger) info
                // so we don't filter by carrier

                return true;
              })
              .map((project) => {
                const [lng, lat] = project.coordinates;
                const isSelected = selectedProject?.id === project.id;
                // Get color based on school type, default to indigo if not found
                const color = getMarkerColor(project.schulart);

                return (
                  <Marker
                    key={`construction-${project.id}`}
                    longitude={lng}
                    latitude={lat}
                    anchor="bottom"
                    onClick={(e) => {
                      e.originalEvent.stopPropagation();
                      setSelectedProject(project);
                      setSelectedSchool(null); // Deselect school if any

                      // Fly to the selected project
                      const latOffset = 0.01;
                      if (mapRef.current) {
                        mapRef.current.flyTo({
                          center: [lng, lat - latOffset],
                          zoom: Math.max(mapRef.current.getZoom(), 13),
                          duration: 1000,
                          essential: true,
                        });
                      }
                    }}
                  >
                    <div
                      className={`cursor-pointer transition-all ${
                        isSelected ? "scale-125" : "hover:scale-110"
                      }`}
                      style={{
                        position: "relative",
                        width: "28px",
                        height: "28px",
                      }}
                    >
                      {/* Main marker (teardrop) with striped overlay */}
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50% 50% 50% 0",
                          backgroundColor: color,
                          border: isSelected
                            ? "3px solid #fff"
                            : "2px solid white",
                          transform: "rotate(-45deg)",
                          boxShadow: isSelected
                            ? "0 0 0 4px rgba(251, 191, 36, 0.5), 0 4px 8px rgba(0,0,0,0.4)"
                            : "0 2px 4px rgba(0,0,0,0.3)",
                          overflow: "hidden",
                          position: "relative",
                        }}
                      >
                        {/* Diagonal stripes overlay */}
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundImage: `repeating-linear-gradient(
                              45deg,
                              ${CONSTRUCTION_STRIPE_COLOR}66,
                              ${CONSTRUCTION_STRIPE_COLOR}66 2px,
                              transparent 2px,
                              transparent 5px
                            )`,
                            pointerEvents: "none",
                          }}
                        />
                      </div>
                    </div>
                  </Marker>
                );
              })}

            {/* Popup for selected school */}
            {selectedSchool && (
              <Popup
                longitude={selectedSchool.geometry.coordinates[0]}
                latitude={selectedSchool.geometry.coordinates[1]}
                anchor="top"
                offset={10}
                onClose={handleClosePopup}
                closeButton={true}
                closeOnClick={false}
                className="school-popup"
                maxWidth="400px"
              >
                <div className="p-3 min-w-[280px]">
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {selectedSchool.properties.schulname}
                  </h3>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <Chip
                      size="sm"
                      variant="flat"
                      style={{
                        backgroundColor: `${getMarkerColor(selectedSchool.properties.schultyp)}20`,
                        color: getMarkerColor(
                          selectedSchool.properties.schultyp,
                        ),
                      }}
                    >
                      {selectedSchool.properties.schultyp}
                    </Chip>
                    <Chip size="sm" variant="flat" color="default">
                      {selectedSchool.properties.traeger}
                    </Chip>
                  </div>

                  <div className="space-y-2 text-sm text-default-700">
                    <div className="flex items-start gap-2">
                      <span className="text-base">📍</span>
                      <span>
                        {selectedSchool.properties.strasse}{" "}
                        {selectedSchool.properties.hausnr}
                        <br />
                        {selectedSchool.properties.plz} Berlin,{" "}
                        {selectedSchool.properties.bezirk}
                      </span>
                    </div>

                    {selectedSchool.properties.telefon && (
                      <div className="flex items-center gap-2">
                        <span className="text-base">📞</span>
                        <span>{selectedSchool.properties.telefon}</span>
                      </div>
                    )}

                    {selectedSchool.properties.email && (
                      <div className="flex items-center gap-2">
                        <span className="text-base">✉️</span>
                        <Link
                          href={`mailto:${selectedSchool.properties.email}`}
                          size="sm"
                          className="text-primary"
                        >
                          {selectedSchool.properties.email}
                        </Link>
                      </div>
                    )}

                    {selectedSchool.properties.internet && (
                      <div className="flex items-center gap-2">
                        <span className="text-base">🌐</span>
                        <Link
                          href={selectedSchool.properties.internet}
                          isExternal
                          size="sm"
                          className="text-primary break-all"
                        >
                          {selectedSchool.properties.internet}
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Construction History Section */}
                  {selectedSchool.properties.constructionHistory &&
                    selectedSchool.properties.constructionHistory.length > 0 && (
                      <>
                        <Divider className="my-3" />
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-semibold text-foreground">
                              🏗️ Construction History
                            </span>
                          </div>
                          <div className="space-y-2">
                            {selectedSchool.properties.constructionHistory.map(
                              (project) => {
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
                              },
                            )}
                          </div>
                        </div>
                      </>
                    )}

                  {/* Tags Section */}
                  {tagsLoaded && (
                    <>
                      <Divider className="my-3" />
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold text-foreground">
                            🏷️ Tags
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag) => {
                            const isActive = schoolHasTag(
                              selectedSchool.id,
                              tag.id,
                            );
                            return (
                              <Chip
                                key={tag.id}
                                size="sm"
                                variant={isActive ? "solid" : "bordered"}
                                style={{
                                  backgroundColor: isActive
                                    ? tag.color
                                    : "transparent",
                                  borderColor: tag.color,
                                  color: isActive ? "#fff" : tag.color,
                                  cursor: "pointer",
                                }}
                                onClick={() =>
                                  toggleTagOnSchool(selectedSchool.id, tag.id)
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
              </Popup>
            )}

            {/* Custom Location Popups */}
            {selectedCustomLocation && locations[selectedCustomLocation] && (
              <Popup
                longitude={locations[selectedCustomLocation].coordinates[0]}
                latitude={locations[selectedCustomLocation].coordinates[1]}
                anchor="top"
                offset={20}
                onClose={handleCloseCustomLocationPopup}
                closeButton={true}
                closeOnClick={false}
                maxWidth="300px"
              >
                <div className="p-3 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-3xl">
                      {getLocationIcon(selectedCustomLocation)}
                    </span>
                    <h3 className="text-lg font-bold text-foreground">
                      {getLocationLabel(selectedCustomLocation)}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-default-700">
                      📍 Location saved
                    </p>
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      fullWidth
                      onPress={() => {
                        removeLocation(selectedCustomLocation);
                        handleCloseCustomLocationPopup();
                      }}
                    >
                      Remove Location
                    </Button>
                  </div>
                </div>
              </Popup>
            )}

            {/* Popup for selected construction project */}
            {selectedProject && (
              <Popup
                longitude={selectedProject.coordinates[0]}
                latitude={selectedProject.coordinates[1]}
                anchor="top"
                offset={15}
                onClose={() => setSelectedProject(null)}
                closeButton={true}
                closeOnClick={false}
                className="construction-popup"
                maxWidth="450px"
              >
                <div className="p-4 min-w-[320px]">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">🏗️</span>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground">
                        {selectedProject.schulname}
                      </h3>
                      <div className="flex gap-2 mt-1">
                        <Chip size="sm" variant="flat" color="warning">
                          Construction Project
                        </Chip>
                        <Chip
                          size="sm"
                          variant="flat"
                          color={getStatusColor(
                            getProjectStatus(selectedProject).status,
                          )}
                        >
                          {getStatusLabel(getProjectStatus(selectedProject))}
                        </Chip>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-default-700">
                    <div>
                      <span className="font-semibold text-foreground">
                        📍 Location:
                      </span>
                      <p className="mt-1">
                        {selectedProject.strasse}
                        <br />
                        {selectedProject.plz} {selectedProject.ort},{" "}
                        {selectedProject.bezirk}
                      </p>
                    </div>

                    <Divider />

                    <div>
                      <span className="font-semibold text-foreground">
                        🏫 School Type:
                      </span>
                      <p className="mt-1">{selectedProject.schulart}</p>
                    </div>

                    <div>
                      <span className="font-semibold text-foreground">
                        🔨 Construction Type:
                      </span>
                      <p className="mt-1">{selectedProject.baumassnahme}</p>
                    </div>

                    <div>
                      <span className="font-semibold text-foreground">
                        📝 Description:
                      </span>
                      <p className="mt-1 leading-relaxed">
                        {selectedProject.beschreibung}
                      </p>
                    </div>

                    {selectedProject.nutzungsuebergabe && (
                      <div>
                        <span className="font-semibold text-foreground">
                          📅 Expected Completion:
                        </span>
                        <p className="mt-1">
                          {selectedProject.nutzungsuebergabe}
                        </p>
                      </div>
                    )}

                    {selectedProject.gesamtkosten && (
                      <div>
                        <span className="font-semibold text-foreground">
                          💰 Total Cost:
                        </span>
                        <p className="mt-1">{selectedProject.gesamtkosten}</p>
                      </div>
                    )}

                    {(selectedProject.schulplaetze_nach_baumassnahme !==
                      "k.A." ||
                      selectedProject.zuegigkeit_nach_baumassnahme !==
                        "k.A.") && (
                      <>
                        <Divider />
                        <div>
                          <span className="font-semibold text-foreground">
                            📊 Capacity After Construction:
                          </span>
                          {selectedProject.schulplaetze_nach_baumassnahme !==
                            "k.A." && (
                            <p className="mt-1">
                              Places:{" "}
                              {selectedProject.schulplaetze_nach_baumassnahme}
                            </p>
                          )}
                          {selectedProject.zuegigkeit_nach_baumassnahme !==
                            "k.A." && (
                            <p className="mt-1">
                              Tracks:{" "}
                              {selectedProject.zuegigkeit_nach_baumassnahme}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Popup>
            )}
          </MapGL>
        </div>

        {/* Legend */}
        <div className="p-4 bg-content2 border-t border-divider">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-foreground">
              Legend:
            </span>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-default-500 mb-2">School Types:</p>
              <div className="flex flex-wrap gap-3">
                {Object.entries(SCHOOL_TYPE_COLORS)
                  .filter(([type]) => type !== "default")
                  .map(([type, color]) => (
                    <div key={type} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full border border-white"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs text-default-600">{type}</span>
                    </div>
                  ))}
              </div>
            </div>
            <Divider />
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <div style={{ position: "relative", width: "16px", height: "16px" }}>
                  <div
                    className="border-2 border-white"
                    style={{
                      width: "16px",
                      height: "16px",
                      backgroundColor: "#6366f1",
                      borderRadius: "50% 50% 50% 0",
                      transform: "rotate(-45deg)",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    {/* Diagonal stripes */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `repeating-linear-gradient(
                          45deg,
                          ${CONSTRUCTION_STRIPE_COLOR}66,
                          ${CONSTRUCTION_STRIPE_COLOR}66 2px,
                          transparent 2px,
                          transparent 5px
                        )`,
                      }}
                    />
                  </div>
                </div>
                <span className="text-xs text-default-600">
                  Construction Project
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🏠</span>
                <span className="text-xs text-default-600">Home Location</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">💼</span>
                <span className="text-xs text-default-600">Work Location</span>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
