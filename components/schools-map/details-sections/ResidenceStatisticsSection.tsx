"use client";

import { ResidenceStat } from "@/types";

interface ResidenceStatisticsSectionProps {
  residenceStats: ResidenceStat[];
}

export function ResidenceStatisticsSection({
  residenceStats,
}: ResidenceStatisticsSectionProps) {
  if (!residenceStats || residenceStats.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-semibold text-foreground">
          🏘️ Student Residence Distribution
        </span>
      </div>
      <div className="space-y-2">
        {residenceStats
          .sort((a, b) => b.student_count - a.student_count)
          .map((stat, index) => {
            const totalStudents = residenceStats.reduce(
              (sum, s) => sum + s.student_count,
              0
            );
            const percentage =
              totalStudents > 0
                ? ((stat.student_count / totalStudents) * 100).toFixed(1)
                : "0";

            return (
              <div
                key={`${stat.district}-${index}`}
                className="p-2 rounded-lg bg-content2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">
                    {stat.district}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-default-700">
                      {stat.student_count} students
                    </span>
                    <span className="text-xs font-semibold text-primary">
                      {percentage}%
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-1 h-1.5 bg-default-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

