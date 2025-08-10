import { getFavouritesByUserIdWithProfile } from "@/app/utils/favouriteHelpers";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const favourites = await getFavouritesByUserIdWithProfile(userId);
    return NextResponse.json(favourites);
  } catch (error) {
    console.error("Failed to fetch favourites:", error);
    return NextResponse.json(
      { error: "Failed to fetch favourites" },
      { status: 500 }
    );
  }
}
