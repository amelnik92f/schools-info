import { Marker } from "react-map-gl/maplibre";
import { LocationType } from "@/types";

interface CustomLocationMarkerProps {
  type: LocationType;
  coordinates: [number, number];
  onClick: (type: LocationType) => void;
}

export function CustomLocationMarker({ type, coordinates, onClick }: CustomLocationMarkerProps) {
  const icon = type === "home" ? "🏠" : "💼";

  return (
    <Marker
      longitude={coordinates[0]}
      latitude={coordinates[1]}
      anchor="bottom"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick(type);
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
        {icon}
      </div>
    </Marker>
  );
}