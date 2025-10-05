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
import { Spinner } from "@heroui/spinner";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import {
  SchoolsGeoJSON,
  SchoolFeature,
  LocationType,
  ConstructionProject,
  ProjectStatusInfo,
} from "@/types";
import { useSchoolsMapStore } from "@/lib/store/schools-map-store";
import { useSchoolTagsStore } from "@/lib/store/school-tags-store";
import { useCustomLocationsStore } from "@/lib/store/custom-locations-store";
import { SparklesIcon } from "@/components/icons";
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

  // AI Summary state
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

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
    setAiSummary(null);
    setSummaryError(null);
  }, []);

  // Load AI summary from localStorage when school is selected
  useEffect(() => {
    if (selectedSchool && !selectedSchool.properties.isConstructionProject) {
      const storageKey = `ai-summary-${selectedSchool.properties.bsn}`;
      try {
        const cachedSummary = localStorage.getItem(storageKey);
        if (cachedSummary) {
          setAiSummary(cachedSummary);
        } else {
          setAiSummary(null);
        }
      } catch (error) {
        console.error("Error loading cached summary:", error);
      }
    } else {
      setAiSummary(null);
    }
    setSummaryError(null);
  }, [selectedSchool]);

  // Function to fetch AI summary
  const handleSummarizeSchool = async () => {
    if (!selectedSchool) return;

    setIsLoadingSummary(true);
    setSummaryError(null);

    try {
      const response = await fetch("/api/summarize-school", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          schoolName: selectedSchool.properties.schulname,
          schoolType: selectedSchool.properties.schultyp,
          address: `${selectedSchool.properties.strasse} ${selectedSchool.properties.hausnr}, ${selectedSchool.properties.plz} Berlin`,
          website: selectedSchool.properties.internet,
          bezirk: selectedSchool.properties.bezirk,
          stats: selectedSchool.properties.stats,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate summary");
      }

      // Save to localStorage
      const storageKey = `ai-summary-${selectedSchool.properties.bsn}`;
      try {
        localStorage.setItem(storageKey, data.summary);
      } catch (error) {
        console.error("Error saving summary to localStorage:", error);
      }

      setAiSummary(data.summary);
    } catch (error: any) {
      console.error("Error fetching AI summary:", error);
      setSummaryError(
        error.message || "Failed to generate summary. Please try again.",
      );
    } finally {
      setIsLoadingSummary(false);
    }
  };

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

            {/* School and Construction Project Markers */}
            {filteredSchools.map((school) => {
              const isConstruction =
                school.properties.isConstructionProject === true;
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
                      position: "relative",
                      width: isConstruction ? "28px" : "24px",
                      height: isConstruction ? "28px" : "24px",
                    }}
                  >
                    {/* Main marker (teardrop) */}
                    <div
                      style={{
                        width: isConstruction ? "28px" : "24px",
                        height: isConstruction ? "28px" : "24px",
                        borderRadius: "50% 50% 50% 0",
                        backgroundColor: color,
                        border: isSelected
                          ? "3px solid #fff"
                          : hasTag
                            ? `3px solid ${primaryTag.color}`
                            : "2px solid white",
                        transform: "rotate(-45deg)",
                        boxShadow: isSelected
                          ? isConstruction
                            ? "0 0 0 4px rgba(251, 191, 36, 0.5), 0 4px 8px rgba(0,0,0,0.4)"
                            : "0 0 0 4px rgba(59, 130, 246, 0.5), 0 4px 8px rgba(0,0,0,0.4)"
                          : hasTag
                            ? `0 0 0 2px ${primaryTag.color}, 0 2px 4px rgba(0,0,0,0.3)`
                            : "0 2px 4px rgba(0,0,0,0.3)",
                        overflow: isConstruction ? "hidden" : "visible",
                        position: "relative",
                      }}
                    >
                      {/* Diagonal stripes overlay for construction projects */}
                      {isConstruction && (
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
                      )}
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
                  {/* Show construction project header if it's a standalone project */}
                  {selectedSchool.properties.isConstructionProject &&
                  selectedSchool.properties.constructionData ? (
                    <>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">🏗️</span>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-foreground">
                            {selectedSchool.properties.schulname}
                          </h3>
                          <div className="flex gap-2 mt-1">
                            <Chip size="sm" variant="flat" color="warning">
                              Construction Project
                            </Chip>
                            <Chip
                              size="sm"
                              variant="flat"
                              color={getStatusColor(
                                getProjectStatus(
                                  selectedSchool.properties.constructionData,
                                ).status,
                              )}
                            >
                              {getStatusLabel(
                                getProjectStatus(
                                  selectedSchool.properties.constructionData,
                                ),
                              )}
                            </Chip>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}

                  {/* For construction projects, show construction details */}
                  {selectedSchool.properties.isConstructionProject &&
                  selectedSchool.properties.constructionData ? (
                    <div className="space-y-3 text-sm text-default-700">
                      <div>
                        <span className="font-semibold text-foreground">
                          📍 Location:
                        </span>
                        <p className="mt-1">
                          {selectedSchool.properties.constructionData.strasse}
                          <br />
                          {selectedSchool.properties.constructionData.plz}{" "}
                          {selectedSchool.properties.constructionData.ort},{" "}
                          {selectedSchool.properties.constructionData.bezirk}
                        </p>
                      </div>

                      <Divider />

                      <div>
                        <span className="font-semibold text-foreground">
                          🏫 School Type:
                        </span>
                        <p className="mt-1">
                          {selectedSchool.properties.constructionData.schulart}
                        </p>
                      </div>

                      <div>
                        <span className="font-semibold text-foreground">
                          🔨 Construction Type:
                        </span>
                        <p className="mt-1">
                          {
                            selectedSchool.properties.constructionData
                              .baumassnahme
                          }
                        </p>
                      </div>

                      <div>
                        <span className="font-semibold text-foreground">
                          📝 Description:
                        </span>
                        <p className="mt-1 leading-relaxed">
                          {
                            selectedSchool.properties.constructionData
                              .beschreibung
                          }
                        </p>
                      </div>

                      {selectedSchool.properties.constructionData
                        .nutzungsuebergabe && (
                        <div>
                          <span className="font-semibold text-foreground">
                            📅 Expected Completion:
                          </span>
                          <p className="mt-1">
                            {
                              selectedSchool.properties.constructionData
                                .nutzungsuebergabe
                            }
                          </p>
                        </div>
                      )}

                      {selectedSchool.properties.constructionData
                        .gesamtkosten && (
                        <div>
                          <span className="font-semibold text-foreground">
                            💰 Total Cost:
                          </span>
                          <p className="mt-1">
                            {
                              selectedSchool.properties.constructionData
                                .gesamtkosten
                            }
                          </p>
                        </div>
                      )}

                      {(selectedSchool.properties.constructionData
                        .schulplaetze_nach_baumassnahme !== "k.A." ||
                        selectedSchool.properties.constructionData
                          .zuegigkeit_nach_baumassnahme !== "k.A.") && (
                        <>
                          <Divider />
                          <div>
                            <span className="font-semibold text-foreground">
                              📊 Capacity After Construction:
                            </span>
                            {selectedSchool.properties.constructionData
                              .schulplaetze_nach_baumassnahme !== "k.A." && (
                              <p className="mt-1">
                                Places:{" "}
                                {
                                  selectedSchool.properties.constructionData
                                    .schulplaetze_nach_baumassnahme
                                }
                              </p>
                            )}
                            {selectedSchool.properties.constructionData
                              .zuegigkeit_nach_baumassnahme !== "k.A." && (
                              <p className="mt-1">
                                Tracks:{" "}
                                {
                                  selectedSchool.properties.constructionData
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
                  )}

                  {/* AI Summary Button & Content Section */}
                  {!selectedSchool.properties.isConstructionProject && (
                    <>
                      <Divider className="my-3" />
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
                        {!aiSummary && !summaryError && (
                          <Button
                            size="sm"
                            variant="solid"
                            fullWidth
                            startContent={
                              isLoadingSummary ? (
                                <Spinner size="sm" color="white" />
                              ) : (
                                <SparklesIcon size={16} />
                              )
                            }
                            onPress={handleSummarizeSchool}
                            isDisabled={isLoadingSummary}
                            className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                            style={{
                              background:
                                "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #6366f1 100%)",
                            }}
                          >
                            {isLoadingSummary
                              ? "Summarizing..."
                              : "Generate AI Summary"}
                          </Button>
                        )}

                        {/* AI Summary Content */}
                        {summaryError && (
                          <div className="p-3 rounded-lg bg-danger/10 border border-danger/20">
                            <p className="text-xs text-danger">
                              ⚠️ {summaryError}
                            </p>
                          </div>
                        )}

                        {aiSummary && (
                          <div className="relative max-h-[200px] overflow-y-auto rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent">
                            <div className="p-3 text-xs text-default-700 leading-relaxed prose prose-sm max-w-none">
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: aiSummary
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

                  {/* Statistics Section */}
                  {selectedSchool.properties.stats && (
                    <>
                      <Divider className="my-3" />
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm font-semibold text-foreground">
                            📊 Statistics (
                            {selectedSchool.properties.stats.schuljahr})
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
                                  {selectedSchool.properties.stats.schuelerGesamt.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Female:</span>
                                <span>
                                  {selectedSchool.properties.stats.schuelerWeiblich.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Male:</span>
                                <span>
                                  {selectedSchool.properties.stats.schuelerMaennlich.toLocaleString()}
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
                                  {selectedSchool.properties.stats.lehrkraefteGesamt.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Female:</span>
                                <span>
                                  {selectedSchool.properties.stats.lehrkraefteWeiblich.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Male:</span>
                                <span>
                                  {selectedSchool.properties.stats.lehrkraefteMaennlich.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Student-Teacher Ratio */}
                        {selectedSchool.properties.stats.lehrkraefteGesamt >
                          0 && (
                          <div className="mt-3 p-2 rounded-lg bg-primary/10">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-foreground font-semibold">
                                📈 Student-Teacher Ratio:
                              </span>
                              <span className="text-foreground font-bold">
                                {(
                                  selectedSchool.properties.stats
                                    .schuelerGesamt /
                                  selectedSchool.properties.stats
                                    .lehrkraefteGesamt
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
                  {selectedSchool.properties.constructionHistory &&
                    selectedSchool.properties.constructionHistory.length >
                      0 && (
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
                                        color={getStatusColor(
                                          statusInfo.status,
                                        )}
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
                <div
                  style={{
                    position: "relative",
                    width: "16px",
                    height: "16px",
                  }}
                >
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
