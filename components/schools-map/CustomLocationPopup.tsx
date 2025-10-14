import { Popup } from "react-map-gl/maplibre";
import { Button } from "@heroui/button";

import { LocationType } from "@/types";

interface CustomLocationPopupProps {
  type: LocationType;
  coordinates: [number, number];
  onClose: () => void;
  onRemove: (type: LocationType) => void;
}

export function CustomLocationPopup({
  type,
  coordinates,
  onClose,
  onRemove,
}: CustomLocationPopupProps) {
  const icon = type === "home" ? "🏠" : "💼";
  const label = type === "home" ? "Home" : "Work";

  return (
    <Popup
      anchor="top"
      closeButton={true}
      closeOnClick={false}
      latitude={coordinates[1]}
      longitude={coordinates[0]}
      maxWidth="300px"
      offset={20}
      onClose={onClose}
    >
      <div className="p-3 min-w-[200px]">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-3xl">{icon}</span>
          <h3 className="text-lg font-bold text-foreground">{label}</h3>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-default-700">📍 Location saved</p>
          <Button
            fullWidth
            color="danger"
            size="sm"
            variant="flat"
            onPress={() => {
              onRemove(type);
              onClose();
            }}
          >
            Remove Location
          </Button>
        </div>
      </div>
    </Popup>
  );
}
