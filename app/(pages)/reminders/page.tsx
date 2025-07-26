"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Bell, Calendar, User } from "lucide-react";
import Image from "next/image";

interface Reminder {
  reminderId: number;
  description: string;
  dateToRemember: string;
  reminderType: string;
  completed: boolean;
  profileId: number;
  profileName?: string;
  profileImgUrl?: string;
}

const RemindersPage = () => {
  const { user } = useUser();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // const formatTime = (dateString: string) => {
  //   const date = new Date(dateString);
  //   return date.toLocaleTimeString("en-US", {
  //     hour: "numeric",
  //     minute: "2-digit",
  //     hour12: true,
  //   });
  // };

  const getReminderTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "birthday":
        return "🎂";
      case "anniversary":
        return "💖";
      case "meeting":
        return "🤝";
      case "call":
        return "📞";
      default:
        return "⏰";
    }
  };

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
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Bell className="w-8 h-8 mr-3 text-blue-600 dark:text-blue-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Reminders
          </h1>
        </div>

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
        ) : (
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <div
                key={reminder.reminderId}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 ${
                  !reminder.completed
                    ? "border-blue-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">
                        {getReminderTypeIcon(reminder.reminderType)}
                      </span>
                      <span className="inline-block px-2 py-1 text-xs font-medium text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-900 rounded-full mr-2">
                        {reminder.reminderType}
                      </span>
                      {reminder.completed ? (
                        <span className="inline-block px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-full">
                          Inactive
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 text-xs font-medium text-green-800 dark:text-green-200 bg-green-100 dark:bg-green-900 rounded-full">
                          Active
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {reminder.description}
                    </h3>

                    <div className="flex items-center text-gray-600 dark:text-gray-400 mb-3">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="mr-4">
                        {formatDate(reminder.dateToRemember)}
                      </span>
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RemindersPage;
