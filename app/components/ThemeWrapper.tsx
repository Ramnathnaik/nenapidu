"use client";
import useTheme from "@/app/utils/store";
import { useEffect } from "react";
import Header from "./Header";

interface ThemeWrapperProps {
  children: React.ReactNode;
}

const ThemeWrapper: React.FC<ThemeWrapperProps> = ({ children }) => {
  const darkMode = useTheme((state) => state.darkMode);
  const { isSidebarOpen, toggleSidebar } = useTheme();

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark", darkMode);
    }
  }, [darkMode]);

  return (
    <>
      <Header />
      <div className="flex h-[calc(100vh-78px)]">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black opacity-50 md:hidden"
            onClick={toggleSidebar}
          ></div>
        )}
        {children}
      </div>
    </>
  );
};

export default ThemeWrapper;
