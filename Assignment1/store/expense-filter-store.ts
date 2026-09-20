import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ExpenseCategory, SortOrder } from "@/types";

interface ExpenseFilterState {
  searchQuery: string;
  category: ExpenseCategory | "All";
  sortOrder: SortOrder;
  filterPanelOpen: boolean;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setCategory: (category: ExpenseCategory | "All") => void;
  setSortOrder: (order: SortOrder) => void;
  toggleFilterPanel: () => void;
  resetFilters: () => void;
}

const initialState = {
  searchQuery: "",
  category: "All" as const,
  sortOrder: "date-desc" as const,
  filterPanelOpen: false,
};

export const useExpenseFilterStore = create<ExpenseFilterState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      setCategory: (category) => set({ category }),
      setSortOrder: (sortOrder) => set({ sortOrder }),
      toggleFilterPanel: () => set((state) => ({ filterPanelOpen: !state.filterPanelOpen })),
      resetFilters: () => set({ ...initialState, filterPanelOpen: true }), // keep panel open when resetting
    }),
    {
      name: "expense-filter-storage",
      storage: createJSONStorage(() => sessionStorage), // using sessionStorage so it doesn't persist forever across tabs, or we can use localStorage
      partialize: (state) => ({ 
        // Only persist these fields to avoid persisting temporary UI state like filterPanelOpen if we don't want to
        searchQuery: state.searchQuery,
        category: state.category,
        sortOrder: state.sortOrder,
      }),
    }
  )
);
