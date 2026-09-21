import { getDatabase } from '@netlify/database';

type ReportInput = {
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

const text = (value: unknown, maxLength: number) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

const coordinate = (value: unknown, min: number, max: number) => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : null;
};

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  let body: ReportInput;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'A valid JSON request body is required' }, { status: 400 });
  }

  const title = text(body.title, 200);
  const scamType = text(body.scam_type, 120);
  const description = text(body.description, 5000);
  const latitude = coordinate(body.latitude, -90, 90);
  const longitude = coordinate(body.longitude, -180, 180);
  const rawAmount = typeof body.amount === 'number' ? body.amount : Number(body.amount);
  const amount = Number.isFinite(rawAmount) && rawAmount >= 0 ? rawAmount : 0;

  if (!title || !scamType || !description) {
    return Response.json(
      { error: 'Title, scam type, and description are required' },
      { status: 400 },
    );
  }

  const incidentDateTime = text(body.incident_date_time ?? body.incidentDateTime, 40) || null;
  const db = getDatabase();
  const [report] = await db.sql`
    INSERT INTO fraud_reports (
      title, scam_type, amount, description, location_name, latitude, longitude,
      victim_name, victim_contact, suspect_account, scam_channel, incident_date_time
    ) VALUES (
      ${title}, ${scamType}, ${amount}, ${description}, ${text(body.location_name, 300)},
      ${latitude}, ${longitude}, ${text(body.victim_name, 200)}, ${text(body.victim_contact, 100)},
      ${text(body.suspect_account, 200)}, ${text(body.scam_channel, 120)}, ${incidentDateTime}
    )
    RETURNING *
  `;

  return Response.json(report, { status: 201 });
};

export const config = {
  path: '/api/report',
};
