DO $$ BEGIN
 CREATE TYPE "public"."ServerType" AS ENUM('Misskey', 'OtherServer');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TYPE "TimelineType" ADD VALUE 'HOME';--> statement-breakpoint
ALTER TYPE "TimelineType" ADD VALUE 'LOCAL';--> statement-breakpoint
ALTER TYPE "TimelineType" ADD VALUE 'GLOBAL';--> statement-breakpoint
ALTER TYPE "TimelineType" ADD VALUE 'LIST';--> statement-breakpoint
ALTER TYPE "TimelineType" ADD VALUE 'USER';--> statement-breakpoint
ALTER TYPE "TimelineType" ADD VALUE 'CHANNEL';--> statement-breakpoint
ALTER TYPE "UserRole" ADD VALUE 'ADMIN';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"checksum" varchar(64) NOT NULL,
	"finished_at" timestamp with time zone,
	"migration_name" varchar(255) NOT NULL,
	"logs" text,
	"rolled_back_at" timestamp with time zone,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"applied_steps_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "server_info" DROP CONSTRAINT "server_info_server_session_id_unique";--> statement-breakpoint
ALTER TABLE "user_info" DROP CONSTRAINT "user_info_server_s_ession_id_unique";--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_email_unique";--> statement-breakpoint
ALTER TABLE "panel" DROP CONSTRAINT "panel_server_session_id_server_session_id_fk";
--> statement-breakpoint
ALTER TABLE "server_info" DROP CONSTRAINT "server_info_server_session_id_server_session_id_fk";
--> statement-breakpoint
ALTER TABLE "user_info" DROP CONSTRAINT "user_info_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "user_info" DROP CONSTRAINT "user_info_server_s_ession_id_server_session_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "user_info_user_id_idx";--> statement-breakpoint
ALTER TABLE "panel" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "panel" ALTER COLUMN "server_session_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "panel" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "server_info" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "server_info" ALTER COLUMN "server_session_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "server_info" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "server_info" ALTER COLUMN "theme_color" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "server_info" ALTER COLUMN "created_at" SET DATA TYPE timestamp(3);--> statement-breakpoint
ALTER TABLE "server_info" ALTER COLUMN "updated_at" SET DATA TYPE timestamp(3);--> statement-breakpoint
ALTER TABLE "server_info" ALTER COLUMN "updated_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "server_session" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "server_session" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "server_session" ALTER COLUMN "origin" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "server_session" ALTER COLUMN "server_type" SET DATA TYPE ServerType;--> statement-breakpoint
ALTER TABLE "server_session" ALTER COLUMN "created_at" SET DATA TYPE timestamp(3);--> statement-breakpoint
ALTER TABLE "server_session" ALTER COLUMN "updated_at" SET DATA TYPE timestamp(3);--> statement-breakpoint
ALTER TABLE "server_session" ALTER COLUMN "updated_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "timeline" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "timeline" ALTER COLUMN "server_session_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "timeline" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "timeline" ALTER COLUMN "type" SET DATA TYPE time;--> statement-breakpoint
ALTER TABLE "timeline" ALTER COLUMN "list_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "timeline" ALTER COLUMN "channel_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "timeline" ALTER COLUMN "created_at" SET DATA TYPE timestamp(3);--> statement-breakpoint
ALTER TABLE "timeline" ALTER COLUMN "updated_at" SET DATA TYPE timestamp(3);--> statement-breakpoint
ALTER TABLE "timeline" ALTER COLUMN "updated_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user_info" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_info" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_info" ALTER COLUMN "username" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_info" ALTER COLUMN "created_at" SET DATA TYPE timestamp(3);--> statement-breakpoint
ALTER TABLE "user_info" ALTER COLUMN "updated_at" SET DATA TYPE timestamp(3);--> statement-breakpoint
ALTER TABLE "user_info" ALTER COLUMN "updated_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user_info" ALTER COLUMN "server_s_ession_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_setting" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_setting" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_setting" ALTER COLUMN "key" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_setting" ALTER COLUMN "created_at" SET DATA TYPE timestamp(3);--> statement-breakpoint
ALTER TABLE "user_setting" ALTER COLUMN "updated_at" SET DATA TYPE timestamp(3);--> statement-breakpoint
ALTER TABLE "user_setting" ALTER COLUMN "updated_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "email" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "created_at" SET DATA TYPE timestamp(3);--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "updated_at" SET DATA TYPE timestamp(3);--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "updated_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "user_role" SET DATA TYPE UserRole;--> statement-breakpoint
ALTER TABLE "user_info" ADD COLUMN "userId" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "panel" ADD CONSTRAINT "panel_server_session_id_server_session_id_fk" FOREIGN KEY ("server_session_id") REFERENCES "public"."server_session"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "server_info" ADD CONSTRAINT "server_info_server_session_id_server_session_id_fk" FOREIGN KEY ("server_session_id") REFERENCES "public"."server_session"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_info" ADD CONSTRAINT "user_info_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_info" ADD CONSTRAINT "user_info_server_s_ession_id_server_session_id_fk" FOREIGN KEY ("server_s_ession_id") REFERENCES "public"."server_session"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "server_info_server_session_id_key" ON "server_info" USING btree ("server_session_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_info_server_s_ession_id_key" ON "user_info" USING btree ("server_s_ession_id");--> statement-breakpoint
ALTER TABLE "user_info" DROP COLUMN IF EXISTS "user_id";