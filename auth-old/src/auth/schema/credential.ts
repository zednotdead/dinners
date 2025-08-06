import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { ulid } from 'ulid';
import { users } from './user';

export const credential = pgTable('credentials', {
  id: varchar().primaryKey().$default(() => ulid()),
  user_id: varchar().references(() => users.id),
  password_hash: varchar(),
});
