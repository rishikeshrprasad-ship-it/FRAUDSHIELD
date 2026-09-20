import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { fraudReports } from "../../db/schema.js";

type ReportPayload = {
  title?: unknown;
  scam_type?: unknown;
  amount?: unknown;
  description?: unknown;
  location_name?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  victim_name?: unknown;
  victim_contact?: unknown;
  suspect_account?: unknown;
  scam_channel?: unknown;
  incident_date_time?: unknown;
  incidentDateTime?: unknown;
};

const asText = (value: unknown) => typeof value === "string" ? value.trim() : "";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const payload = await req.json() as ReportPayload;
    const title = asText(payload.title);
    const description = asText(payload.description);
    const scamType = asText(payload.scam_type);
    const locationName = asText(payload.location_name);
    const latitude = Number(payload.latitude);
    const longitude = Number(payload.longitude);
    const amount = Number(payload.amount) || 0;

    if (!title || !description || !scamType || !locationName) {
      return Response.json({ error: "Title, scam type, location, and description are required." }, { status: 400 });
    }

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return Response.json({ error: "A valid incident location is required." }, { status: 400 });
    }

    const incidentValue = asText(payload.incident_date_time) || asText(payload.incidentDateTime);
    const incidentDateTime = incidentValue ? new Date(incidentValue) : null;
    if (incidentDateTime && Number.isNaN(incidentDateTime.getTime())) {
      return Response.json({ error: "Incident date and time are invalid." }, { status: 400 });
    }

    const id = `FS-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
    const [report] = await db.insert(fraudReports).values({
      id,
      title,
      scamType,
      amount: Math.max(0, amount),
      description,
      locationName,
      latitude,
      longitude,
      victimName: asText(payload.victim_name),
      victimContact: asText(payload.victim_contact),
      suspectAccount: asText(payload.suspect_account),
      scamChannel: asText(payload.scam_channel),
      incidentDateTime,
    }).returning();

    return Response.json({
      id: report.id,
      title: report.title,
      scam_type: report.scamType,
      amount: report.amount,
      description: report.description,
      location_name: report.locationName,
      latitude: report.latitude,
      longitude: report.longitude,
      victim_name: report.victimName,
      victim_contact: report.victimContact,
      suspect_account: report.suspectAccount,
      scam_channel: report.scamChannel,
      incident_date_time: report.incidentDateTime,
      status: report.status,
      created_at: report.createdAt,
    }, { status: 201 });
  } catch (error) {
    console.error("Report submission failed", error);
    return Response.json({ error: "The report could not be submitted. Please try again." }, { status: 500 });
  }
};

export const config: Config = {
  path: "/api/report",
  method: "POST",
};
