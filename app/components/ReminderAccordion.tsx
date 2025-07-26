"use client";

import {
  Edit,
  Trash,
  ChevronDown,
  ChevronRight,
  Calendar,
  User as UserIcon,
  Clock,
} from "lucide-react";

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
  createdAt: string;
  updatedAt: string;
}

interface ReminderAccordionProps {
  reminders: Reminder[];
  expandedReminders: Set<string>;
  deletingReminder: string | null;
  onToggleExpansion: (reminderId: string) => void;
  onEdit: (reminderId: string) => void;
  onDelete: (reminderId: string) => void;
  formatDate: (dateString: string) => string;
  getFrequencyText: (frequency: string) => string;
}

const ReminderAccordion: React.FC<ReminderAccordionProps> = ({
  reminders,
  expandedReminders,
  deletingReminder,
  onToggleExpansion,
  onEdit,
  onDelete,
  formatDate,
  getFrequencyText,
}) => {
  return (
    <div className="space-y-3">
      {reminders.map((reminder) => {
        const isExpanded = expandedReminders.has(reminder.id);
        const isDeleting = deletingReminder === reminder.id;

        return (
          <div
            key={reminder.id}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
          >
            {/* Reminder Header */}
            <div
              onClick={() => onToggleExpansion(reminder.id)}
              className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {reminder.title}
                    </h3>
                  </div>
                  {reminder.completed && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded-full">
                      Completed
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(reminder.dateToRemember)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(reminder.id);
                      }}
                      className="p-1.5 text-gray-500 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded transition-colors"
                      title="Edit reminder"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(reminder.id);
                      }}
                      disabled={isDeleting}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                      title="Delete reminder"
                    >
                      {isDeleting ? (
                        <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
                      ) : (
                        <Trash className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Reminder Details (Expanded) */}
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
                <div className="pt-4 space-y-3">
                  {reminder.description && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {reminder.description}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Frequency:
                        </span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {getFrequencyText(reminder.frequency)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Due Date:
                        </span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatDate(reminder.dateToRemember)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-gray-500" />
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Status:
                        </span>
                        <p
                          className={`font-medium ${
                            reminder.completed
                              ? "text-green-600 dark:text-green-400"
                              : "text-orange-600 dark:text-orange-400"
                          }`}
                        >
                          {reminder.completed ? "Completed" : "Pending"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
                    Created: {formatDate(reminder.dateToRemember)} •
                    Updated: {formatDate(reminder.dateToRemember)}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ReminderAccordion;
