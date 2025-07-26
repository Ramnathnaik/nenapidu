"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import swal from "@/app/utils/swal";
import ImageUpload from "@/app/components/ImageUpload";

interface Profile {
  profileId: string;
  profileName: string;
  profileDescription: string;
  profileImgUrl?: string | null;
  userId?: string;
}

const EditProfilePage = () => {
  const { userId } = useAuth();
  const router = useRouter();
  const { profileId } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileName, setProfileName] = useState("");
  const [profileDescription, setProfileDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileId) return;

      try {
        const response = await fetch(`/api/profiles/profile/${profileId}`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
          setProfileName(data.profileName || "");
          setProfileDescription(data.profileDescription || "");
        } else {
          swal.error('Failed to load profile', 'Could not load the profile for editing.');
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        swal.error('Failed to load profile', 'Could not load the profile for editing.');
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileId, router]);

  const handleImageUpload = async (file: File) => {
    if (!profile || !userId) return;

    setImageUploading(true);
    swal.loading('Uploading image...', 'Please wait while we upload your image.');

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("profileId", profile.profileId);
      formData.append("userId", userId);

      const response = await fetch("/api/profiles/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const result = await response.json();
      setProfile((prev) =>
        prev ? { ...prev, profileImgUrl: result.profileImgUrl } : null
      );

      swal.success('Image uploaded!', 'Your profile image has been uploaded successfully.');
    } catch (error: unknown) {
      console.error("Failed to upload image:", error);
      let message = "Failed to upload image";
      if (error instanceof Error) {
        message = error.message;
      }
      swal.error('Upload failed', message, 5000);
    } finally {
      setImageUploading(false);
    }
  };

  const handleImageRemove = async () => {
    if (!profile || !userId) return;

    setImageUploading(true);
    swal.loading('Removing image...', 'Please wait while we remove your image.');

    try {
      const response = await fetch("/api/profiles/upload-image", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileId: profile.profileId,
          userId: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove image");
      }

      setProfile((prev) => (prev ? { ...prev, profileImgUrl: null } : null));

      swal.success('Image removed!', 'Your profile image has been removed successfully.');
    } catch (error: unknown) {
      console.error("Failed to remove image:", error);
      let message = "Failed to remove image";
      if (error instanceof Error) {
        message = error.message;
      }
      swal.error('Removal failed', message, 5000);
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!profileName) {
      swal.error('Profile name required', 'Please enter a profile name before saving.');
      return;
    }

    if (!profile) {
      swal.error('Profile data error', 'Profile data has not been loaded properly.');
      return;
    }

    setIsSubmitting(true);
    swal.loading('Updating profile...', 'Please wait while we save your changes.');

    try {
      const response = await fetch("/api/profiles", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileId: profile.profileId,
          profileName,
          profileDescription,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      swal.success('Profile updated!', 'Your profile has been updated successfully.');

      setTimeout(() => {
        router.push(`/profile/${profile.profileId}`);
      }, 1500);
    } catch (error: unknown) {
      console.error("Failed to update profile:", error);
      let message = "An unexpected error occurred. Please try again.";
      if (error instanceof Error) {
        message = error.message;
      }
      swal.error('Update failed', message, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 p-8 h-full overflow-y-auto bg-gray-300 dark:bg-gray-800">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              Loading profile...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex-1 p-8 h-full overflow-y-auto bg-gray-300 dark:bg-gray-800">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-4">
              Profile not found
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-8 h-full overflow-y-auto bg-gray-300 dark:bg-gray-800">
      <div className="flex items-center mb-8">
        <Link href={`/profile/${profile.profileId}`}>
          <ArrowLeft className="w-6 h-6 mr-4 text-gray-700 dark:text-gray-300 hover:text-violet-500 dark:hover:text-violet-400" />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Edit Profile
        </h1>
      </div>

      <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-md p-8 md:p-12">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Image Section */}
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">
                Profile Image
              </h3>
              <ImageUpload
                currentImageUrl={profile.profileImgUrl}
                onImageUpload={handleImageUpload}
                onImageRemove={
                  profile.profileImgUrl ? handleImageRemove : undefined
                }
                isLoading={imageUploading}
                disabled={isSubmitting || imageUploading}
                className="mb-6"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="md:col-span-2">
                <label
                  htmlFor="profileName"
                  className="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Profile Name
                </label>
                <input
                  type="text"
                  id="profileName"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-4 py-3 text-gray-900 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all duration-200"
                  placeholder="Enter profile name"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="md:col-span-2">
                <label
                  htmlFor="profileDescription"
                  className="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Profile Description
                </label>
                <textarea
                  id="profileDescription"
                  rows={6}
                  value={profileDescription}
                  onChange={(e) => setProfileDescription(e.target.value)}
                  className="w-full px-4 py-3 text-gray-900 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white resize-none transition-all duration-200"
                  placeholder="Provide a detailed description of this profile..."
                  disabled={isSubmitting}
                ></textarea>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  This description will help you identify and organize your
                  profiles.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Link
                href={`/profile/${profile.profileId}`}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-2 font-semibold text-white bg-violet-500 rounded-lg hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700 transition-colors duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Updating...
                  </>
                ) : (
                  "Update Profile"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default EditProfilePage;
