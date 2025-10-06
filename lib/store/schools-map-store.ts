import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SchoolFeature, LocationType } from "@/types";

interface SchoolsMapState {
  // Selected school state
  selectedSchool: SchoolFeature | null;
  setSelectedSchool: (school: SchoolFeature | null) => void;

  // Map view state
  viewState: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  setViewState: (viewState: {
    longitude: number;
    latitude: number;
    zoom: number;
  }) => void;

  // Filter states
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  selectedSchoolTypes: Set<string>;
  setSelectedSchoolTypes: (types: Set<string>) => void;
  toggleSchoolType: (type: string) => void;

  selectedCarriers: Set<string>;
  setSelectedCarriers: (carriers: Set<string>) => void;
  toggleCarrier: (carrier: string) => void;

  selectedDistricts: Set<string>;
  setSelectedDistricts: (districts: Set<string>) => void;
  toggleDistrict: (district: string) => void;

  selectedTags: Set<string>;
  setSelectedTags: (tags: Set<string>) => void;
  toggleTag: (tagId: string) => void;

  showAfter4thGradeOnly: boolean;
  setShowAfter4thGradeOnly: (show: boolean) => void;

  // UI states
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;

  // Custom location states
  isSettingLocation: LocationType | null;
  setIsSettingLocation: (type: LocationType | null) => void;

  selectedCustomLocation: LocationType | null;
  setSelectedCustomLocation: (type: LocationType | null) => void;

  // Actions
  clearAllFilters: () => void;
  hasActiveFilters: () => boolean;
}

export const useSchoolsMapStore = create<SchoolsMapState>()(
  persist(
    (set, get) => ({
      // Initial states
      selectedSchool: null,
      setSelectedSchool: (school) => set({ selectedSchool: school }),

      viewState: {
        longitude: 13.404954, // Berlin center
        latitude: 52.520008,
        zoom: 10,
      },
      setViewState: (viewState) => set({ viewState }),

      searchQuery: "",
      setSearchQuery: (query) => set({ searchQuery: query }),

      selectedSchoolTypes: new Set(),
      setSelectedSchoolTypes: (types) => set({ selectedSchoolTypes: types }),
      toggleSchoolType: (type) =>
        set((state) => {
          const newSet = new Set(state.selectedSchoolTypes);
          if (newSet.has(type)) {
            newSet.delete(type);
          } else {
            newSet.add(type);
          }
          return { selectedSchoolTypes: newSet };
        }),

      selectedCarriers: new Set(),
      setSelectedCarriers: (carriers) => set({ selectedCarriers: carriers }),
      toggleCarrier: (carrier) =>
        set((state) => {
          const newSet = new Set(state.selectedCarriers);
          if (newSet.has(carrier)) {
            newSet.delete(carrier);
          } else {
            newSet.add(carrier);
          }
          return { selectedCarriers: newSet };
        }),

      selectedDistricts: new Set(),
      setSelectedDistricts: (districts) =>
        set({ selectedDistricts: districts }),
      toggleDistrict: (district) =>
        set((state) => {
          const newSet = new Set(state.selectedDistricts);
          if (newSet.has(district)) {
            newSet.delete(district);
          } else {
            newSet.add(district);
          }
          return { selectedDistricts: newSet };
        }),

      selectedTags: new Set(),
      setSelectedTags: (tags) => set({ selectedTags: tags }),
      toggleTag: (tagId) =>
        set((state) => {
          const newSet = new Set(state.selectedTags);
          if (newSet.has(tagId)) {
            newSet.delete(tagId);
          } else {
            newSet.add(tagId);
          }
          return { selectedTags: newSet };
        }),

      showAfter4thGradeOnly: false,
      setShowAfter4thGradeOnly: (show) => set({ showAfter4thGradeOnly: show }),

      showFilters: typeof window !== "undefined" && window.innerWidth >= 768, // Hidden on mobile by default
      setShowFilters: (show) => set({ showFilters: show }),

      isSettingLocation: null,
      setIsSettingLocation: (type) => set({ isSettingLocation: type }),

      selectedCustomLocation: null,
      setSelectedCustomLocation: (type) =>
        set({ selectedCustomLocation: type }),

      clearAllFilters: () =>
        set({
          searchQuery: "",
          selectedSchoolTypes: new Set(),
          selectedCarriers: new Set(),
          selectedDistricts: new Set(),
          selectedTags: new Set(),
          showAfter4thGradeOnly: false,
        }),

      hasActiveFilters: () => {
        const state = get();
        return (
          state.searchQuery !== "" ||
          state.selectedSchoolTypes.size > 0 ||
          state.selectedCarriers.size > 0 ||
          state.selectedDistricts.size > 0 ||
          state.selectedTags.size > 0 ||
          state.showAfter4thGradeOnly
        );
      },
    }),
    {
      name: "schools-map-filters",
      // Custom storage to handle Set serialization
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const { state } = JSON.parse(str);
          return {
            state: {
              ...state,
              // Convert arrays back to Sets
              selectedSchoolTypes: new Set(state.selectedSchoolTypes || []),
              selectedCarriers: new Set(state.selectedCarriers || []),
              selectedDistricts: new Set(state.selectedDistricts || []),
              selectedTags: new Set(state.selectedTags || []),
            },
          };
        },
        setItem: (name, value) => {
          const { state } = value;
          const serialized = {
            state: {
              ...state,
              // Convert Sets to arrays for JSON serialization
              selectedSchoolTypes: Array.from(state.selectedSchoolTypes),
              selectedCarriers: Array.from(state.selectedCarriers),
              selectedDistricts: Array.from(state.selectedDistricts),
              selectedTags: Array.from(state.selectedTags),
            },
          };
          localStorage.setItem(name, JSON.stringify(serialized));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
      // Only persist filter states and view state, not UI states
      partialize: (state) => ({
        searchQuery: state.searchQuery,
        selectedSchoolTypes: state.selectedSchoolTypes,
        selectedCarriers: state.selectedCarriers,
        selectedDistricts: state.selectedDistricts,
        selectedTags: state.selectedTags,
        showAfter4thGradeOnly: state.showAfter4thGradeOnly,
        showFilters: state.showFilters,
        viewState: state.viewState,
      }),
    },
  ),
);
