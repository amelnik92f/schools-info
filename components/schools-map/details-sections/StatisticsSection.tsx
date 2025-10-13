"use client";

import { Statistic } from "@/types";

interface StatisticsSectionProps {
  stats: Statistic;
}

export function StatisticsSection({ stats }: StatisticsSectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-semibold text-foreground">
          📊 Statistics ({stats.school_year})
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {/* Students Section */}
        <div className="p-3 rounded-lg bg-content2">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">👨‍🎓</span>
            <span className="text-xs font-semibold text-foreground">Students</span>
          </div>
          <div className="space-y-1 text-xs text-default-700">
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-semibold">{stats.students}</span>
            </div>
            <div className="flex justify-between">
              <span>Female:</span>
              <span>{stats.students_female}</span>
            </div>
            <div className="flex justify-between">
              <span>Male:</span>
              <span>{stats.students_male}</span>
            </div>
          </div>
        </div>

        {/* Teachers Section */}
        <div className="p-3 rounded-lg bg-content2">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">👨‍🏫</span>
            <span className="text-xs font-semibold text-foreground">Teachers</span>
          </div>
          <div className="space-y-1 text-xs text-default-700">
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-semibold">{stats.teachers}</span>
            </div>
            <div className="flex justify-between">
              <span>Female:</span>
              <span>{stats.teachers_female}</span>
            </div>
            <div className="flex justify-between">
              <span>Male:</span>
              <span>{stats.teachers_male}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Student-Teacher Ratio */}
      {Number(stats.teachers) > 0 && (
        <div className="mt-3 p-2 rounded-lg bg-primary/10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-foreground font-semibold">
              📈 Student-Teacher Ratio:
            </span>
            <span className="text-foreground font-bold">
              {(Number(stats.students) / Number(stats.teachers)).toFixed(1)}:1
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

