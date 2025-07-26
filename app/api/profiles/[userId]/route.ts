//Get all profiles for a specific user
import { NextResponse } from "next/server";
import { getProfilesByUserId } from "@/app/utils/profileHelpers";

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
    
    const profiles = await getProfilesByUserId(userId);
      
    return NextResponse.json(profiles);
  } catch (error) {
    console.error("Failed to fetch user profiles:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profiles" },
      { status: 500 }
    );
  }
}
