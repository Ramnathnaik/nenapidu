import { create } from "zustand";

type AppState = {
  darkMode: boolean;
  toggleDarkMode: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
};

//zustand store to handle dark and light mode
const useTheme = create<AppState>((set) => ({
  darkMode: false,
  toggleDarkMode: () =>
    set((state: AppState) => ({ darkMode: !state.darkMode })),
  isSidebarOpen: false,
  toggleSidebar: () =>
    set((state: AppState) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));

export default useTheme;
