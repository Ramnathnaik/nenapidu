//Get a single profile by profileId
import { NextResponse } from "next/server";
import { getProfileById } from "@/app/utils/profileHelpers";

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
    
    const profile = await getProfileById(profileId);
    
    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }
      
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
