import { Divider } from "@heroui/divider";

import { SCHOOL_TYPE_COLORS, CONSTRUCTION_STRIPE_COLOR } from "./utils";

export function MapLegend() {
  return (
    <div className="p-4 bg-content2">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-semibold text-foreground">Legend:</span>
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
  );
}
