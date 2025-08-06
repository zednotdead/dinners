-- Create "users" table
CREATE TABLE "public"."users" ("id" character varying NOT NULL, "username" character varying NOT NULL, "email" character varying NOT NULL, PRIMARY KEY ("id"), CONSTRAINT "users_email_unique" UNIQUE ("email"), CONSTRAINT "users_username_unique" UNIQUE ("username"));
-- Create "credentials" table
CREATE TABLE "public"."credentials" ("id" character varying NOT NULL, "user_id" character varying NULL, "password_hash" character varying NULL, PRIMARY KEY ("id"), CONSTRAINT "credentials_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION);
