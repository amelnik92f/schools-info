"use client";

import { SchoolAbsenceStat } from "@/types";

interface AbsenceStatisticsSectionProps {
  absenceStat: SchoolAbsenceStat;
}

export function AbsenceStatisticsSection({
  absenceStat,
}: AbsenceStatisticsSectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-semibold text-foreground">
          📅 Absence Statistics
        </span>
      </div>

      {/* School Absence Summary */}
      <div className="mb-3 p-3 rounded-lg bg-primary/10 border-2 border-primary/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-foreground">This School</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-default-600 mb-1">
              Total Absence Rate
            </div>
            <div className="text-2xl font-bold text-primary">
              {absenceStat.school_absence_rate.toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-xs text-default-600 mb-1">Unexcused Rate</div>
            <div className="text-2xl font-bold text-warning">
              {absenceStat.school_unexcused_rate.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Comparison with Other Levels */}
      <div className="space-y-2">
        {/* School Type Comparison */}
        <div className="p-2 rounded-lg bg-content2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-foreground">
              School Type Average
            </span>
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-default-700">Total Absence</span>
                <span className="font-semibold text-foreground">
                  {absenceStat.school_type_absence_rate.toFixed(1)}%
                </span>
              </div>
              <div className="h-1.5 bg-default-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-default-500 rounded-full transition-all"
                  style={{
                    width: `${Math.min(absenceStat.school_type_absence_rate, 100)}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-default-700">Unexcused</span>
                <span className="font-semibold text-foreground">
                  {absenceStat.school_type_unexcused_rate.toFixed(1)}%
                </span>
              </div>
              <div className="h-1.5 bg-default-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-warning rounded-full transition-all"
                  style={{
                    width: `${Math.min(absenceStat.school_type_unexcused_rate, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Region Comparison */}
        <div className="p-2 rounded-lg bg-content2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-foreground">
              Region Average
            </span>
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-default-700">Total Absence</span>
                <span className="font-semibold text-foreground">
                  {absenceStat.region_absence_rate.toFixed(1)}%
                </span>
              </div>
              <div className="h-1.5 bg-default-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-default-500 rounded-full transition-all"
                  style={{
                    width: `${Math.min(absenceStat.region_absence_rate, 100)}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-default-700">Unexcused</span>
                <span className="font-semibold text-foreground">
                  {absenceStat.region_unexcused_rate.toFixed(1)}%
                </span>
              </div>
              <div className="h-1.5 bg-default-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-warning rounded-full transition-all"
                  style={{
                    width: `${Math.min(absenceStat.region_unexcused_rate, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Berlin Comparison */}
        <div className="p-2 rounded-lg bg-content2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-foreground">
              Berlin Average
            </span>
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-default-700">Total Absence</span>
                <span className="font-semibold text-foreground">
                  {absenceStat.berlin_absence_rate.toFixed(1)}%
                </span>
              </div>
              <div className="h-1.5 bg-default-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-default-500 rounded-full transition-all"
                  style={{
                    width: `${Math.min(absenceStat.berlin_absence_rate, 100)}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-default-700">Unexcused</span>
                <span className="font-semibold text-foreground">
                  {absenceStat.berlin_unexcused_rate.toFixed(1)}%
                </span>
              </div>
              <div className="h-1.5 bg-default-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-warning rounded-full transition-all"
                  style={{
                    width: `${Math.min(absenceStat.berlin_unexcused_rate, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
