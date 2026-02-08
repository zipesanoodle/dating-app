import { pgTable, serial, text, integer, timestamp, boolean, uniqueIndex } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const profiles = pgTable('profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  age: integer('age').notNull(),
  bio: text('bio'),
  imageUrl: text('image_url'),
  interests: text('interests').array(), // Simple array of strings
});

export const swipes = pgTable('swipes', {
  id: serial('id').primaryKey(),
  fromUserId: integer('from_user_id').references(() => users.id).notNull(),
  toUserId: integer('to_user_id').references(() => users.id).notNull(),
  direction: text('direction', { enum: ['left', 'right'] }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  swipeIdx: uniqueIndex('swipe_idx').on(table.fromUserId, table.toUserId),
}));

export const matches = pgTable('matches', {
  id: serial('id').primaryKey(),
  user1Id: integer('user1_id').references(() => users.id).notNull(),
  user2Id: integer('user2_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
