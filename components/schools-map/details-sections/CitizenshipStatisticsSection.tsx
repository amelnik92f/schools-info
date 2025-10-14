"use client";

import { SchoolCitizenshipStat, SchoolStatistic } from "@/types";

interface CitizenshipStatisticsSectionProps {
  citizenshipStats: SchoolCitizenshipStat[];
  stats?: SchoolStatistic | null;
}

export function CitizenshipStatisticsSection({
  citizenshipStats,
  stats,
}: CitizenshipStatisticsSectionProps) {
  if (!citizenshipStats || citizenshipStats.length === 0) {
    return null;
  }

  // Separate "Insgesamt" (total) from regional breakdown
  const totalRow = citizenshipStats.find(
    (stat) => stat.citizenship.toLowerCase() === "insgesamt",
  );
  const regionalStats = citizenshipStats.filter(
    (stat) => stat.citizenship.toLowerCase() !== "insgesamt",
  );

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-semibold text-foreground">
          🌍 Students with Non-German Citizenship
        </span>
      </div>

      {/* Total Summary - Insgesamt */}
      {totalRow && (
        <div className="mb-3 p-3 rounded-lg bg-primary/10 border-2 border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-foreground">
              Total Non-German Students
            </span>
            <span className="text-lg font-bold text-primary">
              {totalRow.total}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-default-700 mb-2">
            <div className="flex gap-3">
              <span>👩 Female: {totalRow.female_students}%</span>
              <span>👨 Male: {totalRow.male_students}%</span>
            </div>
            {stats && Number(stats.students) > 0 && (
              <span className="font-semibold text-primary">
                {((totalRow.total / Number(stats.students)) * 100).toFixed(1)}%
                of all students
              </span>
            )}
          </div>
          {/* Progress bar compared to total students */}
          {stats && Number(stats.students) > 0 && (
            <div className="h-2 bg-default-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{
                  width: `${((totalRow.total / Number(stats.students)) * 100).toFixed(1)}%`,
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Regional Breakdown */}
      {regionalStats.length > 0 && (
        <>
          <div className="text-xs font-semibold text-default-600 mb-2">
            Breakdown by Region:
          </div>
          <div className="space-y-2">
            {regionalStats
              .sort((a, b) => b.total - a.total)
              .map((stat, index) => {
                const totalNonGerman =
                  totalRow?.total ||
                  regionalStats.reduce((sum, s) => sum + s.total, 0);
                const percentage =
                  totalNonGerman > 0
                    ? ((stat.total / totalNonGerman) * 100).toFixed(1)
                    : "0";

                return (
                  <div
                    key={`${stat.citizenship}-${index}`}
                    className="p-2 rounded-lg bg-content2"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-foreground">
                        {stat.citizenship}
                      </span>
                      <span className="text-xs font-semibold text-primary">
                        {percentage}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-default-700 mb-1">
                      <div className="flex gap-3">
                        <span>👩 {stat.female_students}</span>
                        <span>👨 {stat.male_students}</span>
                      </div>
                      <span className="font-semibold">Total: {stat.total}</span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1.5 bg-default-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
}
