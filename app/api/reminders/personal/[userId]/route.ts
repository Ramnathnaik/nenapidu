//Get all personal reminders for a specific user (not associated with any profile)
import { NextResponse } from "next/server";
import { getPersonalRemindersByUserId } from "@/app/utils/reminderHelpers";

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
    
    const reminders = await getPersonalRemindersByUserId(userId);
      
    return NextResponse.json(reminders);
  } catch (error) {
    console.error("Failed to fetch personal reminders:", error);
    return NextResponse.json(
      { error: "Failed to fetch personal reminders" },
      { status: 500 }
    );
  }
}
