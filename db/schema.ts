import {
  boolean,
  date,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// Frequency enum for reminder recurrence
// NEVER: One-time reminder (non-recurring)
// MONTH: Monthly recurring reminder
// YEAR: Yearly recurring reminder
export const frequencyEnum = pgEnum("frequency", ["NEVER", "MONTH", "YEAR"]);

export const usersTable = pgTable("users", {
  userId: varchar("userId").primaryKey().notNull(),
  email: varchar("email", { length: 256 }).notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  phoneNumber: varchar("phoneNumber", { length: 256 }),
});

export const profileTable = pgTable("profile", {
  profileId: uuid("profileId").primaryKey().notNull().defaultRandom(),
  profileName: varchar("profileName", { length: 256 }).notNull(),
  profileDescription: varchar("profileDescription"),
  profileImgUrl: varchar("profileImgUrl", { length: 512 }),
  userId: varchar("userId", { length: 256 }).notNull().references(() => usersTable.userId),
});

export const remindersTable = pgTable("reminders", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  title: varchar("title", { length: 256 }).notNull(),
  description: varchar("description"),
  dateToRemember: date("dateToRemember").notNull(),
  completed: boolean("completed").notNull(),
  shouldExpire: boolean("shouldExpire").notNull(),
  frequency: frequencyEnum("frequency").notNull(),
  userId: varchar("userId", { length: 256 }).notNull(),
  profileId: uuid("profileId").references(() => profileTable.profileId),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const favouritesTable = pgTable("favourites", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  title: varchar("title", { length: 256 }).notNull(),
  description: varchar("description"),
  userId: varchar("userId", { length: 256 }).notNull().references(() => usersTable.userId),
  profileId: uuid("profileId").notNull().references(() => profileTable.profileId),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Reminder = typeof remindersTable.$inferSelect;
export type NewReminder = typeof remindersTable.$inferInsert;
export type Profile = typeof profileTable.$inferSelect;
export type NewProfile = typeof profileTable.$inferInsert;
export type Favourite = typeof favouritesTable.$inferSelect;
export type NewFavourite = typeof favouritesTable.$inferInsert;
