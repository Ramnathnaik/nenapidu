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
}

// Frequency descriptions for UI components
export const FREQUENCY_OPTIONS = [
  { value: "NEVER", label: "Never (One-time only)", description: "This reminder will not repeat" },
  { value: "MONTH", label: "Monthly", description: "This reminder will repeat every month" },
  { value: "YEAR", label: "Yearly", description: "This reminder will repeat every year" },
] as const;

// Helper function to validate frequency
export function isValidFrequency(frequency: string): frequency is FrequencyType {
  return ["NEVER", "MONTH", "YEAR"].includes(frequency);
}
