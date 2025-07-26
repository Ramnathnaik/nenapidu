"use client";

import { SignOutButton } from "@clerk/nextjs";
import { Plus, Bell, LogOut, Users } from "lucide-react";
import Link from "next/link";
import useTheme from "../utils/store";

const Sidebar = () => {
  const { isSidebarOpen, toggleSidebar } = useTheme();

  // Function to handle navigation and close sidebar on mobile
  const handleNavigation = () => {
    // Close sidebar only on mobile screens
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 z-40 w-64 p-4 overflow-y-auto h-screen md:h-[calc(100vh-78px)] transition-transform bg-gray-100 dark:bg-gray-700 shadow-xl ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:relative md:translate-x-0`}
    >
      <div className="flex flex-col justify-between h-full">
        <div>
          <Link
            href="/"
            className="flex items-center w-full px-4 py-2 mb-4 text-left text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={handleNavigation}
          >
            <Users className="w-5 h-5 mr-2" />
            Profiles
          </Link>
          <Link
            href="/profile/add"
            className="flex items-center w-full px-4 py-2 mb-4 text-left text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={handleNavigation}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Profile
          </Link>
          <Link
            href="/reminders"
            className="flex items-center w-full px-4 py-2 mb-4 text-left text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={handleNavigation}
          >
            <Bell className="w-5 h-5 mr-2" />
            Reminders
          </Link>
          <Link
            href="/reminder/add"
            className="flex items-center w-full px-4 py-2 mb-4 text-left text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={handleNavigation}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Reminder
          </Link>
        </div>
        <div>
          <SignOutButton>
            <button className="flex items-center w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </button>
          </SignOutButton>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
