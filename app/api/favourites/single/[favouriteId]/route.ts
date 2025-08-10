import { getFavouriteById } from "@/app/utils/favouriteHelpers";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ favouriteId: string }> }
) {
  try {
    const { favouriteId } = await params;
    
    if (!favouriteId) {
      return NextResponse.json(
        { error: "Favourite ID is required" },
        { status: 400 }
      );
    }

    const favourite = await getFavouriteById(favouriteId);
    
    if (!favourite) {
      return NextResponse.json(
        { error: "Favourite not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(favourite);
  } catch (error) {
    console.error("Failed to fetch favourite:", error);
    return NextResponse.json(
      { error: "Failed to fetch favourite" },
      { status: 500 }
    );
  }
}
