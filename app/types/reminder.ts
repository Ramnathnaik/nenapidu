// TypeScript type definitions for reminder-related types

export type FrequencyType = "NEVER" | "MONTH" | "YEAR";

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dateToRemember: string;
  completed: boolean;
  shouldExpire: boolean;
  frequency: FrequencyType;
  userId: string;
  profileId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewReminder {
  title: string;
  description?: string;
  dateToRemember: string;
  completed: boolean;
  shouldExpire: boolean;
  frequency: FrequencyType;
  userId: string;
  profileId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UpdateReminder {
  id: string;
  title?: string;
  description?: string;
  dateToRemember?: string;
  completed?: boolean;
  shouldExpire?: boolean;
  frequency?: FrequencyType;
  userId?: string;
  profileId?: string;
  updatedAt?: Date;
}

// Frequency descriptions for UI components
export const FREQUENCY_OPTIONS = [
  { value: "NEVER", label: "Never (One-time only)", description: "This reminder will not repeat and will expire after the date passes" },
  { value: "MONTH", label: "Monthly", description: "This reminder will repeat every month and will not expire" },
  { value: "YEAR", label: "Yearly", description: "This reminder will repeat every year and will not expire" },
] as const;

// Helper function to validate frequency
export function isValidFrequency(frequency: string): frequency is FrequencyType {
  return ["NEVER", "MONTH", "YEAR"].includes(frequency);
}
