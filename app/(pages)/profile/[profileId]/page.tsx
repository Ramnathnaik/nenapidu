"use client";

import {
  ArrowLeft,
  Bell,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import swal from "@/app/utils/swal";
import ReminderAccordion from "@/app/components/ReminderAccordion";

interface Profile {
  profileId: string;
  profileName: string;
  profileDescription: string;
  profileImgUrl?: string | null;
  userId?: string;
}

interface Reminder {
  id: string;
  title: string;
  description?: string;
  dateToRemember: string;
  completed: boolean;
  frequency: "NEVER" | "MONTH" | "YEAR";
  shouldExpire: boolean;
  profileId: string;
  userId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

const ProfilePage = () => {
  const { profileId } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [remindersLoading, setRemindersLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedReminders, setExpandedReminders] = useState<Set<string>>(
    new Set()
  );
  const [deletingReminder, setDeletingReminder] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/profiles/profile/${profileId}`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else {
          const errorData = await response.json();
          console.error("Failed to fetch profile", errorData);
          setError(true);
          swal.error(
            "Failed to load profile",
            errorData.error || "Unknown error"
          );
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setError(true);
        swal.error(
          "Error loading profile",
          "Failed to load profile. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileId]);

  // Fetch reminders for the profile
  useEffect(() => {
    const fetchReminders = async () => {
      if (!profileId) {
        setRemindersLoading(false);
        return;
      }

      try {
        setRemindersLoading(true);
        const response = await fetch(`/api/reminders/profile/${profileId}`);
        if (response.ok) {
          const data = await response.json();
          setReminders(data);
        } else {
          console.error("Failed to fetch reminders");
          swal.error(
            "Error loading reminders",
            "Failed to load reminders for this profile."
          );
        }
      } catch (error) {
        console.error("Failed to fetch reminders:", error);
        swal.error(
          "Error loading reminders",
          "Failed to load reminders for this profile."
        );
      } finally {
        setRemindersLoading(false);
      }
    };

    fetchReminders();
  }, [profileId]);

  // Toggle reminder expansion
  const toggleReminderExpansion = (reminderId: string) => {
    const newExpanded = new Set(expandedReminders);
    if (newExpanded.has(reminderId)) {
      newExpanded.delete(reminderId);
    } else {
      newExpanded.add(reminderId);
    }
    setExpandedReminders(newExpanded);
  };

  // Handle edit reminder
  const handleEditReminder = (reminderId: string) => {
    router.push(`/reminder/${reminderId}/edit`);
  };

  // Handle delete reminder
  const handleDeleteReminder = async (reminderId: string) => {
    const result = await swal.warning(
      "Delete Reminder?",
      "Are you sure you want to delete this reminder? This action cannot be undone.",
      "Yes, delete it!",
      "Cancel"
    );

    if (!result.isConfirmed) {
      return;
    }

    setDeletingReminder(reminderId);
    swal.loading(
      "Deleting reminder...",
      "Please wait while we delete the reminder."
    );

    try {
      const response = await fetch("/api/reminders", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: reminderId }),
      });

      if (response.ok) {
        setReminders(reminders.filter((r) => r.id !== reminderId));
        swal.success(
          "Reminder deleted!",
          "The reminder has been deleted successfully."
        );
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete reminder");
      }
    } catch (error) {
      console.error("Failed to delete reminder:", error);
      let message = "Failed to delete reminder";
      if (error instanceof Error) {
        message = error.message;
      }
      swal.error("Deletion failed", message, 5000);
    } finally {
      setDeletingReminder(null);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Get frequency display text
  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case "NEVER":
        return "One-time";
      case "MONTH":
        return "Monthly";
      case "YEAR":
        return "Yearly";
      default:
        return frequency;
    }
  };

  return (
    <main className="flex-1 p-8 h-full overflow-y-auto bg-gray-300 dark:bg-gray-800">
      <div className="flex items-center mb-8">
        <Link href="/dashboard">
          <ArrowLeft className="w-6 h-6 mr-4 text-gray-700 dark:text-gray-300 hover:text-violet-500 dark:hover:text-violet-400" />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Profile Details
        </h1>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              Loading profile...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-md p-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Profile Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The profile you&#39;re looking for could not be loaded. It may
              have been deleted or you may not have permission to view it.
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      ) : profile ? (
        <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-md p-8 md:p-12">
          <div className="max-w-2xl mx-auto">
            {/* Profile Image Section */}
            <div className="text-center mb-8">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">
                Profile Image
              </h3>
              <div className="flex justify-center mb-6">
                <div className="relative w-32 h-32">
                  <Image
                    src={profile.profileImgUrl || "/default-profile.png"}
                    alt="Profile image"
                    fill
                    className="rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.src = "/default-profile.png";
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                {profile.profileName}
              </h2>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                  Description
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {profile.profileDescription || "No description provided."}
                </p>
              </div>
            </div>

            {/* Reminders Section */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Reminders ({reminders.length})
                </h2>
                <Link
                  href={`/reminder/add?profileId=${
                    profile.profileId
                  }&profileName=${encodeURIComponent(profile.profileName)}`}
                  className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors text-sm font-medium"
                >
                  Add Reminder
                </Link>
              </div>

              {remindersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">
                    Loading reminders...
                  </span>
                </div>
              ) : reminders.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    No reminders yet
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Create your first reminder for this profile
                  </p>
                </div>
              ) : (
                <ReminderAccordion
                  reminders={reminders}
                  expandedReminders={expandedReminders}
                  deletingReminder={deletingReminder}
                  onToggleExpansion={toggleReminderExpansion}
                  onEdit={handleEditReminder}
                  onDelete={handleDeleteReminder}
                  formatDate={formatDate}
                  getFrequencyText={getFrequencyText}
                />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
};

export default ProfilePage;
