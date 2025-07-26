"use client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import ImageUpload from "@/app/components/ImageUpload";

const AddProfilePage = () => {
  const { userId } = useAuth();
  const router = useRouter();
  const [profileName, setProfileName] = useState("");
  const [profileDescription, setProfileDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = async (file: File) => {
    setSelectedImage(file);
    // Just store the file for now, we'll upload it after profile creation
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!profileName) {
      toast.error("Profile name is required.");
      return;
    }

    if (!userId) {
      toast.error("User authentication required.");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Creating profile...");

    try {
      // Step 1: Create the profile
      const response = await fetch("/api/profiles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileName,
          profileDescription,
          userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create profile");
      }

      const newProfile = await response.json();

      // Step 2: Upload image if one was selected
      if (selectedImage && newProfile.profileId) {
        toast.update(loadingToast, {
          render: "Uploading profile image...",
          type: "info",
          isLoading: true,
        });

        const formData = new FormData();
        formData.append("file", selectedImage);
        formData.append("profileId", newProfile.profileId);
        formData.append("userId", userId);

        const imageResponse = await fetch("/api/profiles/upload-image", {
          method: "POST",
          body: formData,
        });

        if (!imageResponse.ok) {
          console.warn("Image upload failed, but profile was created");
          // Don't fail the entire process if image upload fails
        }
      }

      toast.update(loadingToast, {
        render: "Profile created successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Failed to create profile:", error);
      toast.update(loadingToast, {
        render:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 p-8 h-full overflow-y-auto bg-gray-300 dark:bg-gray-800">
      <div className="flex items-center mb-8">
        <Link href="/dashboard">
          <ArrowLeft className="w-6 h-6 mr-4 text-gray-700 dark:text-gray-300 hover:text-violet-500 dark:hover:text-violet-400" />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Add New Profile
        </h1>
      </div>
      <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-md p-8 md:p-12">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Image Section */}
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">
                Profile Image (Optional)
              </h3>
              <ImageUpload
                onImageUpload={handleImageUpload}
                isLoading={isSubmitting}
                disabled={isSubmitting}
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
                  placeholder="Enter a unique profile name"
                  required
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
                ></textarea>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  This description will help you identify and organize your
                  profiles.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/dashboard"
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-8 py-2 font-semibold text-white bg-violet-500 rounded-lg hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                Add Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default AddProfilePage;
