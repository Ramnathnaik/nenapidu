"use client";

import { ChevronDown, ChevronUp, Edit, Trash2, Heart } from "lucide-react";

interface Favourite {
  id: string;
  title: string;
  description?: string | null;
  userId: string;
  profileId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface FavouriteAccordionProps {
  favourites: Favourite[];
  expandedFavourites: Set<string>;
  deletingFavourite: string | null;
  onToggleExpansion: (favouriteId: string) => void;
  onEdit: (favouriteId: string) => void;
  onDelete: (favouriteId: string) => void;
  formatDate: (dateString: string | Date) => string;
}

const FavouriteAccordion: React.FC<FavouriteAccordionProps> = ({
  favourites,
  expandedFavourites,
  deletingFavourite,
  onToggleExpansion,
  onEdit,
  onDelete,
  formatDate,
}) => {
  return (
    <div className="space-y-2">
      {favourites.map((favourite) => {
        const isExpanded = expandedFavourites.has(favourite.id);
        const isDeleting = deletingFavourite === favourite.id;

        return (
          <div
            key={favourite.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900"
          >
            {/* Accordion Header */}
            <button
              onClick={() => onToggleExpansion(favourite.id)}
              className="w-full px-4 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-inset"
              disabled={isDeleting}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Heart className="w-4 h-4 text-violet-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {favourite.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Created: {formatDate(favourite.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {isDeleting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-violet-500"></div>
                  ) : (
                    <>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          favourite.description
                            ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {favourite.description ? "With Description" : "Title Only"}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </>
                  )}
                </div>
              </div>
            </button>

            {/* Accordion Content */}
            {isExpanded && (
              <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="p-4 space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {favourite.title}
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {favourite.description || "No description provided"}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Created
                      </label>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {formatDate(favourite.createdAt)}
                      </p>
                    </div>
                    {favourite.updatedAt !== favourite.createdAt && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Last Updated
                        </label>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {formatDate(favourite.updatedAt)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => onEdit(favourite.id)}
                      disabled={isDeleting}
                      className="px-4 py-2 text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(favourite.id)}
                      disabled={isDeleting}
                      className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FavouriteAccordion;
