DO $$ BEGIN
 CREATE TYPE "public"."server_type" AS ENUM('Misskey', 'OtherServer');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."timeline_type" AS ENUM('HOME', 'LOCAL', 'GLOBAL', 'LIST', 'USER', 'CHANNEL');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'USER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "panel" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"server_session_id" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "server_info" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"server_session_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"icon_url" text NOT NULL,
	"favicon_url" text NOT NULL,
	"theme_color" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "server_info_server_session_id_unique" UNIQUE("server_session_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "server_session" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"origin" varchar(255) NOT NULL,
	"server_token" text NOT NULL,
	"server_type" "server_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "timeline" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"server_session_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "timeline_type" NOT NULL,
	"list_id" varchar(255),
	"channel_id" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_info" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"username" varchar(255) NOT NULL,
	"avater_url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"server_s_ession_id" varchar(255) NOT NULL,
	"user_id" varchar(255),
	CONSTRAINT "user_info_server_s_ession_id_unique" UNIQUE("server_s_ession_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_setting" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"key" varchar(255) NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"password" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_role" "user_role" DEFAULT 'USER' NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "panel" ADD CONSTRAINT "panel_server_session_id_server_session_id_fk" FOREIGN KEY ("server_session_id") REFERENCES "public"."server_session"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "server_info" ADD CONSTRAINT "server_info_server_session_id_server_session_id_fk" FOREIGN KEY ("server_session_id") REFERENCES "public"."server_session"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "server_session" ADD CONSTRAINT "server_session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "timeline" ADD CONSTRAINT "timeline_server_session_id_server_session_id_fk" FOREIGN KEY ("server_session_id") REFERENCES "public"."server_session"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_info" ADD CONSTRAINT "user_info_server_s_ession_id_server_session_id_fk" FOREIGN KEY ("server_s_ession_id") REFERENCES "public"."server_session"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_info" ADD CONSTRAINT "user_info_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_setting" ADD CONSTRAINT "user_setting_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "panel_server_session_id_idx" ON "panel" USING btree ("server_session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "server_info_server_session_id_idx" ON "server_info" USING btree ("server_session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "server_session_user_id_idx" ON "server_session" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "server_session_origin_user_id_key" ON "server_session" USING btree ("origin","user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "timeline_server_session_id_idx" ON "timeline" USING btree ("server_session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_info_server_s_ession_id_idx" ON "user_info" USING btree ("server_s_ession_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_info_user_id_idx" ON "user_info" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_setting_user_id_idx" ON "user_setting" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_email_key" ON "user" USING btree ("email");