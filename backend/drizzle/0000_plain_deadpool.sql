CREATE TYPE "public"."AuthProvider" AS ENUM('GOOGLE_OAUTH', 'EMAIL', 'EMAIL_PASSWORD');--> statement-breakpoint
CREATE TABLE "auth_method" (
	"created_at" timestamp(3) DEFAULT (now() AT TIME ZONE 'UTC'::text) NOT NULL,
	"updated_at" timestamp(3) DEFAULT (now() AT TIME ZONE 'UTC'::text) NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"google_sub" text,
	"google_email" text,
	"provider" "AuthProvider" NOT NULL,
	"password_hash" text,
	"email" text
);
--> statement-breakpoint
CREATE TABLE "chats" (
	"id" text PRIMARY KEY NOT NULL,
	"group_id" text NOT NULL,
	"user_id" text NOT NULL,
	"message" text,
	"file" text,
	"created_at" timestamp(3) DEFAULT (now() AT TIME ZONE 'UTC'::text) NOT NULL,
	"updated_at" timestamp(3) DEFAULT (now() AT TIME ZONE 'UTC'::text) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_groups" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"pass_code" text,
	"created_at" timestamp(3) DEFAULT (now() AT TIME ZONE 'UTC'::text) NOT NULL,
	"updated_at" timestamp(3) DEFAULT (now() AT TIME ZONE 'UTC'::text) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "group_users" (
	"id" text PRIMARY KEY NOT NULL,
	"group_id" text NOT NULL,
	"display_name" text NOT NULL,
	"session_id" text NOT NULL,
	"created_at" timestamp(3) DEFAULT (now() AT TIME ZONE 'UTC'::text) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"email" text,
	"avatar_url" text,
	"username" text,
	"is_banned" boolean DEFAULT false NOT NULL,
	"is_email_verified" boolean DEFAULT false NOT NULL,
	"verification_token" text,
	"created_at" timestamp(3) DEFAULT (now() AT TIME ZONE 'UTC'::text) NOT NULL,
	"updated_at" timestamp(3) DEFAULT (now() AT TIME ZONE 'UTC'::text) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auth_method" ADD CONSTRAINT "auth_method_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_group_id_chat_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."chat_groups"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "chat_groups" ADD CONSTRAINT "chat_groups_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "group_users" ADD CONSTRAINT "group_users_group_id_chat_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."chat_groups"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "chatgroup_id_idx" ON "chat_groups" USING btree ("id");--> statement-breakpoint
CREATE INDEX "chat_group_user_id_idx" ON "chat_groups" USING btree ("user_id");