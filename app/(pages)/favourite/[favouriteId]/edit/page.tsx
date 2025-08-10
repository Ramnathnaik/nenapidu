"use client";

import { ArrowLeft, Heart, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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

interface Favourite {
  id: string;
  title: string;
  description?: string | null;
  userId: string;
  profileId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

const EditFavouritePage = () => {
  const { user } = useUser();
  const router = useRouter();
  const { favouriteId } = useParams();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [favourite, setFavourite] = useState<Favourite | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id || !favouriteId) return;

      try {
        setDataLoading(true);

        // Fetch favourite details
        const favouriteResponse = await fetch(
          `/api/favourites/single/${favouriteId}`
        );
        if (!favouriteResponse.ok) {
          throw new Error("Failed to fetch favourite");
        }
        const favouriteData = await favouriteResponse.json();

        // Verify ownership
        if (favouriteData.userId !== user.id) {
          swal.error(
            "Access Denied",
            "You don't have permission to edit this favourite."
          );
          router.push("/favourites");
          return;
        }

        setFavourite(favouriteData);
        setTitle(favouriteData.title);
        setDescription(favouriteData.description || "");
        setSelectedProfileId(favouriteData.profileId);

        // Fetch profiles
        const profilesResponse = await fetch(`/api/profiles/${user.id}`);
        if (profilesResponse.ok) {
          const profilesData = await profilesResponse.json();
          setProfiles(profilesData || []);
        } else {
          console.error("Failed to fetch profiles");
          swal.error("Error", "Failed to load profiles. Please try again.");
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        swal.error(
          "Error",
          "Failed to load favourite details. Please try again."
        );
        router.push("/favourites");
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [user?.id, favouriteId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      swal.error("Authentication Error", "Please sign in to edit favourites.");
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
      "Updating favourite...",
      "Please wait while we save your changes."
    );

    try {
      const response = await fetch("/api/favourites", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: favouriteId,
          title: title.trim(),
          description: description.trim() || null,
          userId: user.id,
          profileId: selectedProfileId,
        }),
      });

      if (response.ok) {
        await response.json();
        swal.success(
          "Favourite updated!",
          "Your favourite has been updated successfully."
        );

        // Redirect to the profile page or favourites list
        router.push(`/profile/${selectedProfileId}`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update favourite");
      }
    } catch (error) {
      console.error("Failed to update favourite:", error);
      let message = "Failed to update favourite";
      if (error instanceof Error) {
        message = error.message;
      }
      swal.error("Update failed", message, 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await swal.warning(
      "Delete Favourite?",
      "Are you sure you want to delete this favourite? This action cannot be undone.",
      "Yes, delete it!",
      "Cancel"
    );

    if (!result.isConfirmed) {
      return;
    }

    setLoading(true);
    swal.loading(
      "Deleting favourite...",
      "Please wait while we delete the favourite."
    );

    try {
      const response = await fetch("/api/favourites", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: favouriteId }),
      });

      if (response.ok) {
        swal.success(
          "Favourite deleted!",
          "The favourite has been deleted successfully."
        );
        router.push("/favourites");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete favourite");
      }
    } catch (error) {
      console.error("Failed to delete favourite:", error);
      let message = "Failed to delete favourite";
      if (error instanceof Error) {
        message = error.message;
      }
      swal.error("Deletion failed", message, 5000);
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <main className="flex-1 p-4 md:p-8 h-full overflow-y-auto bg-gray-300 dark:bg-gray-800">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              Loading favourite...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!favourite) {
    return (
      <main className="flex-1 p-4 md:p-8 h-full overflow-y-auto bg-gray-300 dark:bg-gray-800">
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-md p-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Favourite Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The favourite you&#39;re looking for could not be loaded.
            </p>
            <Link
              href="/favourites"
              className="inline-block px-6 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
            >
              Back to Favourites
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-8 h-full overflow-y-auto bg-gray-300 dark:bg-gray-800">
      <div className="flex items-center mb-6 md:mb-8">
        <Link href={`/profile/${selectedProfileId}`}>
          <ArrowLeft className="w-6 h-6 mr-4 text-gray-700 dark:text-gray-300 hover:text-violet-500 dark:hover:text-violet-400" />
        </Link>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white">
          Edit Favourite
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
              <select
                id="profile-mobile"
                value={selectedProfileId}
                onChange={(e) => setSelectedProfileId(e.target.value)}
                required
                className="w-full px-4 py-2 text-gray-900 bg-gray-100 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              >
                <option value="">Select a profile</option>
                {profiles.map((profile) => (
                  <option key={profile.profileId} value={profile.profileId}>
                    {profile.profileName}
                  </option>
                ))}
              </select>
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

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading || !title.trim() || !selectedProfileId}
                className="w-full px-6 py-2 font-semibold text-white bg-violet-500 rounded-lg hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Updating..." : "Update Favourite"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="w-full px-6 py-2 font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete Favourite
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
                  Edit Favourite Details
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
                    <select
                      id="profile-desktop"
                      value={selectedProfileId}
                      onChange={(e) => setSelectedProfileId(e.target.value)}
                      required
                      className="w-full px-4 py-3 text-gray-900 bg-gray-100 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
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
                      href={`/profile/${selectedProfileId}`}
                      className="px-6 py-3 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      disabled={loading || !title.trim() || !selectedProfileId}
                      className="px-8 py-3 font-semibold text-white bg-violet-500 rounded-lg hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700 transition-colors shadow-lg"
                    >
                      {loading ? "Updating..." : "Update Favourite"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Sidebar with Additional Info */}
            <div className="xl:col-span-1">
              <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold text-rose-800 dark:text-rose-200 mb-4">
                  ✏️ Editing Tips
                </h3>
                <ul className="space-y-2 text-sm text-rose-700 dark:text-rose-300">
                  <li>
                    • Make sure the title captures the essence of the memory
                  </li>
                  <li>• Update descriptions to add more context if needed</li>
                  <li>
                    • You can change which profile this favourite belongs to
                  </li>
                  <li>• Changes are saved immediately when you click update</li>
                </ul>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-4">
                  🗑️ Danger Zone
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                  Deleting this favourite cannot be undone. Make sure you really
                  want to remove it.
                </p>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="w-full px-4 py-2 font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Delete Favourite
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default EditFavouritePage;
