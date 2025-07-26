import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type AppState = {
  darkMode: boolean;
  toggleDarkMode: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
};

//zustand store to handle dark and light mode
const useTheme = create<AppState>()(
  persist(
    (set) => ({
  darkMode: false,
  toggleDarkMode: () =>
    set((state: AppState) => ({ darkMode: !state.darkMode })),
  isSidebarOpen: false,
  toggleSidebar: () =>
    set((state: AppState) => ({ isSidebarOpen: !state.isSidebarOpen })),
}),
    {
      name: "theme-storage", // unique name
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useTheme;
