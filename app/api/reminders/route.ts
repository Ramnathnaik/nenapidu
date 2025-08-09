//Create API to get all reminders
import { isValidFrequency } from "@/app/types/reminder";
import {
  createReminder,
  deleteReminder,
  updateReminder,
} from "@/app/utils/reminderHelpers";
import db from "@/db";
import { remindersTable } from "@/db/schema";
import { NextResponse } from "next/server";
import type { FrequencyType } from "@/app/types/reminder";

export async function GET() {
  try {
    const reminders = await db.select().from(remindersTable);
    return NextResponse.json(reminders);
  } catch (error) {
    console.error("Failed to fetch reminders:", error);
    return NextResponse.json(
      { error: "Failed to fetch reminders" },
      { status: 500 }
    );
  }
}

//Create API to create a new reminder
export async function POST(request: Request) {
  try {
    const {
      title,
      description,
      dateToRemember,
      completed,
      userId,
      frequency,
      profileId,
    } = await request.json();

    // Validate required fields
    if (
      !title ||
      !dateToRemember ||
      typeof completed !== "boolean" ||
      !userId ||
      !frequency
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: title, dateToRemember, completed, userId, frequency",
        },
        { status: 400 }
      );
    }

    // Validate frequency enum using helper function
    // NEVER: Non-recurring reminder (one-time only) - should expire after date passes
    // MONTH: Recurring monthly reminder - should not expire
    // YEAR: Recurring yearly reminder - should not expire
    if (!isValidFrequency(frequency)) {
      return NextResponse.json(
        {
          error:
            "Invalid frequency. Must be either 'NEVER', 'MONTH', or 'YEAR'",
        },
        { status: 400 }
      );
    }

    // Automatically determine shouldExpire based on frequency
    // If frequency is NEVER, reminder should expire after the date passes
    // If frequency is MONTH or YEAR, reminder should not expire (recurring)
    const shouldExpire = frequency === "NEVER";

    const newReminder = await createReminder({
      title,
      description,
      dateToRemember,
      completed,
      userId,
      shouldExpire,
      frequency,
      profileId,
    });

    if (!newReminder) {
      return NextResponse.json(
        { error: "Failed to create reminder" },
        { status: 500 }
      );
    }

    return NextResponse.json(newReminder);
  } catch (error) {
    console.error("Failed to create reminder:", error);
    return NextResponse.json(
      { error: "Failed to create reminder" },
      { status: 500 }
    );
  }
}

//Create API to update a reminder
export async function PUT(request: Request) {
  try {
    const {
      id,
      title,
      description,
      dateToRemember,
      completed,
      userId,
      frequency,
      profileId,
    } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "Missing reminder id" },
        { status: 400 }
      );
    }

    // Validate frequency if provided using helper function
    // NEVER: Non-recurring reminder (one-time only) - should expire after date passes
    // MONTH: Recurring monthly reminder - should not expire
    // YEAR: Recurring yearly reminder - should not expire
    if (frequency !== undefined && !isValidFrequency(frequency)) {
      return NextResponse.json(
        {
          error:
            "Invalid frequency. Must be either 'NEVER', 'MONTH', or 'YEAR'",
        },
        { status: 400 }
      );
    }

    type UpdateReminderData = {
      title?: string;
      description?: string;
      dateToRemember?: string;
      completed?: boolean;
      userId?: string;
      shouldExpire?: boolean;
      frequency?: FrequencyType;
      profileId?: string;
    };
    const updateData: UpdateReminderData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dateToRemember !== undefined)
      updateData.dateToRemember = dateToRemember;
    if (completed !== undefined) updateData.completed = completed;
    if (userId !== undefined) updateData.userId = userId;
    if (frequency !== undefined) {
      updateData.frequency = frequency as FrequencyType;
      // Automatically determine shouldExpire based on frequency
      // If frequency is NEVER, reminder should expire after the date passes
      // If frequency is MONTH or YEAR, reminder should not expire (recurring)
      updateData.shouldExpire = frequency === "NEVER";
    }
    if (profileId !== undefined) updateData.profileId = profileId;

    const updatedReminder = await updateReminder(id, updateData);

    if (!updatedReminder) {
      return NextResponse.json(
        { error: "Reminder not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedReminder);
  } catch (error) {
    console.error("Failed to update reminder:", error);
    return NextResponse.json(
      { error: "Failed to update reminder" },
      { status: 500 }
    );
  }
}

//Create API to delete a reminder
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "Missing reminder id" },
        { status: 400 }
      );
    }

    const isDeleted = await deleteReminder(id);

    if (!isDeleted) {
      return NextResponse.json(
        { error: "Reminder not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Reminder deleted successfully" });
  } catch (error) {
    console.error("Failed to delete reminder:", error);
    return NextResponse.json(
      { error: "Failed to delete reminder" },
      { status: 500 }
    );
  }
}
