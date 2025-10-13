"use client";

import { Chip } from "@heroui/chip";
import { useSchoolTagsStore } from "@/lib/store/school-tags-store";

interface TagsSectionProps {
  schoolId: string;
}

export function TagsSection({ schoolId }: TagsSectionProps) {
  const { tags, isLoaded: tagsLoaded, toggleTagOnSchool, schoolHasTag } = useSchoolTagsStore();

  if (!tagsLoaded) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-semibold text-foreground">🏷️ Tags</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isActive = schoolHasTag(schoolId, tag.id);
          return (
            <Chip
              key={tag.id}
              size="sm"
              variant={isActive ? "solid" : "bordered"}
              style={{
                backgroundColor: isActive ? tag.color : "transparent",
                borderColor: tag.color,
                color: isActive ? "#fff" : tag.color,
                cursor: "pointer",
              }}
              onClick={() => toggleTagOnSchool(schoolId, tag.id)}
            >
              {isActive ? "✓ " : ""}
              {tag.name}
            </Chip>
          );
        })}
      </div>
    </div>
  );
}

