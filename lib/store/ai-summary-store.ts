import { create } from "zustand";
import { persist } from "zustand/middleware";
import { fetchAISummary } from "@/lib/actions/ai-summary";

interface AISummary {
  summary: string;
  timestamp: number; // When the summary was generated
}

interface AISummaryState {
  summaries: Record<string, AISummary>; // Map of school BSN to summary
  isLoaded: boolean;

  // Loading states for individual schools
  loadingStates: Record<string, boolean>;
  errorStates: Record<string, string | null>;

  // Actions
  getSummary: (bsn: string) => string | null;
  setSummary: (bsn: string, summary: string) => void;
  hasSummary: (bsn: string) => boolean;
  removeSummary: (bsn: string) => void;
  clearAllSummaries: () => void;

  // Loading state actions
  setLoading: (bsn: string, isLoading: boolean) => void;
  isLoading: (bsn: string) => boolean;

  // Error state actions
  setError: (bsn: string, error: string | null) => void;
  getError: (bsn: string) => string | null;
  clearError: (bsn: string) => void;

  // Fetch summary from API
  fetchSummary: (params: {
    schoolId: string; // Database ID for API call
    bsn?: string; // School number for storage key (optional, defaults to schoolId)
  }) => Promise<void>;
}

export const useAISummaryStore = create<AISummaryState>()(
  persist(
    (set, get) => ({
      summaries: {},
      isLoaded: false,
      loadingStates: {},
      errorStates: {},

      getSummary: (bsn) => {
        const summaryData = get().summaries[bsn];
        return summaryData?.summary || null;
      },

      setSummary: (bsn, summary) => {
        set((state) => ({
          summaries: {
            ...state.summaries,
            [bsn]: {
              summary,
              timestamp: Date.now(),
            },
          },
        }));
      },

      hasSummary: (bsn) => {
        return !!get().summaries[bsn];
      },

      removeSummary: (bsn) => {
        set((state) => {
          const newSummaries = { ...state.summaries };
          delete newSummaries[bsn];
          return { summaries: newSummaries };
        });
      },

      clearAllSummaries: () => {
        set({ summaries: {} });
      },

      setLoading: (bsn, isLoading) => {
        set((state) => ({
          loadingStates: {
            ...state.loadingStates,
            [bsn]: isLoading,
          },
        }));
      },

      isLoading: (bsn) => {
        return get().loadingStates[bsn] || false;
      },

      setError: (bsn, error) => {
        set((state) => ({
          errorStates: {
            ...state.errorStates,
            [bsn]: error,
          },
        }));
      },

      getError: (bsn) => {
        return get().errorStates[bsn] || null;
      },

      clearError: (bsn) => {
        set((state) => {
          const newErrorStates = { ...state.errorStates };
          delete newErrorStates[bsn];
          return { errorStates: newErrorStates };
        });
      },

      fetchSummary: async (params) => {
        const { schoolId, bsn } = params;
        // Use BSN for storage key if provided, otherwise use schoolId
        const storageKey = bsn || schoolId;

        // Set loading state
        get().setLoading(storageKey, true);
        get().clearError(storageKey);

        try {
          // Use server action instead of direct fetch
          // This keeps the API key secure on the server
          const data = await fetchAISummary(schoolId);

          // Save summary to store using storage key
          get().setSummary(storageKey, data.summary);
        } catch (error: any) {
          console.error("Error fetching AI summary:", error);
          get().setError(
            storageKey,
            error.message || "Failed to generate summary. Please try again.",
          );
          throw error;
        } finally {
          get().setLoading(storageKey, false);
        }
      },
    }),
    {
      name: "ai-summaries",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoaded = true;
        }
      },
      // Only persist summaries, not loading/error states
      partialize: (state) => ({
        summaries: state.summaries,
      }),
    },
  ),
);
