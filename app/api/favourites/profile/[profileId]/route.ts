import { getFavouritesByProfileId } from "@/app/utils/favouriteHelpers";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { profileId: string } }
) {
  try {
    const { profileId } = params;
    
    if (!profileId) {
      return NextResponse.json(
        { error: "Profile ID is required" },
        { status: 400 }
      );
    }

    const favourites = await getFavouritesByProfileId(profileId);
    return NextResponse.json(favourites);
  } catch (error) {
    console.error("Failed to fetch favourites:", error);
    return NextResponse.json(
      { error: "Failed to fetch favourites" },
      { status: 500 }
    );
  }
}
