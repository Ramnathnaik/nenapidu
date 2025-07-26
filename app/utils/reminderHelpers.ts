import db from "@/db";
import { remindersTable, profileTable } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { FrequencyType } from "@/app/types/reminder";

export interface CreateReminderData {
  title: string;
  description?: string | null;
  dateToRemember: string;
  completed: boolean;
  shouldExpire: boolean;
  frequency: FrequencyType;
  userId: string;
  profileId?: string | null;
}

export interface UpdateReminderData {
  title?: string;
  description?: string | null;
  dateToRemember?: string;
  completed?: boolean;
  shouldExpire?: boolean;
  frequency?: FrequencyType;
  userId?: string;
  profileId?: string | null;
}

/**
 * Creates a new reminder record in the database
 * @param reminderData - Reminder data to create
 * @returns Promise<Reminder | null> - The created reminder or null if creation failed
 */
export async function createReminder(reminderData: CreateReminderData) {
  try {
    const newReminder = await db
      .insert(remindersTable)
      .values({
        title: reminderData.title,
        description: reminderData.description || null,
        dateToRemember: reminderData.dateToRemember,
        completed: reminderData.completed,
        shouldExpire: reminderData.shouldExpire,
        frequency: reminderData.frequency,
        userId: reminderData.userId,
        profileId: reminderData.profileId || null,
      })
      .returning();

    console.log("New reminder created:", newReminder[0]);
    return newReminder[0];
  } catch (error) {
    console.error("Error creating reminder:", error);
    return null;
  }
}

/**
 * Updates an existing reminder record in the database
 * @param reminderId - The reminder ID
 * @param updateData - Data to update
 * @returns Promise<Reminder | null> - The updated reminder or null if update failed
 */
export async function updateReminder(
  reminderId: string,
  updateData: UpdateReminderData
) {
  try {
    const updatedReminder = await db
      .update(remindersTable)
      .set(updateData)
      .where(eq(remindersTable.id, reminderId))
      .returning();

    if (updatedReminder.length === 0) {
      console.log(`Reminder with ID ${reminderId} not found for update`);
      return null;
    }

    console.log("Reminder updated:", updatedReminder[0]);
    return updatedReminder[0];
  } catch (error) {
    console.error("Error updating reminder:", error);
    return null;
  }
}

/**
 * Gets a reminder by its ID
 * @param reminderId - The reminder ID
 * @returns Promise<Reminder | null> - The reminder or null if not found
 */
export async function getReminderById(reminderId: string) {
  try {
    const reminder = await db
      .select()
      .from(remindersTable)
      .where(eq(remindersTable.id, reminderId))
      .limit(1);

    return reminder.length > 0 ? reminder[0] : null;
  } catch (error) {
    console.error("Error getting reminder:", error);
    return null;
  }
}

/**
 * Gets all reminders for a specific user
 * @param userId - The user ID
 * @returns Promise<Reminder[]> - Array of reminders for the user
 */
export async function getRemindersByUserId(userId: string) {
  try {
    const reminders = await db
      .select()
      .from(remindersTable)
      .where(eq(remindersTable.userId, userId));

    return reminders;
  } catch (error) {
    console.error("Error getting reminders by user ID:", error);
    return [];
  }
}

/**
 * Gets all reminders for a specific user with their associated profile information
 * @param userId - The user ID
 * @returns Promise<Array> - Array of reminders with profile data
 */
export async function getRemindersByUserIdWithProfile(userId: string) {
  try {
    const remindersWithProfiles = await db
      .select({
        id: remindersTable.id,
        title: remindersTable.title,
        description: remindersTable.description,
        dateToRemember: remindersTable.dateToRemember,
        completed: remindersTable.completed,
        shouldExpire: remindersTable.shouldExpire,
        frequency: remindersTable.frequency,
        userId: remindersTable.userId,
        profileId: remindersTable.profileId,
        // createdAt: remindersTable.createdAt, // Uncomment if column exists
        // updatedAt: remindersTable.updatedAt, // Uncomment if column exists
        profileName: profileTable.profileName,
        profileImgUrl: profileTable.profileImgUrl,
      })
      .from(remindersTable)
      .leftJoin(
        profileTable,
        eq(remindersTable.profileId, profileTable.profileId)
      )
      .where(eq(remindersTable.userId, userId));

    return remindersWithProfiles;
  } catch (error) {
    console.error("Error getting reminders with profile data:", error);
    return [];
  }
}

/**
 * Gets all reminders for a specific profile
 * @param profileId - The profile ID
 * @returns Promise<Reminder[]> - Array of reminders for the profile
 */
export async function getRemindersByProfileId(profileId: string) {
  try {
    const reminders = await db
      .select()
      .from(remindersTable)
      .where(eq(remindersTable.profileId, profileId));

    return reminders;
  } catch (error) {
    console.error("Error getting reminders by profile ID:", error);
    return [];
  }
}

/**
 * Gets all reminders for a specific user and profile combination
 * @param userId - The user ID
 * @param profileId - The profile ID
 * @returns Promise<Reminder[]> - Array of reminders for the user and profile
 */
export async function getRemindersByUserAndProfile(
  userId: string,
  profileId: string
) {
  try {
    const reminders = await db
      .select()
      .from(remindersTable)
      .where(
        and(
          eq(remindersTable.userId, userId),
          eq(remindersTable.profileId, profileId)
        )
      );

    return reminders;
  } catch (error) {
    console.error("Error getting reminders by user and profile ID:", error);
    return [];
  }
}

/**
 * Gets all reminders for a specific user that are not associated with any profile
 * @param userId - The user ID
 * @returns Promise<Reminder[]> - Array of reminders for the user without profile association
 */
export async function getPersonalRemindersByUserId(userId: string) {
  try {
    const reminders = await db
      .select()
      .from(remindersTable)
      .where(
        and(eq(remindersTable.userId, userId), isNull(remindersTable.profileId))
      );

    return reminders;
  } catch (error) {
    console.error("Error getting personal reminders by user ID:", error);
    return [];
  }
}

/**
 * Deletes a reminder by its ID
 * @param reminderId - The reminder ID
 * @returns Promise<boolean> - Whether the deletion was successful
 */
export async function deleteReminder(reminderId: string) {
  try {
    const deletedReminder = await db
      .delete(remindersTable)
      .where(eq(remindersTable.id, reminderId))
      .returning();

    if (deletedReminder.length === 0) {
      console.log(`Reminder with ID ${reminderId} not found for deletion`);
      return false;
    }

    console.log("Reminder deleted:", deletedReminder[0]);
    return true;
  } catch (error) {
    console.error("Error deleting reminder:", error);
    return false;
  }
}

/**
 * Deletes all reminders associated with a specific profile
 * @param profileId - The profile ID
 * @returns Promise<{success: boolean, deletedCount: number}> - Deletion result with count
 */
export async function deleteRemindersByProfileId(profileId: string): Promise<{success: boolean, deletedCount: number}> {
  try {
    const deletedReminders = await db
      .delete(remindersTable)
      .where(eq(remindersTable.profileId, profileId))
      .returning();

    const deletedCount = deletedReminders.length;
    console.log(`Deleted ${deletedCount} reminders for profile ${profileId}`);
    
    return {
      success: true,
      deletedCount
    };
  } catch (error) {
    console.error("Error deleting reminders by profile ID:", error);
    return {
      success: false,
      deletedCount: 0
    };
  }
}

/**
 * Checks if a reminder exists in the database
 * @param reminderId - The reminder ID
 * @returns Promise<boolean> - Whether the reminder exists
 */
export async function reminderExists(reminderId: string): Promise<boolean> {
  try {
    const reminder = await getReminderById(reminderId);
    return reminder !== null;
  } catch (error) {
    console.error("Error checking if reminder exists:", error);
    return false;
  }
}
