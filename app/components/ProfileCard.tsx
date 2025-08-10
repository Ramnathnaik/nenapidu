"use client";

import { useAuth } from "@clerk/nextjs";
import {
  Bell,
  Calendar,
  Edit3,
  MoreHorizontal,
  Trash2,
  User,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import swal from "@/app/utils/swal";

interface Profile {
  profileId: string;
  profileName: string;
  profileDescription?: string | null;
  profileImgUrl?: string | null;
  userId?: string;
  createdAt?: string;
}

interface ProfileCardProps {
  profile: Profile;
  showActions?: boolean;
  onProfileUpdated?: (updatedProfile: Profile) => void;
  onProfileDeleted?: (profileId: string) => void;
  className?: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  showActions = true,
  onProfileDeleted,
  className = "",
}) => {
  const [imageError, setImageError] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { userId } = useAuth();

  const handleImageError = () => {
    setImageError(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return null;
    }
  };

  // Handle Update Profile
  const handleUpdateProfile = () => {
    router.push(`/profile/${profile.profileId}/edit`);
    setShowMenu(false);
  };

  // Handle Create Reminder
  const handleCreateReminder = () => {
    // Navigate to reminder creation with profile pre-selected
    router.push(
      `/reminder/add?profileId=${
        profile.profileId
      }&profileName=${encodeURIComponent(profile.profileName)}`
    );
    setShowMenu(false);
  };

  // Handle Delete Profile with SweetAlert confirmation
  const handleDeleteProfile = async () => {
    if (!userId) {
      swal.error('Authentication required', 'Please log in to delete this profile.');
      return;
    }

    // Show SweetAlert confirmation dialog
    const result = await swal.warning(
      'Delete Profile?',
      `Are you sure you want to delete "${profile.profileName}"? All associated reminders and favourites will be permanently removed. This action cannot be undone.`,
      'Yes, delete it!',
      'Cancel'
    );

    if (!result.isConfirmed) {
      return;
    }

    setIsDeleting(true);
    swal.loading('Deleting profile...', 'Please wait while we delete your profile.');

    try {
      const response = await fetch("/api/profiles", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profileId: profile.profileId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete profile");
      }

      swal.success('Profile deleted!', 'Your profile has been deleted successfully.');

      // Call callback if provided
      if (onProfileDeleted) {
        onProfileDeleted(profile.profileId);
      }
    } catch (error: unknown) {
      console.error("Failed to delete profile:", error);
      let message = "Failed to delete profile";
      if (error instanceof Error) {
        message = error.message;
      }
      swal.error('Deletion failed', message, 5000);
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  // Close menu when clicking outside
  const handleClickOutside = () => {
    setShowMenu(false);
  };

  // Handle card click to navigate to profile page
  const handleCardClick = () => {
    router.push(`/profile/${profile.profileId}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative bg-white dark:bg-gray-900 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-800 overflow-hidden cursor-pointer ${className}`}
    >
      {/* Card Header with Gradient Background */}
      <div className="relative h-24 bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-500">
        <div className="absolute inset-0 bg-black/10"></div>

        {/* Actions Menu */}
        {showActions && (
          <div className="absolute top-3 right-3 z-10">
            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  {/* Backdrop to close menu */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={handleClickOutside}
                  ></div>

                  <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20 min-w-[160px]">
                    {/* Update Profile */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleUpdateProfile();
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      Update Profile
                    </button>

                    {/* Create Reminder */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCreateReminder();
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-indigo-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      <Bell className="w-4 h-4" />
                      Create Reminder
                    </button>

                    <hr className="my-1 border-gray-200 dark:border-gray-600" />

                    {/* Delete Profile */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteProfile();
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      disabled={isDeleting}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Profile
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}


        {/* Profile Image */}
        <div className="absolute -bottom-8 left-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-white dark:border-gray-900 bg-white dark:bg-gray-800 overflow-hidden shadow-lg">
              {profile.profileImgUrl && !imageError ? (
                <Image
                  src={profile.profileImgUrl}
                  alt={profile.profileName}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-400 to-purple-500">
                  <User className="w-8 h-8 text-white" />
                </div>
              )}
            </div>

            {/* Online Status Indicator */}
            {/* <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white dark:border-gray-900 rounded-full"></div> */}
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="pt-12 pb-6 px-6">
        {/* Profile Name */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
            {profile.profileName}
          </h3>

          {/* Creation Date */}
          {profile.createdAt && formatDate(profile.createdAt) && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
              <Calendar className="w-3 h-3" />
              <span>Created {formatDate(profile.createdAt)}</span>
            </div>
          )}
        </div>

        {/* Profile Description */}
        <div className="mb-4">
          {profile.profileDescription ? (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {profile.profileDescription}
            </p>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500 italic">
              No description available
            </p>
          )}
        </div>

        {/* Card Footer */}
        <div className="flex items-center justify-between">
          {/* Profile Badge */}
          <div className="flex items-center gap-2">
            <div className="px-2 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-medium rounded-full">
              Profile
            </div>
          </div>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"></div>

      {/* Bottom Border Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-900 via-purple-800 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
    </div>
  );
};

export default ProfileCard;
