import type { Config } from '@netlify/functions';
import { getDatabase } from '@netlify/database';

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

const text = (value: unknown) => typeof value === 'string' ? value.trim() : '';
const optionalNumber = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

export default async (request: Request) => {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  let payload: ReportPayload;
  try {
    payload = await request.json() as ReportPayload;
  } catch {
    return Response.json({ error: 'The report body must be valid JSON.' }, { status: 400 });
  }

  const title = text(payload.title);
  const scamType = text(payload.scam_type);
  const description = text(payload.description);
  const victimName = text(payload.victim_name);
  const victimContact = text(payload.victim_contact);

  if (!title || !scamType || !description || !victimName || !victimContact) {
    return Response.json(
      { error: 'Complete all required report fields before submitting.' },
      { status: 400 },
    );
  }

  const db = getDatabase();
  const incidentDateTime = text(payload.incident_date_time) || text(payload.incidentDateTime);

  try {
    const [createdCase] = await db.sql`
      INSERT INTO fraud_cases (
        title, scam_type, amount, description, location_name, latitude, longitude,
        victim_name, victim_contact, suspect_account, scam_channel, incident_date_time
      ) VALUES (
        ${title},
        ${scamType},
        ${optionalNumber(payload.amount) ?? 0},
        ${description},
        ${text(payload.location_name)},
        ${optionalNumber(payload.latitude)},
        ${optionalNumber(payload.longitude)},
        ${victimName},
        ${victimContact},
        ${text(payload.suspect_account)},
        ${text(payload.scam_channel)},
        ${incidentDateTime || null}
      )
      RETURNING *
    `;

    return Response.json(createdCase, { status: 201 });
  } catch (error) {
    console.error('Failed to persist fraud report', error);
    return Response.json(
      { error: 'The report could not be saved right now.' },
      { status: 500 },
    );
  }
};

export const config: Config = {
  path: '/api/report',
  method: 'POST',
};
