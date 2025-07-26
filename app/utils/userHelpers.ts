import db from '@/db'
import { usersTable } from '@/db/schema'
import { eq } from 'drizzle-orm'

export interface CreateUserData {
  userId: string
  email: string
  name: string
  phoneNumber?: string | null
}

export interface UpdateUserData {
  email?: string
  name?: string
  phoneNumber?: string | null
}

/**
 * Creates a new user record in the database
 * @param userData - User data to create
 * @returns Promise<User | null> - The created user or null if creation failed
 */
export async function createUser(userData: CreateUserData) {
  try {
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.userId, userData.userId))
      .limit(1)
    
    if (existingUser.length > 0) {
      console.log(`User with ID ${userData.userId} already exists`)
      return existingUser[0]
    }

    // Create new user
    const newUser = await db
      .insert(usersTable)
      .values({
        userId: userData.userId,
        email: userData.email,
        name: userData.name,
        phoneNumber: userData.phoneNumber || null,
      })
      .returning()

    console.log('New user created:', newUser[0])
    return newUser[0]
  } catch (error) {
    console.error('Error creating user:', error)
    return null
  }
}

/**
 * Updates an existing user record in the database
 * @param userId - The Clerk user ID
 * @param updateData - Data to update
 * @returns Promise<User | null> - The updated user or null if update failed
 */
export async function updateUser(userId: string, updateData: UpdateUserData) {
  try {
    const updatedUser = await db
      .update(usersTable)
      .set(updateData)
      .where(eq(usersTable.userId, userId))
      .returning()

    if (updatedUser.length === 0) {
      console.log(`User with ID ${userId} not found for update`)
      return null
    }

    console.log('User updated:', updatedUser[0])
    return updatedUser[0]
  } catch (error) {
    console.error('Error updating user:', error)
    return null
  }
}

/**
 * Gets a user by their Clerk user ID
 * @param userId - The Clerk user ID
 * @returns Promise<User | null> - The user or null if not found
 */
export async function getUserById(userId: string) {
  try {
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.userId, userId))
      .limit(1)
    
    return user.length > 0 ? user[0] : null
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

/**
 * Checks if a user exists in the database
 * @param userId - The Clerk user ID
 * @returns Promise<boolean> - Whether the user exists
 */
export async function userExists(userId: string): Promise<boolean> {
  try {
    const user = await getUserById(userId)
    return user !== null
  } catch (error) {
    console.error('Error checking if user exists:', error)
    return false
  }
}
