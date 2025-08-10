"use client";

import { useEffect, useState, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { Heart, ArrowLeft, Filter, X, User, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import swal from "@/app/utils/swal";

interface Favourite {
  id: string;
  title: string;
  description?: string;
  userId: string;
  profileId: string;
  profileName?: string;
  profileImgUrl?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

const FavouritesPage = () => {
  const { user } = useUser();
  const router = useRouter();
  const [favourites, setFavourites] = useState<Favourite[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingFavourite, setDeletingFavourite] = useState<string | null>(
    null
  );

  // Filter states
  const [selectedProfile, setSelectedProfile] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // const handleDeleteFavourite = (favouriteId: string) => {
  //   setFavourites((prevFavourites) =>
  //     prevFavourites.filter((favourite) => favourite.id !== favouriteId)
  //   );
  // };

  // Get unique profiles for filter dropdown
  const uniqueProfiles = useMemo(() => {
    const profileMap = new Map();
    favourites.forEach((favourite) => {
      if (favourite.profileName && favourite.profileId) {
        profileMap.set(favourite.profileId, {
          id: favourite.profileId,
          name: favourite.profileName,
          imgUrl: favourite.profileImgUrl,
        });
      }
    });
    return Array.from(profileMap.values());
  }, [favourites]);

  // Filter favourites based on selected filters
  const filteredFavourites = useMemo(() => {
    return favourites.filter((favourite) => {
      const profileMatch =
        !selectedProfile || favourite.profileId === selectedProfile;
      return profileMatch;
    });
  }, [favourites, selectedProfile]);

  // Clear all filters
  const clearFilters = () => {
    setSelectedProfile("");
  };

  // Check if any filters are active
  const hasActiveFilters = selectedProfile;

  // Format date for display
  const formatDate = (dateString: string | Date) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Unknown";
    }
  };

  // Handle edit favourite
  const handleEditFavourite = (favouriteId: string) => {
    router.push(`/favourite/${favouriteId}/edit`);
  };

  // Handle delete favourite
  const handleDeleteFavouriteAction = async (favouriteId: string) => {
    const result = await swal.warning(
      "Delete Favourite?",
      "Are you sure you want to delete this favourite? This action cannot be undone.",
      "Yes, delete it!",
      "Cancel"
    );

    if (!result.isConfirmed) {
      return;
    }

    setDeletingFavourite(favouriteId);
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
        setFavourites(favourites.filter((f) => f.id !== favouriteId));
        swal.success(
          "Favourite deleted!",
          "The favourite has been deleted successfully."
        );
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
      setDeletingFavourite(null);
    }
  };

  useEffect(() => {
    const fetchFavourites = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/favourites/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setFavourites(data || []);
        }
      } catch (error) {
        console.error("Failed to fetch favourites:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavourites();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 bg-gray-300 dark:bg-gray-700 rounded-lg"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-300 dark:bg-gray-800 p-6">
      <div className="mx-auto lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/dashboard">
              <ArrowLeft className="w-6 h-6 mr-4 text-gray-700 dark:text-gray-300 hover:text-violet-500 dark:hover:text-violet-400" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Heart className="w-6 h-6 text-violet-500" />
              My Favourites
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {favourites.length > 0 && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-2 px-2 py-1 text-xs bg-violet-100 dark:bg-violet-900 text-violet-800 dark:text-violet-200 rounded-full">
                    1
                  </span>
                )}
              </button>
            )}

            <Link
              href="/favourite/add"
              className="hidden sm:flex items-center px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors text-sm font-medium gap-2"
            >
              <Heart className="w-4 h-4" />
              Add Favourite
            </Link>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && favourites.length > 0 && (
          <div className="mb-6 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Profile Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User className="inline w-4 h-4 mr-1" />
                  Filter by Profile
                </label>
                <select
                  value={selectedProfile}
                  onChange={(e) => setSelectedProfile(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                >
                  <option value="">All Profiles</option>
                  {uniqueProfiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors flex items-center"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Filter Summary */}
            {hasActiveFilters && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-2">
                  {selectedProfile && (
                    <span className="inline-flex items-center px-2 py-1 text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-200 rounded-full">
                      Profile:{" "}
                      {
                        uniqueProfiles.find((p) => p.id === selectedProfile)
                          ?.name
                      }
                      <button
                        onClick={() => setSelectedProfile("")}
                        className="ml-1 hover:text-violet-600 dark:hover:text-violet-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results Summary */}
        {favourites.length > 0 && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredFavourites.length} of {favourites.length}{" "}
              favourites
            </p>
            {hasActiveFilters && filteredFavourites.length === 0 && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                No favourites match your current filters
              </p>
            )}
          </div>
        )}

        {favourites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No favourites yet
            </h2>
            <p className="text-gray-500 dark:text-gray-500 mb-6">
              Start adding your favourite memories and moments for each profile.
            </p>
            <Link
              href="/favourite/add"
              className="inline-flex items-center px-6 py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors font-medium gap-2"
            >
              <Heart className="w-5 h-5" />
              Add Your First Favourite
            </Link>
          </div>
        ) : filteredFavourites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No favourites found
            </h2>
            <p className="text-gray-500 dark:text-gray-500">
              {hasActiveFilters
                ? "Try adjusting your filters to see more favourites."
                : "You don't have any favourites matching the current criteria."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 text-sm bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFavourites.map((favourite) => (
              <div
                key={favourite.id}
                className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Profile Image */}
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <Image
                      src={favourite.profileImgUrl || "/default-profile.png"}
                      alt="Profile"
                      fill
                      className="rounded-full object-cover"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = "/default-profile.png";
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {favourite.title}
                        </h3>
                        <p className="text-sm text-violet-600 dark:text-violet-400">
                          {favourite.profileName}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditFavourite(favourite.id)}
                          disabled={deletingFavourite === favourite.id}
                          className="p-2 text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Edit favourite"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteFavouriteAction(favourite.id)
                          }
                          disabled={deletingFavourite === favourite.id}
                          className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete favourite"
                        >
                          {deletingFavourite === favourite.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {favourite.description && (
                      <p className="text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                        {favourite.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Created: {formatDate(favourite.createdAt)}</span>
                      {favourite.updatedAt !== favourite.createdAt && (
                        <span>Updated: {formatDate(favourite.updatedAt)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavouritesPage;
