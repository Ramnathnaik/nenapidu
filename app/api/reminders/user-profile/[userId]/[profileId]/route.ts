//Get all reminders for a specific user and profile combination
import { NextResponse } from "next/server";
import { getRemindersByUserAndProfile } from "@/app/utils/reminderHelpers";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const profileId = pathSegments.pop();
    const userId = pathSegments.pop();
    
    if (!userId || !profileId) {
      return NextResponse.json(
        { error: "Both User ID and Profile ID are required" }, 
        { status: 400 }
      );
    }
    
    // Validate userId and profileId format (basic validation)
    if (userId.trim().length === 0 || profileId.trim().length === 0) {
      return NextResponse.json(
        { error: "Invalid User ID or Profile ID format" }, 
        { status: 400 }
      );
    }
    
    const reminders = await getRemindersByUserAndProfile(userId, profileId);
      
    return NextResponse.json(reminders);
  } catch (error) {
    console.error("Failed to fetch reminders by user and profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch reminders by user and profile" },
      { status: 500 }
    );
  }
}
