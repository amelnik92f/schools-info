import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SchoolTag, SchoolTags } from "@/types";

// Default tags
const DEFAULT_TAGS: SchoolTag[] = [
  { id: "favorite", name: "Favorite", color: "#f59e0b" },
  { id: "visited", name: "Visited", color: "#10b981" },
  { id: "interested", name: "Interested", color: "#3b82f6" },
  { id: "applied", name: "Applied", color: "#8b5cf6" },
];

interface SchoolTagsState {
  tags: SchoolTag[];
  schoolTags: SchoolTags;
  isLoaded: boolean;

  // Tag management actions
  addTag: (name: string, color: string) => SchoolTag;
  removeTag: (tagId: string) => void;
  updateTag: (tagId: string, name: string, color: string) => void;

  // School-tag assignment actions
  addTagToSchool: (schoolId: string, tagId: string) => void;
  removeTagFromSchool: (schoolId: string, tagId: string) => void;
  toggleTagOnSchool: (schoolId: string, tagId: string) => void;

  // Query actions
  getSchoolTags: (schoolId: string) => SchoolTag[];
  schoolHasTag: (schoolId: string, tagId: string) => boolean;
  getUsedTags: () => SchoolTag[];
}

export const useSchoolTagsStore = create<SchoolTagsState>()(
  persist(
    (set, get) => ({
      tags: DEFAULT_TAGS,
      schoolTags: {},
      isLoaded: false,

      // Add a new tag
      addTag: (name, color) => {
        const newTag: SchoolTag = {
          id: `tag-${Date.now()}`,
          name,
          color,
        };
        set((state) => ({
          tags: [...state.tags, newTag],
        }));
        return newTag;
      },

      // Remove a tag
      removeTag: (tagId) => {
        set((state) => {
          // Remove tag from tags array
          const updatedTags = state.tags.filter((tag) => tag.id !== tagId);

          // Remove this tag from all schools
          const updatedSchoolTags = { ...state.schoolTags };
          Object.keys(updatedSchoolTags).forEach((schoolId) => {
            updatedSchoolTags[schoolId] = updatedSchoolTags[schoolId].filter(
              (id) => id !== tagId,
            );
            if (updatedSchoolTags[schoolId].length === 0) {
              delete updatedSchoolTags[schoolId];
            }
          });

          return {
            tags: updatedTags,
            schoolTags: updatedSchoolTags,
          };
        });
      },

      // Update a tag
      updateTag: (tagId, name, color) => {
        set((state) => ({
          tags: state.tags.map((tag) =>
            tag.id === tagId ? { ...tag, name, color } : tag,
          ),
        }));
      },

      // Add a tag to a school
      addTagToSchool: (schoolId, tagId) => {
        set((state) => {
          const currentTags = state.schoolTags[schoolId] || [];
          if (currentTags.includes(tagId)) {
            return state; // Tag already exists
          }
          return {
            schoolTags: {
              ...state.schoolTags,
              [schoolId]: [...currentTags, tagId],
            },
          };
        });
      },

      // Remove a tag from a school
      removeTagFromSchool: (schoolId, tagId) => {
        set((state) => {
          const currentTags = state.schoolTags[schoolId] || [];
          const updatedTags = currentTags.filter((id) => id !== tagId);

          if (updatedTags.length === 0) {
            const { [schoolId]: _, ...rest } = state.schoolTags;
            return { schoolTags: rest };
          }

          return {
            schoolTags: {
              ...state.schoolTags,
              [schoolId]: updatedTags,
            },
          };
        });
      },

      // Toggle a tag on a school
      toggleTagOnSchool: (schoolId, tagId) => {
        const state = get();
        const currentTags = state.schoolTags[schoolId] || [];
        if (currentTags.includes(tagId)) {
          state.removeTagFromSchool(schoolId, tagId);
        } else {
          state.addTagToSchool(schoolId, tagId);
        }
      },

      // Get tags for a specific school
      getSchoolTags: (schoolId) => {
        const state = get();
        const tagIds = state.schoolTags[schoolId] || [];
        return state.tags.filter((tag) => tagIds.includes(tag.id));
      },

      // Check if a school has a specific tag
      schoolHasTag: (schoolId, tagId) => {
        const state = get();
        const tagIds = state.schoolTags[schoolId] || [];
        return tagIds.includes(tagId);
      },

      // Get all unique tags used across all schools
      getUsedTags: () => {
        const state = get();
        const usedTagIds = new Set<string>();
        Object.values(state.schoolTags).forEach((tagIds) => {
          tagIds.forEach((id) => usedTagIds.add(id));
        });
        return state.tags.filter((tag) => usedTagIds.has(tag.id));
      },
    }),
    {
      name: "school-tags",
      partialize: (state) => ({
        tags: state.tags,
        schoolTags: state.schoolTags,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoaded = true;
        }
      },
    },
  ),
);