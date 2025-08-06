import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { ulid } from 'ulid';

export const users = pgTable('users', {
  id: varchar().primaryKey().$default(() => ulid()),
  username: varchar().unique().notNull().unique(),
  email: varchar().unique().notNull().unique(),
  avatar: varchar(),
});
