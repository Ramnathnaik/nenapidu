//Get a single reminder by ID
import { NextResponse } from "next/server";
import { getReminderById } from "@/app/utils/reminderHelpers";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();
    
    if (!id) {
      return NextResponse.json(
        { error: "Reminder ID is required" }, 
        { status: 400 }
      );
    }
    
    // Validate ID format (basic validation)
    if (id.trim().length === 0) {
      return NextResponse.json(
        { error: "Invalid Reminder ID format" }, 
        { status: 400 }
      );
    }
    
    const reminder = await getReminderById(id);
    
    if (!reminder) {
      return NextResponse.json(
        { error: "Reminder not found" }, 
        { status: 404 }
      );
    }
      
    return NextResponse.json(reminder);
  } catch (error) {
    console.error("Failed to fetch reminder:", error);
    return NextResponse.json(
      { error: "Failed to fetch reminder" },
      { status: 500 }
    );
  }
}
