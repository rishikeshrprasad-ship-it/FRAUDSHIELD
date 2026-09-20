import { doublePrecision, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const fraudReports = pgTable("fraud_reports", {
  id: text().primaryKey(),
  title: text().notNull(),
  scamType: text("scam_type").notNull(),
  amount: doublePrecision().notNull().default(0),
  description: text().notNull(),
  locationName: text("location_name").notNull(),
  latitude: doublePrecision().notNull(),
  longitude: doublePrecision().notNull(),
  victimName: text("victim_name").notNull().default(""),
  victimContact: text("victim_contact").notNull().default(""),
  suspectAccount: text("suspect_account").notNull().default(""),
  scamChannel: text("scam_channel").notNull().default(""),
  incidentDateTime: timestamp("incident_date_time", { withTimezone: true }),
  status: text().notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
