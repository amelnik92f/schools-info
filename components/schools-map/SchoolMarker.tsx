import { Marker } from "react-map-gl/maplibre";
import { SchoolFeature } from "@/types";
import { getMarkerColor, CONSTRUCTION_STRIPE_COLOR } from "./utils";
import { useSchoolTagsStore } from "@/lib/store/school-tags-store";

interface SchoolMarkerProps {
  school: SchoolFeature;
  isSelected: boolean;
  onClick: (school: SchoolFeature) => void;
}

export function SchoolMarker({
  school,
  isSelected,
  onClick,
}: SchoolMarkerProps) {
  const { getSchoolTags } = useSchoolTagsStore();

  const isConstruction = school.properties.isConstructionProject === true;
  const [lng, lat] = school.geometry.coordinates;
  const color = getMarkerColor(school.properties.schultyp);
  const schoolTags = getSchoolTags(school.id);
  const hasTag = schoolTags.length > 0;
  const primaryTag = schoolTags[0]; // Use first tag for color accent

  return (
    <Marker
      longitude={lng}
      latitude={lat}
      anchor="bottom"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick(school);
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
}
