# Profile Image Upload with S3 Integration

This document outlines the complete implementation of profile image upload functionality using AWS S3 for storage, including database schema updates, API endpoints, and UI components.

## 📋 Table of Contents

- [Overview](#overview)
- [Database Schema](#database-schema)
- [S3 Configuration](#s3-configuration)
- [API Endpoints](#api-endpoints)
- [Components](#components)
- [Implementation Details](#implementation-details)
- [File Structure](#file-structure)
- [Usage Guide](#usage-guide)
- [Environment Variables](#environment-variables)
- [Error Handling](#error-handling)
- [Security Considerations](#security-considerations)

## Overview

The profile image upload system allows users to:
- Upload profile images during profile creation
- View and edit existing profile images
- Remove profile images
- Store images securely in AWS S3 with automatic cleanup
- Get real-time feedback through toast notifications

### Key Features
- ✅ AWS S3 integration for reliable image storage
- ✅ File validation (type and size limits)
- ✅ Drag & drop interface with preview
- ✅ Automatic cleanup of old images
- ✅ Responsive design for mobile and desktop
- ✅ Toast notifications for user feedback
- ✅ Loading states and error handling

## Database Schema

### Updated Profile Table

```typescript
// db/schema.ts
export const profileTable = pgTable("profile", {
  profileId: uuid("profileId").primaryKey().notNull().defaultRandom(),
  profileName: varchar("profileName", { length: 256 }).notNull(),
  profileDescription: varchar("profileDescription"),
  profileImgUrl: varchar("profileImgUrl", { length: 512 }), // ← New column
  userId: varchar("userId", { length: 256 }).notNull().references(() => usersTable.userId),
});
```

### Migration Commands

```bash
npm run db:generate  # Generate migration files
npm run db:push      # Apply changes to database
```

## S3 Configuration

### Environment Variables Required

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name
```

### S3 Bucket Structure

Images are organized in the following structure:
```
your-bucket-name/
└── profiles/
    └── {userId}/
        └── {profileId}/
            └── profile-{timestamp}.{extension}
```

### S3 Permissions

The bucket should have:
- Public read access for uploaded images
- Write/delete permissions for the application

## API Endpoints

### 1. Image Upload Endpoint

**POST** `/api/profiles/upload-image`

Uploads a new profile image and updates the profile record.

#### Request
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `file`: Image file (max 5MB)
  - `profileId`: Profile UUID
  - `userId`: User ID

#### Response
```json
{
  "message": "Image uploaded successfully",
  "profileImgUrl": "https://bucket.s3.region.amazonaws.com/profiles/userId/profileId/profile-timestamp.jpg",
  "profile": {
    "profileId": "uuid",
    "profileName": "Profile Name",
    "profileDescription": "Description",
    "profileImgUrl": "https://...",
    "userId": "user_id"
  }
}
```

#### Validation
- File types: JPEG, PNG, WebP, GIF
- Max file size: 5MB
- Required fields: file, profileId, userId

### 2. Image Removal Endpoint

**DELETE** `/api/profiles/upload-image`

Removes a profile image from S3 and updates the profile record.

#### Request
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "profileId": "profile-uuid",
  "userId": "user-id"
}
```

#### Response
```json
{
  "message": "Profile image deleted successfully",
  "profile": {
    "profileId": "uuid",
    "profileName": "Profile Name",
    "profileDescription": "Description",
    "profileImgUrl": null,
    "userId": "user_id"
  }
}
```

### 3. Updated Profile Management

**PUT** `/api/profiles`

The existing profile update endpoint now supports the `profileImgUrl` field.

## Components

### ImageUpload Component

A reusable React component for handling image uploads with drag & drop functionality.

#### Props
```typescript
interface ImageUploadProps {
  currentImageUrl?: string | null;
  onImageUpload: (file: File) => Promise<void>;
  onImageRemove?: () => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}
```

#### Features
- Drag & drop interface
- File validation with user feedback
- Image preview
- Loading states
- Error handling
- Responsive design

#### Usage Example
```tsx
<ImageUpload
  currentImageUrl={profile.profileImgUrl}
  onImageUpload={handleImageUpload}
  onImageRemove={profile.profileImgUrl ? handleImageRemove : undefined}
  isLoading={imageUploading}
  disabled={loading || imageUploading}
  className="mb-6"
/>
```

## Implementation Details

### Profile Creation Flow

1. User fills out profile form with optional image selection
2. Profile is created in database
3. If image was selected, it's uploaded to S3
4. Profile record is updated with image URL
5. User receives success notification

### Profile Editing Flow

1. User views profile with current image (if exists)
2. User can upload new image or remove existing one
3. Old image is automatically deleted from S3 when replacing
4. Profile record is updated
5. UI updates in real-time

### Error Handling Strategy

- **File validation errors**: Immediate user feedback via toast
- **Upload failures**: Graceful degradation (profile still created)
- **Network errors**: Retry suggestions and clear error messages
- **S3 errors**: Fallback handling and logging

## File Structure

```
app/
├── api/
│   └── profiles/
│       ├── route.ts                    # Updated with profileImgUrl support
│       └── upload-image/
│           └── route.ts                # New: Image upload/delete endpoint
├── components/
│   └── ImageUpload.tsx                 # New: Reusable image upload component
├── utils/
│   ├── s3.ts                          # New: S3 utility functions
│   └── profileHelpers.ts              # Updated with profileImgUrl support
└── (pages)/
    └── profile/
        ├── add/page.tsx               # Updated with image upload
        └── [profileId]/page.tsx       # Updated with image editing
```

## Usage Guide

### For Developers

#### 1. Setting Up S3
1. Create an S3 bucket
2. Configure public read access
3. Set up IAM user with appropriate permissions
4. Add environment variables to `.env`

#### 2. Using the ImageUpload Component
```tsx
import ImageUpload from '@/app/components/ImageUpload';

// In your component
const handleImageUpload = async (file: File) => {
  // Your upload logic
};

const handleImageRemove = async () => {
  // Your removal logic
};

return (
  <ImageUpload
    currentImageUrl={imageUrl}
    onImageUpload={handleImageUpload}
    onImageRemove={handleImageRemove}
  />
);
```

#### 3. API Integration
```typescript
// Upload image
const formData = new FormData();
formData.append('file', file);
formData.append('profileId', profileId);
formData.append('userId', userId);

const response = await fetch('/api/profiles/upload-image', {
  method: 'POST',
  body: formData,
});

// Remove image
const response = await fetch('/api/profiles/upload-image', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ profileId, userId }),
});
```

### For End Users

#### Creating a Profile with Image
1. Navigate to "Add New Profile"
2. Fill in profile name and description
3. (Optional) Click or drag an image to the upload area
4. Click "Add Profile"
5. Image is automatically uploaded and associated with the profile

#### Editing Profile Image
1. Go to profile details page
2. Click the camera icon to change image or trash icon to remove
3. Select new image from file picker or drag & drop
4. Image updates immediately upon successful upload

## Environment Variables

Ensure these variables are set in your `.env` file:

```env
# Required for S3 integration
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-app-profile-images

# Existing variables (for reference)
DATABASE_URL=your_database_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
```

## Error Handling

### Client-Side Validation
- File type validation (JPEG, PNG, WebP, GIF only)
- File size validation (max 5MB)
- Immediate user feedback via toast notifications

### Server-Side Validation
- Re-validation of file constraints
- Profile ownership verification
- S3 upload error handling
- Database transaction management

### Common Error Scenarios
1. **File too large**: Clear message with size limit
2. **Invalid file type**: Specific guidance on accepted formats
3. **Network failure**: Retry suggestions
4. **S3 service error**: Fallback messaging
5. **Database error**: Transaction rollback and user notification

## Security Considerations

### Access Control
- Users can only upload/modify images for their own profiles
- Profile ownership verification in API endpoints
- Clerk authentication integration

### File Security
- File type validation on both client and server
- File size limits to prevent abuse
- Automatic cleanup of old images to manage storage

### S3 Security
- Public read access only (no write permissions for public)
- Organized folder structure for better management
- IAM user with minimal required permissions

### Data Validation
- UUID validation for profileId
- User ID verification via Clerk
- File content type verification

## Troubleshooting

### Common Issues

#### 1. Images Not Uploading
- Check AWS credentials in environment variables
- Verify S3 bucket permissions
- Check network connectivity
- Review browser console for errors

#### 2. Images Not Displaying
- Verify S3 bucket has public read access
- Check image URL format in database
- Ensure CORS is configured if needed

#### 3. Database Errors
- Confirm profileImgUrl column exists
- Check database connection
- Verify foreign key constraints

#### 4. File Validation Errors
- Check file size (must be under 5MB)
- Verify file type (JPEG, PNG, WebP, GIF only)
- Ensure file is not corrupted

### Debug Steps

1. **Check Environment Variables**
   ```bash
   echo $AWS_ACCESS_KEY_ID
   echo $S3_BUCKET_NAME
   ```

2. **Test S3 Connection**
   - Use AWS CLI to test credentials
   - Verify bucket access permissions

3. **Review Logs**
   - Check server console for detailed error messages
   - Review browser network tab for failed requests

4. **Database Verification**
   ```sql
   -- Check if profileImgUrl column exists
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'profile' AND column_name = 'profileImgUrl';
   ```

## Performance Considerations

### Image Optimization
- Consider implementing image resizing/compression
- Use appropriate image formats (WebP for modern browsers)
- Implement lazy loading for profile image galleries

### S3 Optimization
- Use CloudFront CDN for faster image delivery
- Implement lifecycle policies for old images
- Consider using S3 Transfer Acceleration for global users

### Database Optimization
- Index on userId for faster profile queries
- Consider storing image metadata separately if needed
- Regular cleanup of orphaned image records

---

## Changelog

### Version 1.0.0 (Initial Implementation)
- ✅ Added profileImgUrl column to database schema
- ✅ Implemented S3 integration utilities
- ✅ Created image upload/delete API endpoints
- ✅ Built reusable ImageUpload component
- ✅ Updated profile creation and editing pages
- ✅ Added comprehensive error handling and validation
- ✅ Integrated toast notifications for user feedback

---

*Last updated: January 2025*
