//Get all reminders for a specific profile
import { NextResponse } from "next/server";
import { getRemindersByProfileId } from "@/app/utils/reminderHelpers";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const profileId = url.pathname.split("/").pop();
    
    if (!profileId) {
      return NextResponse.json(
        { error: "Profile ID is required" }, 
        { status: 400 }
      );
    }
    
    // Validate profileId format (basic validation)
    if (profileId.trim().length === 0) {
      return NextResponse.json(
        { error: "Invalid Profile ID format" }, 
        { status: 400 }
      );
    }
    
    const reminders = await getRemindersByProfileId(profileId);
      
    return NextResponse.json(reminders);
  } catch (error) {
    console.error("Failed to fetch profile reminders:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile reminders" },
      { status: 500 }
    );
  }
}
