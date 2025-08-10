//Create API to get all favourites
import {
  createFavourite,
  deleteFavourite,
  updateFavourite,
  getAllFavouritesWithProfile,
} from "@/app/utils/favouriteHelpers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const favourites = await getAllFavouritesWithProfile();
    return NextResponse.json(favourites);
  } catch (error) {
    console.error("Failed to fetch favourites:", error);
    return NextResponse.json(
      { error: "Failed to fetch favourites" },
      { status: 500 }
    );
  }
}

//Create API to create a new favourite
export async function POST(request: Request) {
  try {
    const { title, description, userId, profileId } = await request.json();

    // Validate required fields
    if (!title || !userId || !profileId) {
      return NextResponse.json(
        {
          error: "Missing required fields: title, userId, profileId",
        },
        { status: 400 }
      );
    }

    const newFavourite = await createFavourite({
      title,
      description,
      userId,
      profileId,
    });

    if (!newFavourite) {
      return NextResponse.json(
        { error: "Failed to create favourite" },
        { status: 500 }
      );
    }

    return NextResponse.json(newFavourite);
  } catch (error) {
    console.error("Failed to create favourite:", error);
    return NextResponse.json(
      { error: "Failed to create favourite" },
      { status: 500 }
    );
  }
}

//Create API to update a favourite
export async function PUT(request: Request) {
  try {
    const { id, title, description, userId, profileId } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Missing favourite id" },
        { status: 400 }
      );
    }

    type UpdateFavouriteData = {
      title?: string;
      description?: string;
      userId?: string;
      profileId?: string;
    };

    const updateData: UpdateFavouriteData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (userId !== undefined) updateData.userId = userId;
    if (profileId !== undefined) updateData.profileId = profileId;

    const updatedFavourite = await updateFavourite(id, updateData);

    if (!updatedFavourite) {
      return NextResponse.json(
        { error: "Favourite not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedFavourite);
  } catch (error) {
    console.error("Failed to update favourite:", error);
    return NextResponse.json(
      { error: "Failed to update favourite" },
      { status: 500 }
    );
  }
}

//Create API to delete a favourite
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "Missing favourite id" },
        { status: 400 }
      );
    }

    const isDeleted = await deleteFavourite(id);

    if (!isDeleted) {
      return NextResponse.json(
        { error: "Favourite not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Favourite deleted successfully" });
  } catch (error) {
    console.error("Failed to delete favourite:", error);
    return NextResponse.json(
      { error: "Failed to delete favourite" },
      { status: 500 }
    );
  }
}
