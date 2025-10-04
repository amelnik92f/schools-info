"use client";

import { useState, useCallback, useMemo } from "react";
import Map, {
  Marker,
  Popup,
  NavigationControl,
  FullscreenControl,
  ScaleControl,
} from "react-map-gl/maplibre";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Link } from "@heroui/link";
import { SchoolsGeoJSON, SchoolFeature } from "@/types";
import "maplibre-gl/dist/maplibre-gl.css";

interface SchoolsMapProps {
  schoolsData: SchoolsGeoJSON;
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

export function SchoolsMap({ schoolsData }: SchoolsMapProps) {
  const [selectedSchool, setSelectedSchool] = useState<SchoolFeature | null>(
    null,
  );
  const [viewState, setViewState] = useState({
    longitude: 13.404954, // Berlin center
    latitude: 52.520008,
    zoom: 10,
  });

  const mapStyle = "https://tiles.openfreemap.org/styles/bright"; // OSM Bright GL Style

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
  }, []);

  const handleClosePopup = useCallback(() => {
    setSelectedSchool(null);
  }, []);

  return (
    <Card className="bg-content1 shadow-medium overflow-hidden">
      <CardBody className="p-0">
        <div className="relative w-full h-[600px]">
          <Map
            {...viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            style={{ width: "100%", height: "100%" }}
            mapStyle={mapStyle}
            attributionControl={{ compact: true }}
          >
            {/* Map Controls */}
            <NavigationControl position="top-right" />
            <FullscreenControl position="top-right" />
            <ScaleControl position="bottom-left" />

            {/* School Markers */}
            {schoolsData.features.map((school) => {
              const [lng, lat] = school.geometry.coordinates;
              const color = getMarkerColor(school.properties.schultyp);

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
                    className="cursor-pointer transition-transform hover:scale-110"
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50% 50% 50% 0",
                      backgroundColor: color,
                      border: "2px solid white",
                      transform: "rotate(-45deg)",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                    }}
                  />
                </Marker>
              );
            })}

            {/* Popup for selected school */}
            {selectedSchool && (
              <Popup
                longitude={selectedSchool.geometry.coordinates[0]}
                latitude={selectedSchool.geometry.coordinates[1]}
                anchor="bottom"
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
                          className="text-primary"
                        >
                          Website
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            )}
          </Map>
        </div>

        {/* Legend */}
        <div className="p-4 bg-content2 border-t border-divider">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-foreground">
              School Types:
            </span>
          </div>
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
      </CardBody>
    </Card>
  );
}
