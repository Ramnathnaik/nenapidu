import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3, generateProfileImageFileName, deleteFromS3, extractFileNameFromS3Url } from '@/app/utils/s3';
import { updateProfile, getProfileById } from '@/app/utils/profileHelpers';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const profileId = formData.get('profileId') as string;
    const userId = formData.get('userId') as string;

    if (!file || !profileId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: file, profileId, userId' },
        { status: 400 }
      );
    }

    // Validate file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.' },
        { status: 400 }
      );
    }

    if (file.size > maxSizeInBytes) {
      return NextResponse.json(
        { error: 'File size too large. Please upload an image smaller than 5MB.' },
        { status: 400 }
      );
    }

    // Get current profile to check for existing image
    const existingProfile = await getProfileById(profileId);
    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Delete existing image if it exists
    if (existingProfile.profileImgUrl) {
      const existingFileName = extractFileNameFromS3Url(existingProfile.profileImgUrl);
      if (existingFileName) {
        await deleteFromS3(`profiles/${userId}/${profileId}/${existingFileName}`);
      }
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique file name
    const fileName = generateProfileImageFileName(userId, profileId, file.name);

    // Upload to S3
    const imageUrl = await uploadToS3(buffer, fileName, file.type);

    // Update profile with new image URL
    const updatedProfile = await updateProfile(profileId, {
      profileImgUrl: imageUrl
    });

    if (!updatedProfile) {
      return NextResponse.json(
        { error: 'Failed to update profile with image URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Image uploaded successfully',
      profileImgUrl: imageUrl,
      profile: updatedProfile
    });

  } catch (error) {
    console.error('Error uploading profile image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { profileId, userId } = await request.json();

    if (!profileId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: profileId, userId' },
        { status: 400 }
      );
    }

    // Get current profile
    const existingProfile = await getProfileById(profileId);
    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Delete existing image if it exists
    if (existingProfile.profileImgUrl) {
      const existingFileName = extractFileNameFromS3Url(existingProfile.profileImgUrl);
      if (existingFileName) {
        await deleteFromS3(`profiles/${userId}/${profileId}/${existingFileName}`);
      }

      // Update profile to remove image URL
      const updatedProfile = await updateProfile(profileId, {
        profileImgUrl: null
      });

      if (!updatedProfile) {
        return NextResponse.json(
          { error: 'Failed to update profile' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: 'Profile image deleted successfully',
        profile: updatedProfile
      });
    }

    return NextResponse.json(
      { error: 'No profile image found to delete' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error deleting profile image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}
