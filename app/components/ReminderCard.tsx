"use client";

import { useState } from "react";
import { Calendar, User, Edit, Trash2, MoreVertical } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import swal from "@/app/utils/swal";

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

interface ReminderCardProps {
  reminder: Reminder;
  onDelete: (id: string) => void;
  onUpdate: (updatedReminder: Reminder) => void;
}

const ReminderCard = ({ reminder, onDelete, onUpdate }: ReminderCardProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency?.toLowerCase()) {
      case "never":
        return "⏰";
      case "month":
        return "📅";
      case "year":
        return "🗓️";
      default:
        return "⏰";
    }
  };

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

  const handleDelete = async () => {
    const result = await swal.warning(
      'Delete Reminder?',
      'Are you sure you want to delete this reminder? This action cannot be undone.',
      'Yes, delete it!',
      'Cancel'
    );

    if (!result.isConfirmed) {
      return;
    }

    setIsDeleting(true);
    
    // Show loading alert
    swal.loading('Deleting...', 'Please wait while we delete your reminder.');

    try {
      const response = await fetch('/api/reminders', {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: reminder.id }),
      });

      if (response.ok) {
        await swal.success('Deleted!', 'Reminder deleted successfully!', 2000);
        onDelete(reminder.id);
      } else {
        const errorData = await response.json();
        await swal.error('Error!', `Failed to delete reminder: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Failed to delete reminder:", error);
      await swal.error('Error!', 'An unexpected error occurred while deleting the reminder.');
    } finally {
      setIsDeleting(false);
      setShowDropdown(false);
    }
  };

  const toggleComplete = async () => {
    // Show loading alert
    swal.loading('Updating...', 'Please wait while we update your reminder.');

    try {
      const response = await fetch('/api/reminders', {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: reminder.id,
          completed: !reminder.completed,
        }),
      });

      if (response.ok) {
        const updatedReminder = await response.json();
        await swal.success('Updated!', `Reminder marked as ${updatedReminder.completed ? "completed" : "active"}!`, 2000);
        onUpdate(updatedReminder);
      } else {
        const errorData = await response.json();
        await swal.error('Error!', `Failed to update reminder: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Failed to update reminder:", error);
      await swal.error('Error!', 'An unexpected error occurred while updating the reminder.');
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 border-l-4 ${
        !reminder.completed
          ? "border-blue-500"
          : "border-gray-300 dark:border-gray-600"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">
              {getFrequencyIcon(reminder.frequency)}
            </span>
            <span className="inline-block px-2 py-1 text-xs font-medium text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-900 rounded-full mr-2">
              {getFrequencyText(reminder.frequency)}
            </span>
            {reminder.completed ? (
              <span className="inline-block px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-full">
                Completed
              </span>
            ) : (
              <span className="inline-block px-2 py-1 text-xs font-medium text-green-800 dark:text-green-200 bg-green-100 dark:bg-green-900 rounded-full">
                Active
              </span>
            )}
          </div>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {reminder.title}
          </h3>
          {reminder.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {reminder.description}
            </p>
          )}

          <div className="flex items-center text-gray-600 dark:text-gray-400 mb-3">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="mr-4">{formatDate(reminder.dateToRemember)}</span>
          </div>

          {reminder.profileName && (
            <div className="flex items-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <User className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
                Related to:
              </span>
              <div className="flex items-center">
                {reminder.profileImgUrl && (
                  <div className="relative w-6 h-6 mr-2">
                    <Image
                      src={reminder.profileImgUrl}
                      alt={reminder.profileName}
                      width={24}
                      height={24}
                      className="rounded-full object-cover"
                    />
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {reminder.profileName}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Actions Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            disabled={isDeleting}
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1">
                <Link
                  href={`/reminder/${reminder.id}/edit`}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setShowDropdown(false)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Reminder
                </Link>
                <button
                  onClick={toggleComplete}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Mark as {reminder.completed ? "Active" : "Completed"}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isDeleting ? "Deleting..." : "Delete Reminder"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default ReminderCard;
