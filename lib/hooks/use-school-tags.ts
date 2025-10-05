"use client";

import { useState, useEffect, useCallback } from "react";
import { SchoolTag, SchoolTags } from "@/types";

const STORAGE_KEY_TAGS = "school-tags";
const STORAGE_KEY_SCHOOL_TAGS = "school-tag-assignments";

// Default tags
const DEFAULT_TAGS: SchoolTag[] = [
  { id: "favorite", name: "Favorite", color: "#f59e0b" },
  { id: "visited", name: "Visited", color: "#10b981" },
  { id: "interested", name: "Interested", color: "#3b82f6" },
  { id: "applied", name: "Applied", color: "#8b5cf6" },
];

export function useSchoolTags() {
  const [tags, setTags] = useState<SchoolTag[]>(DEFAULT_TAGS);
  const [schoolTags, setSchoolTags] = useState<SchoolTags>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load tags from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedTags = localStorage.getItem(STORAGE_KEY_TAGS);
      const storedSchoolTags = localStorage.getItem(STORAGE_KEY_SCHOOL_TAGS);

      if (storedTags) {
        setTags(JSON.parse(storedTags));
      }

      if (storedSchoolTags) {
        setSchoolTags(JSON.parse(storedSchoolTags));
      }
    } catch (error) {
      console.error("Error loading tags from localStorage:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save tags to localStorage whenever they change
  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEY_TAGS, JSON.stringify(tags));
    } catch (error) {
      console.error("Error saving tags to localStorage:", error);
    }
  }, [tags, isLoaded]);

  // Save school tags to localStorage whenever they change
  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;

    try {
      localStorage.setItem(
        STORAGE_KEY_SCHOOL_TAGS,
        JSON.stringify(schoolTags),
      );
    } catch (error) {
      console.error("Error saving school tags to localStorage:", error);
    }
  }, [schoolTags, isLoaded]);

  // Add a new tag
  const addTag = useCallback((name: string, color: string) => {
    const newTag: SchoolTag = {
      id: `tag-${Date.now()}`,
      name,
      color,
    };
    setTags((prev) => [...prev, newTag]);
    return newTag;
  }, []);

  // Remove a tag
  const removeTag = useCallback((tagId: string) => {
    setTags((prev) => prev.filter((tag) => tag.id !== tagId));
    // Also remove this tag from all schools
    setSchoolTags((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((schoolId) => {
        updated[schoolId] = updated[schoolId].filter((id) => id !== tagId);
        if (updated[schoolId].length === 0) {
          delete updated[schoolId];
        }
      });
      return updated;
    });
  }, []);

  // Update a tag
  const updateTag = useCallback((tagId: string, name: string, color: string) => {
    setTags((prev) =>
      prev.map((tag) => (tag.id === tagId ? { ...tag, name, color } : tag)),
    );
  }, []);

  // Add a tag to a school
  const addTagToSchool = useCallback((schoolId: string, tagId: string) => {
    setSchoolTags((prev) => {
      const currentTags = prev[schoolId] || [];
      if (currentTags.includes(tagId)) {
        return prev; // Tag already exists
      }
      return {
        ...prev,
        [schoolId]: [...currentTags, tagId],
      };
    });
  }, []);

  // Remove a tag from a school
  const removeTagFromSchool = useCallback(
    (schoolId: string, tagId: string) => {
      setSchoolTags((prev) => {
        const currentTags = prev[schoolId] || [];
        const updatedTags = currentTags.filter((id) => id !== tagId);

        if (updatedTags.length === 0) {
          const { [schoolId]: _, ...rest } = prev;
          return rest;
        }

        return {
          ...prev,
          [schoolId]: updatedTags,
        };
      });
    },
    [],
  );

  // Toggle a tag on a school
  const toggleTagOnSchool = useCallback(
    (schoolId: string, tagId: string) => {
      const currentTags = schoolTags[schoolId] || [];
      if (currentTags.includes(tagId)) {
        removeTagFromSchool(schoolId, tagId);
      } else {
        addTagToSchool(schoolId, tagId);
      }
    },
    [schoolTags, addTagToSchool, removeTagFromSchool],
  );

  // Get tags for a specific school
  const getSchoolTags = useCallback(
    (schoolId: string): SchoolTag[] => {
      const tagIds = schoolTags[schoolId] || [];
      return tags.filter((tag) => tagIds.includes(tag.id));
    },
    [tags, schoolTags],
  );

  // Check if a school has a specific tag
  const schoolHasTag = useCallback(
    (schoolId: string, tagId: string): boolean => {
      const tagIds = schoolTags[schoolId] || [];
      return tagIds.includes(tagId);
    },
    [schoolTags],
  );

  // Get all unique tags used across all schools
  const getUsedTags = useCallback((): SchoolTag[] => {
    const usedTagIds = new Set<string>();
    Object.values(schoolTags).forEach((tagIds) => {
      tagIds.forEach((id) => usedTagIds.add(id));
    });
    return tags.filter((tag) => usedTagIds.has(tag.id));
  }, [tags, schoolTags]);

  return {
    tags,
    schoolTags,
    isLoaded,
    addTag,
    removeTag,
    updateTag,
    addTagToSchool,
    removeTagFromSchool,
    toggleTagOnSchool,
    getSchoolTags,
    schoolHasTag,
    getUsedTags,
  };
}