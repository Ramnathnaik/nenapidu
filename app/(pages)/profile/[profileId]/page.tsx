"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface Profile {
  profileId: string;
  profileName: string;
  profileDescription: string;
  profileImgUrl?: string | null;
  userId?: string;
}

const ProfilePage = () => {
  const { profileId } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/profiles/profile/${profileId}`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else {
          const errorData = await response.json();
          console.error("Failed to fetch profile", errorData);
          setError(true);
          toast.error(
            `Failed to load profile: ${errorData.error || "Unknown error"}`
          );
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setError(true);
        toast.error("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileId]);

  return (
    <main className="flex-1 p-8 h-full overflow-y-auto bg-gray-300 dark:bg-gray-800">
      <div className="flex items-center mb-8">
        <Link href="/dashboard">
          <ArrowLeft className="w-6 h-6 mr-4 text-gray-700 dark:text-gray-300 hover:text-violet-500 dark:hover:text-violet-400" />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Profile Details
        </h1>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              Loading profile...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-md p-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Profile Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The profile you&#39;re looking for could not be loaded. It may
              have been deleted or you may not have permission to view it.
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      ) : profile ? (
        <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-md p-8 md:p-12">
          <div className="max-w-2xl mx-auto">
            {/* Profile Image Section */}
            <div className="text-center mb-8">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">
                Profile Image
              </h3>
              <div className="flex justify-center mb-6">
                <div className="relative w-32 h-32">
                  <Image
                    src={profile.profileImgUrl || "/default-profile.png"}
                    alt="Profile image"
                    fill
                    className="rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.src = "/default-profile.png";
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                {profile.profileName}
              </h2>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                  Description
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {profile.profileDescription || "No description provided."}
                </p>
              </div>
            </div>
            <div className="bg-violet-50 dark:bg-violet-900/20 rounded-lg p-6">
              <h3 className="text-sm font-medium text-violet-800 dark:text-violet-200 mb-2 uppercase tracking-wide">
                Profile ID
              </h3>
              <p className="text-violet-600 dark:text-violet-300 font-mono text-sm">
                {profile.profileId}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
};

export default ProfilePage;
