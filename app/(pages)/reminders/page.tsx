"use client";

import { useEffect, useState, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { Bell, ArrowLeft, Filter, X, User, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import ReminderCard from "@/app/components/ReminderCard";

interface Reminder {
  id: string;
  title: string;
  description?: string;
  dateToRemember: string;
  frequency: "NEVER" | "MONTH" | "YEAR";
  completed: boolean;
  shouldExpire: boolean;
  profileId: string;
  userId: string;
  profileName?: string;
  profileImgUrl?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

const RemindersPage = () => {
  const { user } = useUser();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [selectedProfile, setSelectedProfile] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>(""); // "active", "completed", or ""
  const [showFilters, setShowFilters] = useState(false);

  const handleDeleteReminder = (reminderId: string) => {
    setReminders((prevReminders) =>
      prevReminders.filter((reminder) => reminder.id !== reminderId)
    );
  };

  const handleUpdateReminder = (updatedReminder: Reminder) => {
    setReminders((prevReminders) =>
      prevReminders.map((reminder) =>
        reminder.id === updatedReminder.id ? updatedReminder : reminder
      )
    );
  };

  // Get unique profiles for filter dropdown
  const uniqueProfiles = useMemo(() => {
    const profileMap = new Map();
    reminders.forEach(reminder => {
      if (reminder.profileName && reminder.profileId) {
        profileMap.set(reminder.profileId, {
          id: reminder.profileId,
          name: reminder.profileName,
          imgUrl: reminder.profileImgUrl
        });
      }
    });
    return Array.from(profileMap.values());
  }, [reminders]);

  // Filter reminders based on selected filters
  const filteredReminders = useMemo(() => {
    return reminders.filter(reminder => {
      const profileMatch = !selectedProfile || reminder.profileId === selectedProfile;
      const statusMatch = !statusFilter || 
        (statusFilter === "active" && !reminder.completed) ||
        (statusFilter === "completed" && reminder.completed);
      
      return profileMatch && statusMatch;
    });
  }, [reminders, selectedProfile, statusFilter]);

  // Clear all filters
  const clearFilters = () => {
    setSelectedProfile("");
    setStatusFilter("");
  };

  // Check if any filters are active
  const hasActiveFilters = selectedProfile || statusFilter;

  useEffect(() => {
    const fetchReminders = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/reminders/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setReminders(data || []);
        }
      } catch (error) {
        console.error("Failed to fetch reminders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 bg-gray-300 dark:bg-gray-700 rounded-lg"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-300 dark:bg-gray-800 p-6">
      <div className="mx-auto lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/dashboard">
              <ArrowLeft className="w-6 h-6 mr-4 text-gray-700 dark:text-gray-300 hover:text-violet-500 dark:hover:text-violet-400" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              My Reminders
            </h1>
          </div>
          
          {reminders.length > 0 && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 px-2 py-1 text-xs bg-violet-100 dark:bg-violet-900 text-violet-800 dark:text-violet-200 rounded-full">
                  {[selectedProfile ? '1' : '', statusFilter ? '1' : ''].filter(Boolean).length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && reminders.length > 0 && (
          <div className="mb-6 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Profile Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User className="inline w-4 h-4 mr-1" />
                  Filter by Profile
                </label>
                <select
                  value={selectedProfile}
                  onChange={(e) => setSelectedProfile(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                >
                  <option value="">All Profiles</option>
                  {uniqueProfiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <CheckCircle className="inline w-4 h-4 mr-1" />
                  Filter by Status
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStatusFilter(statusFilter === "active" ? "" : "active")}
                    className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${
                      statusFilter === "active"
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                        : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Clock className="inline w-4 h-4 mr-1" />
                    Active
                  </button>
                  <button
                    onClick={() => setStatusFilter(statusFilter === "completed" ? "" : "completed")}
                    className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${
                      statusFilter === "completed"
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200"
                        : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <CheckCircle className="inline w-4 h-4 mr-1" />
                    Completed
                  </button>
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors flex items-center"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear
                  </button>
                </div>
              )}
            </div>
            
            {/* Filter Summary */}
            {hasActiveFilters && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-2">
                  {selectedProfile && (
                    <span className="inline-flex items-center px-2 py-1 text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-200 rounded-full">
                      Profile: {uniqueProfiles.find(p => p.id === selectedProfile)?.name}
                      <button
                        onClick={() => setSelectedProfile("")}
                        className="ml-1 hover:text-violet-600 dark:hover:text-violet-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {statusFilter && (
                    <span className="inline-flex items-center px-2 py-1 text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-200 rounded-full">
                      Status: {statusFilter === "active" ? "Active" : "Completed"}
                      <button
                        onClick={() => setStatusFilter("")}
                        className="ml-1 hover:text-violet-600 dark:hover:text-violet-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results Summary */}
        {reminders.length > 0 && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredReminders.length} of {reminders.length} reminders
            </p>
            {hasActiveFilters && filteredReminders.length === 0 && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                No reminders match your current filters
              </p>
            )}
          </div>
        )}

        {reminders.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No reminders yet
            </h2>
            <p className="text-gray-500 dark:text-gray-500">
              Add some reminders to keep track of important dates and events.
            </p>
          </div>
        ) : filteredReminders.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No reminders found
            </h2>
            <p className="text-gray-500 dark:text-gray-500">
              {hasActiveFilters 
                ? "Try adjusting your filters to see more reminders."
                : "You don't have any reminders matching the current criteria."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 text-sm bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onDelete={handleDeleteReminder}
                onUpdate={handleUpdateReminder}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RemindersPage;
