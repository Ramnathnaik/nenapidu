//Create API for profile management
import { NextResponse } from "next/server";
import {
  createProfile,
  updateProfile,
  deleteProfile,
  getProfileById,
} from "@/app/utils/profileHelpers";
import { deleteRemindersByProfileId } from "@/app/utils/reminderHelpers";
import { deleteFromS3, extractFileNameFromS3Url } from "@/app/utils/s3";

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

    // First, get the profile data to check if there's an image to delete
    const profile = await getProfileById(profileId);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Delete the profile image from S3 if it exists
    let imageDeleted = false;
    if (profile.profileImgUrl) {
      try {
        const fileName = extractFileNameFromS3Url(profile.profileImgUrl);
        if (fileName) {
          imageDeleted = await deleteFromS3(fileName);
          if (imageDeleted) {
            console.log(`Successfully deleted profile image: ${fileName}`);
          } else {
            console.warn(`Failed to delete profile image: ${fileName}`);
          }
        }
      } catch (error) {
        console.error("Error deleting profile image from S3:", error);
        // Continue with profile deletion even if image deletion fails
      }
    }

    // Delete all associated reminders
    const remindersResult = await deleteRemindersByProfileId(profileId);
    
    if (!remindersResult.success) {
      return NextResponse.json(
        { error: "Failed to delete associated reminders" },
        { status: 500 }
      );
    }

    // Finally, delete the profile from the database
    const isDeleted = await deleteProfile(profileId);

    if (!isDeleted) {
      return NextResponse.json({ error: "Failed to delete profile from database" }, { status: 500 });
    }

    const responseMessage = `Profile deleted successfully. ${remindersResult.deletedCount} associated reminder(s) were also deleted.${profile.profileImgUrl ? (imageDeleted ? ' Profile image was also deleted from storage.' : ' Note: Profile image deletion from storage failed.') : ''}`;

    return NextResponse.json({ 
      message: responseMessage,
      deletedRemindersCount: remindersResult.deletedCount,
      imageDeleted: imageDeleted || !profile.profileImgUrl
    });
  } catch (error) {
    console.error("Failed to delete profile:", error);
    return NextResponse.json(
      { error: "Failed to delete profile" },
      { status: 500 }
    );
  }
}
