-- Create "users" table
CREATE TABLE "users" (
  "id" text NOT NULL,
  "created_at" timestamptz NULL,
  "updated_at" timestamptz NULL,
  "deleted_at" timestamptz NULL,
  "username" text NOT NULL,
  "email" text NULL,
  "avatar" text NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "uni_users_email" UNIQUE ("email"),
  CONSTRAINT "uni_users_username" UNIQUE ("username")
);
-- Create index "idx_users_deleted_at" to table: "users"
CREATE INDEX "idx_users_deleted_at" ON "users" ("deleted_at");
-- Create "credentials" table
CREATE TABLE "credentials" (
  "id" text NOT NULL,
  "created_at" timestamptz NULL,
  "updated_at" timestamptz NULL,
  "deleted_at" timestamptz NULL,
  "user_id" text NULL,
  "password_hash" text NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_users_credentials" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- Create index "idx_credentials_deleted_at" to table: "credentials"
CREATE INDEX "idx_credentials_deleted_at" ON "credentials" ("deleted_at");
