"use client";
import { ArrowLeft, Heart, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import swal from "@/app/utils/swal";

interface Profile {
  profileId: string;
  profileName: string;
  profileDescription: string;
  profileImgUrl?: string | null;
  userId?: string;
}

const AddFavouritePage = () => {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [profilesLoading, setProfilesLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState("");

  // Get profile from URL params if provided
  const profileIdParam = searchParams.get("profileId");
  const profileNameParam = searchParams.get("profileName");

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!user?.id) return;

      try {
        setProfilesLoading(true);
        const response = await fetch(`/api/profiles/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setProfiles(data || []);

          // Set default profile if provided in URL
          if (profileIdParam) {
            setSelectedProfileId(profileIdParam);
          }
        } else {
          console.error("Failed to fetch profiles");
          swal.error("Error", "Failed to load profiles. Please try again.");
        }
      } catch (error) {
        console.error("Failed to fetch profiles:", error);
        swal.error("Error", "Failed to load profiles. Please try again.");
      } finally {
        setProfilesLoading(false);
      }
    };

    fetchProfiles();
  }, [user?.id, profileIdParam]);

  // Auto-select profile if only one exists and no profile is already selected
  useEffect(() => {
    if (!selectedProfileId && profiles.length === 1 && !profilesLoading) {
      setSelectedProfileId(profiles[0].profileId);
    }
  }, [profiles, selectedProfileId, profilesLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      swal.error("Authentication Error", "Please sign in to add favourites.");
      return;
    }

    if (!title.trim()) {
      swal.error(
        "Validation Error",
        "Please enter a title for your favourite."
      );
      return;
    }

    if (!selectedProfileId) {
      swal.error(
        "Validation Error",
        "Please select a profile for your favourite."
      );
      return;
    }

    setLoading(true);
    swal.loading(
      "Creating favourite...",
      "Please wait while we save your favourite."
    );

    try {
      const response = await fetch("/api/favourites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          userId: user.id,
          profileId: selectedProfileId,
        }),
      });

      if (response.ok) {
        await response.json();
        swal.success(
          "Favourite created!",
          "Your favourite has been saved successfully."
        );

        // Redirect to the profile page or favourites list
        if (profileIdParam) {
          router.push(`/profile/${profileIdParam}`);
        } else {
          router.push("/favourites");
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create favourite");
      }
    } catch (error) {
      console.error("Failed to create favourite:", error);
      let message = "Failed to create favourite";
      if (error instanceof Error) {
        message = error.message;
      }
      swal.error("Creation failed", message, 5000);
    } finally {
      setLoading(false);
    }
  };

  if (profilesLoading) {
    return (
      <main className="flex-1 p-4 md:p-8 h-full overflow-y-auto bg-gray-300 dark:bg-gray-800">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              Loading profiles...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-8 h-full overflow-y-auto bg-gray-300 dark:bg-gray-800">
      <div className="flex items-center mb-6 md:mb-8">
        <Link
          href={profileIdParam ? `/profile/${profileIdParam}` : "/favourites"}
        >
          <ArrowLeft className="w-6 h-6 mr-4 text-gray-700 dark:text-gray-300 hover:text-violet-500 dark:hover:text-violet-400" />
        </Link>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white">
          Add Favourite
        </h1>
      </div>

      {/* Mobile Layout */}
      <div className="block lg:hidden">
        <div className="max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            {/* Profile Selection */}
            <div className="mb-6">
              <label
                htmlFor="profile-mobile"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Associate with Profile *
              </label>
              {profilesLoading ? (
                <div className="w-full px-4 py-2 text-gray-500 bg-gray-100 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
                  Loading profiles...
                </div>
              ) : profiles.length === 0 ? (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
                    No profiles found. Please create a profile first to add
                    favourites.
                  </p>
                  <Link
                    href="/profile/add"
                    className="inline-flex items-center px-3 py-1 text-xs font-medium text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-800/30 rounded-md hover:bg-amber-200 dark:hover:bg-amber-800/50 transition-colors"
                  >
                    Create Profile
                  </Link>
                </div>
              ) : (
                <select
                  id="profile-mobile"
                  value={selectedProfileId}
                  onChange={(e) => setSelectedProfileId(e.target.value)}
                  disabled={!!profileIdParam || profiles.length === 1}
                  className="w-full px-4 py-2 text-gray-900 bg-gray-100 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">Select a profile</option>
                  {profiles.map((profile) => (
                    <option key={profile.profileId} value={profile.profileId}>
                      {profile.profileName}
                    </option>
                  ))}
                </select>
              )}
              {profileNameParam && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  This favourite will be added to{" "}
                  <strong>{profileNameParam}</strong>
                </p>
              )}
              {profiles.length === 1 && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Automatically selected as the only profile
                </p>
              )}
            </div>

            {/* Selected Profile Preview */}
            {selectedProfileId &&
              profiles.length > 0 &&
              (() => {
                const selectedProfile = profiles.find(
                  (p) => p.profileId === selectedProfileId
                );
                if (!selectedProfile) return null;

                return (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6 overflow-hidden">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 flex-shrink-0">
                        <Image
                          src={
                            selectedProfile.profileImgUrl ||
                            "/default-profile.png"
                          }
                          alt="Profile"
                          fill
                          className="rounded-full object-cover"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.src = "/default-profile.png";
                          }}
                        />
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="font-medium text-gray-800 text-wrap dark:text-white text-sm truncate">
                          {selectedProfile.profileName}
                        </h3>
                        <p className="text-xs text-gray-500 text-wrap dark:text-gray-400 truncate">
                          {selectedProfile.profileDescription ||
                            "No description"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

            {/* Title */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Heart className="inline w-4 h-4 mr-2" />
                Favourite Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter favourite title..."
                required
                maxLength={256}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-violet-500 focus:border-violet-500 transition-colors"
              />
              <div className="mt-1 text-right">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {title.length}/256
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="inline w-4 h-4 mr-2" />
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter favourite description (optional)..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-violet-500 focus:border-violet-500 transition-colors resize-none"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Add any additional details about this favourite
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !title.trim() || !selectedProfileId}
                className="px-6 py-2 font-semibold text-white bg-violet-500 rounded-lg hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Add Favourite"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Main Form Section */}
            <div className="xl:col-span-2">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-8">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
                  Favourite Details
                </h2>
                <form onSubmit={handleSubmit}>
                  {/* Profile Selection */}
                  <div className="mb-6">
                    <label
                      htmlFor="profile-desktop"
                      className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Associate with Profile *
                    </label>
                    {profilesLoading ? (
                      <div className="w-full px-4 py-3 text-gray-500 bg-gray-100 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
                        Loading profiles...
                      </div>
                    ) : profiles.length === 0 ? (
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
                          No profiles found. Please create a profile first to
                          add favourites.
                        </p>
                        <Link
                          href="/profile/add"
                          className="inline-flex items-center px-3 py-1 text-xs font-medium text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-800/30 rounded-md hover:bg-amber-200 dark:hover:bg-amber-800/50 transition-colors"
                        >
                          Create Profile
                        </Link>
                      </div>
                    ) : (
                      <select
                        id="profile-desktop"
                        value={selectedProfileId}
                        onChange={(e) => setSelectedProfileId(e.target.value)}
                        disabled={!!profileIdParam || profiles.length === 1}
                        className="w-full px-4 py-3 text-gray-900 bg-gray-100 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        required
                      >
                        <option value="">Select a profile</option>
                        {profiles.map((profile) => (
                          <option
                            key={profile.profileId}
                            value={profile.profileId}
                          >
                            {profile.profileName}
                          </option>
                        ))}
                      </select>
                    )}
                    {profileNameParam && (
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        This favourite will be added to{" "}
                        <strong>{profileNameParam}</strong>
                      </p>
                    )}
                    {profiles.length === 1 && (
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Automatically selected as the only profile
                      </p>
                    )}
                  </div>

                  {/* Selected Profile Preview */}
                  {selectedProfileId &&
                    profiles.length > 0 &&
                    (() => {
                      const selectedProfile = profiles.find(
                        (p) => p.profileId === selectedProfileId
                      );
                      if (!selectedProfile) return null;

                      return (
                        <div className="mb-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                          <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 flex-shrink-0">
                              <Image
                                src={
                                  selectedProfile.profileImgUrl ||
                                  "/default-profile.png"
                                }
                                alt="Profile"
                                fill
                                className="rounded-full object-cover"
                                onError={(e) => {
                                  const img = e.target as HTMLImageElement;
                                  img.src = "/default-profile.png";
                                }}
                              />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-800 dark:text-white text-lg">
                                {selectedProfile.profileName}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {selectedProfile.profileDescription ||
                                  "No description"}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                  {/* Title */}
                  <div className="mb-6">
                    <label
                      htmlFor="title-desktop"
                      className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Favourite Title *
                    </label>
                    <input
                      type="text"
                      id="title-desktop"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter favourite title..."
                      required
                      maxLength={256}
                      className="w-full px-4 py-3 text-gray-900 bg-gray-100 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    />
                    <div className="mt-1 text-right">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {title.length}/256
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-8">
                    <label
                      htmlFor="description-desktop"
                      className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Description
                    </label>
                    <textarea
                      id="description-desktop"
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-3 text-gray-900 bg-gray-100 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                      placeholder="Enter detailed description for your favourite..."
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Add any additional details about this favourite memory or
                      moment
                    </p>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Link
                      href={
                        profileIdParam
                          ? `/profile/${profileIdParam}`
                          : "/favourites"
                      }
                      className="px-6 py-3 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      disabled={loading || !title.trim() || !selectedProfileId}
                      className="px-8 py-3 cursor-pointer font-semibold text-white bg-violet-500 rounded-lg hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700 transition-colors shadow-lg"
                    >
                      {loading ? "Creating..." : "Create Favourite"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Sidebar with Additional Info */}
            <div className="xl:col-span-1">
              <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-rose-800 dark:text-rose-200 mb-4">
                  💝 Tips for Great Favourites
                </h3>
                <ul className="space-y-2 text-sm text-rose-700 dark:text-rose-300">
                  <li>
                    • Use descriptive titles that capture the essence of the
                    memory
                  </li>
                  <li>
                    • Include details about when, where, or why it&#39;s special
                  </li>
                  <li>• Add context that will help you remember later</li>
                  <li>• Consider what made this moment meaningful</li>
                  <li>• Think about the emotions or significance</li>
                  <li>• Keep it personal and heartfelt</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  📝 Example Ideas
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="font-medium text-gray-800 dark:text-white text-sm">
                      &quot;First Steps&quot;
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Recording milestone moments
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="font-medium text-gray-800 dark:text-white text-sm">
                      &quot;Favorite Quote&quot;
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Something they always say
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="font-medium text-gray-800 dark:text-white text-sm">
                      &quot;Special Achievement&quot;
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Celebrating accomplishments
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AddFavouritePage;
