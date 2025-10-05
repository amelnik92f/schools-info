"use client";

import { useState, useEffect, useCallback } from "react";
import { CustomLocation, LocationType } from "@/types";

const STORAGE_KEY = "custom-locations";

export function useCustomLocations() {
  const [locations, setLocations] = useState<{
    home: CustomLocation | null;
    work: CustomLocation | null;
  }>({
    home: null,
    work: null,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load locations from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setLocations(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading custom locations from localStorage:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save locations to localStorage whenever they change
  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
    } catch (error) {
      console.error("Error saving custom locations to localStorage:", error);
    }
  }, [locations, isLoaded]);

  // Set a location
  const setLocation = useCallback(
    (type: LocationType, coordinates: [number, number], label?: string) => {
      const newLocation: CustomLocation = {
        type,
        coordinates,
        label,
      };
      setLocations((prev) => ({
        ...prev,
        [type]: newLocation,
      }));
    },
    [],
  );

  // Remove a location
  const removeLocation = useCallback((type: LocationType) => {
    setLocations((prev) => ({
      ...prev,
      [type]: null,
    }));
  }, []);

  // Get a specific location
  const getLocation = useCallback(
    (type: LocationType): CustomLocation | null => {
      return locations[type];
    },
    [locations],
  );

  // Check if a location is set
  const hasLocation = useCallback(
    (type: LocationType): boolean => {
      return locations[type] !== null;
    },
    [locations],
  );

  return {
    locations,
    isLoaded,
    setLocation,
    removeLocation,
    getLocation,
    hasLocation,
  };
}