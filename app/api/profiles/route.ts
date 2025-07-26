//Create API for profile management
import { NextResponse } from "next/server";
import {
  createProfile,
  updateProfile,
  deleteProfile,
} from "@/app/utils/profileHelpers";

//Create API to create a new profile
export async function POST(request: Request) {
  try {
    const { profileName, profileDescription, userId } = await request.json();

    // Validate required fields
    if (!profileName || !userId) {
      return NextResponse.json(
        {
          error: "Missing required fields: profileName, userId",
        },
        { status: 400 }
      );
    }

    const newProfile = await createProfile({
      profileName,
      profileDescription,
      userId,
    });

    if (!newProfile) {
      return NextResponse.json(
        { error: "Failed to create profile" },
        { status: 500 }
      );
    }

    return NextResponse.json(newProfile);
  } catch (error) {
    console.error("Failed to create profile:", error);
    return NextResponse.json(
      { error: "Failed to create profile" },
      { status: 500 }
    );
  }
}

//Create API to update a profile
export async function PUT(request: Request) {
  try {
    const { profileId, profileName, profileDescription, profileImgUrl } =
      await request.json();

    if (!profileId) {
      return NextResponse.json(
        { error: "Missing profile id" },
        { status: 400 }
      );
    }

    const updateData: {
      profileName?: string;
      profileDescription?: string;
      profileImgUrl?: string;
    } = {};
    if (profileName !== undefined) updateData.profileName = profileName;
    if (profileDescription !== undefined)
      updateData.profileDescription = profileDescription;
    if (profileImgUrl !== undefined) updateData.profileImgUrl = profileImgUrl;

    const updatedProfile = await updateProfile(profileId, updateData);

    if (!updatedProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("Failed to update profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

//Create API to delete a profile
export async function DELETE(request: Request) {
  try {
    const { profileId } = await request.json();
    if (!profileId) {
      return NextResponse.json(
        { error: "Missing profile id" },
        { status: 400 }
      );
    }

    const isDeleted = await deleteProfile(profileId);

    if (!isDeleted) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Failed to delete profile:", error);
    return NextResponse.json(
      { error: "Failed to delete profile" },
      { status: 500 }
    );
  }
}
