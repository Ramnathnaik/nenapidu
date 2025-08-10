import db from "@/db";
import { favouritesTable, profileTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export interface CreateFavouriteData {
  title: string;
  description?: string | null;
  userId: string;
  profileId: string;
}

export interface UpdateFavouriteData {
  title?: string;
  description?: string | null;
  userId?: string;
  profileId?: string;
}

/**
 * Creates a new favourite record in the database
 * @param favouriteData - Favourite data to create
 * @returns Promise<Favourite | null> - The created favourite or null if creation failed
 */
export async function createFavourite(favouriteData: CreateFavouriteData) {
  try {
    const newFavourite = await db
      .insert(favouritesTable)
      .values({
        title: favouriteData.title,
        description: favouriteData.description || null,
        userId: favouriteData.userId,
        profileId: favouriteData.profileId,
      })
      .returning();

    console.log("New favourite created:", newFavourite[0]);
    return newFavourite[0];
  } catch (error) {
    console.error("Error creating favourite:", error);
    return null;
  }
}

/**
 * Updates an existing favourite record in the database
 * @param favouriteId - The favourite ID
 * @param updateData - Data to update
 * @returns Promise<Favourite | null> - The updated favourite or null if update failed
 */
export async function updateFavourite(
  favouriteId: string,
  updateData: UpdateFavouriteData
) {
  try {
    // Always update the updatedAt timestamp when updating a favourite
    const dataWithTimestamp = {
      ...updateData,
      updatedAt: new Date(),
    };

    const updatedFavourite = await db
      .update(favouritesTable)
      .set(dataWithTimestamp)
      .where(eq(favouritesTable.id, favouriteId))
      .returning();

    if (updatedFavourite.length === 0) {
      console.log(`Favourite with ID ${favouriteId} not found for update`);
      return null;
    }

    console.log("Favourite updated:", updatedFavourite[0]);
    return updatedFavourite[0];
  } catch (error) {
    console.error("Error updating favourite:", error);
    return null;
  }
}

/**
 * Gets a favourite by its ID
 * @param favouriteId - The favourite ID
 * @returns Promise<Favourite | null> - The favourite or null if not found
 */
export async function getFavouriteById(favouriteId: string) {
  try {
    const favourite = await db
      .select()
      .from(favouritesTable)
      .where(eq(favouritesTable.id, favouriteId))
      .limit(1);

    return favourite.length > 0 ? favourite[0] : null;
  } catch (error) {
    console.error("Error getting favourite:", error);
    return null;
  }
}

/**
 * Gets all favourites for a specific user
 * @param userId - The user ID
 * @returns Promise<Favourite[]> - Array of favourites for the user
 */
export async function getFavouritesByUserId(userId: string) {
  try {
    const favourites = await db
      .select()
      .from(favouritesTable)
      .where(eq(favouritesTable.userId, userId));

    return favourites;
  } catch (error) {
    console.error("Error getting favourites by user ID:", error);
    return [];
  }
}

/**
 * Gets all favourites for a specific user with their associated profile information
 * @param userId - The user ID
 * @returns Promise<Array> - Array of favourites with profile data
 */
export async function getFavouritesByUserIdWithProfile(userId: string) {
  try {
    const favouritesWithProfiles = await db
      .select({
        id: favouritesTable.id,
        title: favouritesTable.title,
        description: favouritesTable.description,
        userId: favouritesTable.userId,
        profileId: favouritesTable.profileId,
        createdAt: favouritesTable.createdAt,
        updatedAt: favouritesTable.updatedAt,
        profileName: profileTable.profileName,
        profileImgUrl: profileTable.profileImgUrl,
      })
      .from(favouritesTable)
      .leftJoin(
        profileTable,
        eq(favouritesTable.profileId, profileTable.profileId)
      )
      .where(eq(favouritesTable.userId, userId));

    return favouritesWithProfiles;
  } catch (error) {
    console.error("Error getting favourites with profile data:", error);
    return [];
  }
}

/**
 * Gets all favourites for all users with their associated profile information
 * @returns Promise<Array> - Array of all favourites with profile data
 */
export async function getAllFavouritesWithProfile() {
  try {
    const favouritesWithProfiles = await db
      .select({
        id: favouritesTable.id,
        title: favouritesTable.title,
        description: favouritesTable.description,
        userId: favouritesTable.userId,
        profileId: favouritesTable.profileId,
        createdAt: favouritesTable.createdAt,
        updatedAt: favouritesTable.updatedAt,
        profileName: profileTable.profileName,
        profileImgUrl: profileTable.profileImgUrl,
      })
      .from(favouritesTable)
      .leftJoin(
        profileTable,
        eq(favouritesTable.profileId, profileTable.profileId)
      );

    return favouritesWithProfiles;
  } catch (error) {
    console.error("Error getting all favourites with profile data:", error);
    return [];
  }
}

/**
 * Gets all favourites for a specific profile
 * @param profileId - The profile ID
 * @returns Promise<Favourite[]> - Array of favourites for the profile
 */
export async function getFavouritesByProfileId(profileId: string) {
  try {
    const favourites = await db
      .select()
      .from(favouritesTable)
      .where(eq(favouritesTable.profileId, profileId));

    return favourites;
  } catch (error) {
    console.error("Error getting favourites by profile ID:", error);
    return [];
  }
}

/**
 * Gets all favourites for a specific user and profile combination
 * @param userId - The user ID
 * @param profileId - The profile ID
 * @returns Promise<Favourite[]> - Array of favourites for the user and profile
 */
export async function getFavouritesByUserAndProfile(
  userId: string,
  profileId: string
) {
  try {
    const favourites = await db
      .select()
      .from(favouritesTable)
      .where(
        and(
          eq(favouritesTable.userId, userId),
          eq(favouritesTable.profileId, profileId)
        )
      );

    return favourites;
  } catch (error) {
    console.error("Error getting favourites by user and profile ID:", error);
    return [];
  }
}

/**
 * Deletes a favourite by its ID
 * @param favouriteId - The favourite ID
 * @returns Promise<boolean> - Whether the deletion was successful
 */
export async function deleteFavourite(favouriteId: string) {
  try {
    const deletedFavourite = await db
      .delete(favouritesTable)
      .where(eq(favouritesTable.id, favouriteId))
      .returning();

    if (deletedFavourite.length === 0) {
      console.log(`Favourite with ID ${favouriteId} not found for deletion`);
      return false;
    }

    console.log("Favourite deleted:", deletedFavourite[0]);
    return true;
  } catch (error) {
    console.error("Error deleting favourite:", error);
    return false;
  }
}

/**
 * Deletes all favourites associated with a specific profile
 * @param profileId - The profile ID
 * @returns Promise<{success: boolean, deletedCount: number}> - Deletion result with count
 */
export async function deleteFavouritesByProfileId(profileId: string): Promise<{success: boolean, deletedCount: number}> {
  try {
    const deletedFavourites = await db
      .delete(favouritesTable)
      .where(eq(favouritesTable.profileId, profileId))
      .returning();

    const deletedCount = deletedFavourites.length;
    console.log(`Deleted ${deletedCount} favourites for profile ${profileId}`);
    
    return {
      success: true,
      deletedCount
    };
  } catch (error) {
    console.error("Error deleting favourites by profile ID:", error);
    return {
      success: false,
      deletedCount: 0
    };
  }
}

/**
 * Checks if a favourite exists in the database
 * @param favouriteId - The favourite ID
 * @returns Promise<boolean> - Whether the favourite exists
 */
export async function favouriteExists(favouriteId: string): Promise<boolean> {
  try {
    const favourite = await getFavouriteById(favouriteId);
    return favourite !== null;
  } catch (error) {
    console.error("Error checking if favourite exists:", error);
    return false;
  }
}
