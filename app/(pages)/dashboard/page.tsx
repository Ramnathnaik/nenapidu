"use client";
// import ProfileCard from "@/app/components/ProfileCard";
import ProfileCard from "@/app/components/ProfileCard";
// import useTheme from "@/app/utils/store";
import { Plus } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

interface Profile {
  profileId: string;
  profileName: string;
  profileDescription?: string | null;
  profileImgUrl?: string | null;
  userId?: string;
  createdAt?: string;
}

const DashboardPage = () => {
  const { userId } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const fetchProfiles = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/profiles/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setProfiles(data);
      } else {
        console.error("Failed to fetch profiles");
      }
    } catch (error) {
      console.error("Failed to fetch profiles:", error);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfiles();
  }, [userId, fetchProfiles]);

  const handleProfileDeleted = (deletedProfileId: string) => {
    // Remove the deleted profile from state immediately
    setProfiles((prevProfiles) => 
      prevProfiles.filter(profile => profile.profileId !== deletedProfileId)
    );
  };

  return (
    <main className="flex-1 p-8 h-full overflow-y-auto bg-gray-300 dark:bg-gray-800">
      {profiles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {profiles.map((profile) => (
            <ProfileCard 
              key={profile.profileId} 
              profile={profile} 
              onProfileDeleted={handleProfileDeleted}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <p className="mb-4 text-lg text-gray-500 dark:text-gray-400">
            No profiles found. Get started by adding a new profile.
          </p>
          <Link
            href="/profile/add"
            className="flex items-center px-4 py-2 font-semibold text-white bg-violet-500 rounded-lg hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Profile
          </Link>
        </div>
      )}
    </main>
  );
};

export default DashboardPage;
