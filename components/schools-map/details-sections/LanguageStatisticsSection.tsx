"use client";

import { SchoolLanguageStat } from "@/types";

interface LanguageStatisticsSectionProps {
  languageStat: SchoolLanguageStat;
}

export function LanguageStatisticsSection({
  languageStat,
}: LanguageStatisticsSectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-semibold text-foreground">
          🗣️ Language & Heritage Statistics
        </span>
      </div>

      {/* Summary Box */}
      <div className="mb-3 p-3 rounded-lg bg-primary/10 border-2 border-primary/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-foreground">
            Students with Non-German Heritage
          </span>
          <span className="text-lg font-bold text-primary">
            {languageStat.ndh_total}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-default-700 mb-2">
          <div className="flex gap-3">
            <span>👩 Female: {languageStat.ndh_female_students}</span>
            <span>👨 Male: {languageStat.ndh_male_students}</span>
          </div>
          <span className="font-semibold text-primary">
            {languageStat.ndh_percentage.toFixed(1)}% of all students
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-2 bg-default-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{
              width: `${languageStat.ndh_percentage.toFixed(1)}%`,
            }}
          />
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-2 rounded-lg bg-content2">
          <div className="text-xs text-default-600 mb-1">Total Students</div>
          <div className="text-lg font-bold text-foreground">
            {languageStat.total_students}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-content2">
          <div className="text-xs text-default-600 mb-1">German Heritage</div>
          <div className="text-lg font-bold text-foreground">
            {languageStat.total_students - languageStat.ndh_total}
          </div>
          <div className="text-xs text-default-600 mt-1">
            {(100 - languageStat.ndh_percentage).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}
