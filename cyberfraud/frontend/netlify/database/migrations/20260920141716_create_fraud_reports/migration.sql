CREATE TABLE "fraud_reports" (
	"id" text PRIMARY KEY,
	"title" text NOT NULL,
	"scam_type" text NOT NULL,
	"amount" double precision DEFAULT 0 NOT NULL,
	"description" text NOT NULL,
	"location_name" text NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"victim_name" text DEFAULT '' NOT NULL,
	"victim_contact" text DEFAULT '' NOT NULL,
	"suspect_account" text DEFAULT '' NOT NULL,
	"scam_channel" text DEFAULT '' NOT NULL,
	"incident_date_time" timestamp with time zone,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
