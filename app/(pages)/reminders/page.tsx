"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Bell, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ReminderCard from "@/app/components/ReminderCard";

interface Reminder {
  id: number;
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

  const handleDeleteReminder = (reminderId: number) => {
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
        <div className="flex items-center mb-6">
          <Link href="/dashboard">
            <ArrowLeft className="w-6 h-6 mr-4 text-gray-700 dark:text-gray-300 hover:text-violet-500 dark:hover:text-violet-400" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
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
