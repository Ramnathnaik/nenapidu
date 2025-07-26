import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

/**
 * Upload a file to S3 and return the public URL
 * @param file - The file buffer to upload
 * @param fileName - The name for the file in S3
 * @param contentType - The MIME type of the file
 * @returns Promise<string> - The public URL of the uploaded file
 */
export async function uploadToS3(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: file,
      ContentType: contentType,
      // Make the object publicly readable
      // ACL: 'public-read',
    });

    await s3Client.send(command);

    // Return the public URL
    const publicUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    return publicUrl;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload image to S3");
  }
}

/**
 * Delete a file from S3
 * @param fileName - The name of the file to delete
 * @returns Promise<boolean> - Whether the deletion was successful
 */
export async function deleteFromS3(fileName: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error("Error deleting from S3:", error);
    return false;
  }
}

/**
 * Extract the file name from an S3 URL
 * @param url - The S3 URL
 * @returns string | null - The file name or null if not a valid S3 URL
 */
export function extractFileNameFromS3Url(url: string): string | null {
  try {
    const urlParts = url.split("/");
    return urlParts[urlParts.length - 1];
  } catch (error) {
    console.error("Error extracting file name from URL:", error);
    return null;
  }
}

/**
 * Generate a unique file name for S3
 * @param userId - The user ID
 * @param profileId - The profile ID
 * @param originalName - The original file name
 * @returns string - The unique file name
 */
export function generateProfileImageFileName(
  userId: string,
  profileId: string,
  originalName: string
): string {
  const timestamp = Date.now();
  const extension = originalName.split(".").pop();
  return `profiles/${userId}/${profileId}/profile-${timestamp}.${extension}`;
}

/**
 * Validate image file type and size
 * @param file - The file to validate
 * @param maxSizeInMB - Maximum file size in MB
 * @returns object - Validation result with isValid and error message
 */
export function validateImageFile(file: File, maxSizeInMB: number = 5) {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error:
        "Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.",
    };
  }

  if (file.size > maxSizeInBytes) {
    return {
      isValid: false,
      error: `File size too large. Please upload an image smaller than ${maxSizeInMB}MB.`,
    };
  }

  return { isValid: true, error: null };
}
