//Get all reminders for a specific user
import { NextResponse } from "next/server";
import { getRemindersByUserIdWithProfile } from "@/app/utils/reminderHelpers";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.pathname.split("/").pop();
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" }, 
        { status: 400 }
      );
    }
    
    // Validate userId format (basic validation)
    if (userId.trim().length === 0) {
      return NextResponse.json(
        { error: "Invalid User ID format" }, 
        { status: 400 }
      );
    }
    
    const reminders = await getRemindersByUserIdWithProfile(userId);
      
    return NextResponse.json(reminders);
  } catch (error) {
    console.error("Failed to fetch user reminders:", error);
    return NextResponse.json(
      { error: "Failed to fetch user reminders" },
      { status: 500 }
    );
  }
}
