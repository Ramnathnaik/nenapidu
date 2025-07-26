import db from '@/db'
import { profileTable } from '@/db/schema'
import { eq } from 'drizzle-orm'

export interface CreateProfileData {
  profileName: string
  profileDescription?: string | null
  profileImgUrl?: string | null
  userId: string
}

export interface UpdateProfileData {
  profileName?: string
  profileDescription?: string | null
  profileImgUrl?: string | null
}

/**
 * Creates a new profile record in the database
 * @param profileData - Profile data to create
 * @returns Promise<Profile | null> - The created profile or null if creation failed
 */
export async function createProfile(profileData: CreateProfileData) {
  try {
    const newProfile = await db
      .insert(profileTable)
      .values({
        profileName: profileData.profileName,
        profileDescription: profileData.profileDescription || null,
        userId: profileData.userId,
      })
      .returning()

    console.log('New profile created:', newProfile[0])
    return newProfile[0]
  } catch (error) {
    console.error('Error creating profile:', error)
    return null
  }
}

/**
 * Updates an existing profile record in the database
 * @param profileId - The profile ID
 * @param updateData - Data to update
 * @returns Promise<Profile | null> - The updated profile or null if update failed
 */
export async function updateProfile(profileId: string, updateData: UpdateProfileData) {
  try {
    const updatedProfile = await db
      .update(profileTable)
      .set(updateData)
      .where(eq(profileTable.profileId, profileId))
      .returning()

    if (updatedProfile.length === 0) {
      console.log(`Profile with ID ${profileId} not found for update`)
      return null
    }

    console.log('Profile updated:', updatedProfile[0])
    return updatedProfile[0]
  } catch (error) {
    console.error('Error updating profile:', error)
    return null
  }
}

/**
 * Gets a profile by its ID
 * @param profileId - The profile ID
 * @returns Promise<Profile | null> - The profile or null if not found
 */
export async function getProfileById(profileId: string) {
  try {
    const profile = await db
      .select()
      .from(profileTable)
      .where(eq(profileTable.profileId, profileId))
      .limit(1)
    
    return profile.length > 0 ? profile[0] : null
  } catch (error) {
    console.error('Error getting profile:', error)
    return null
  }
}

/**
 * Gets all profiles for a specific user
 * @param userId - The user ID
 * @returns Promise<Profile[]> - Array of profiles for the user
 */
export async function getProfilesByUserId(userId: string) {
  try {
    const profiles = await db
      .select()
      .from(profileTable)
      .where(eq(profileTable.userId, userId))
    
    return profiles
  } catch (error) {
    console.error('Error getting profiles by user ID:', error)
    return []
  }
}

/**
 * Deletes a profile by its ID
 * @param profileId - The profile ID
 * @returns Promise<boolean> - Whether the deletion was successful
 */
export async function deleteProfile(profileId: string) {
  try {
    const deletedProfile = await db
      .delete(profileTable)
      .where(eq(profileTable.profileId, profileId))
      .returning()

    if (deletedProfile.length === 0) {
      console.log(`Profile with ID ${profileId} not found for deletion`)
      return false
    }

    console.log('Profile deleted:', deletedProfile[0])
    return true
  } catch (error) {
    console.error('Error deleting profile:', error)
    return false
  }
}

/**
 * Checks if a profile exists in the database
 * @param profileId - The profile ID
 * @returns Promise<boolean> - Whether the profile exists
 */
export async function profileExists(profileId: string): Promise<boolean> {
  try {
    const profile = await getProfileById(profileId)
    return profile !== null
  } catch (error) {
    console.error('Error checking if profile exists:', error)
    return false
  }
}
