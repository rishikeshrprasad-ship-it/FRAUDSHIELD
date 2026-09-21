CREATE TABLE fraud_reports (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  scam_type TEXT NOT NULL,
  amount NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  description TEXT NOT NULL,
  location_name TEXT NOT NULL DEFAULT '',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  victim_name TEXT NOT NULL DEFAULT '',
  victim_contact TEXT NOT NULL DEFAULT '',
  suspect_account TEXT NOT NULL DEFAULT '',
  scam_channel TEXT NOT NULL DEFAULT '',
  incident_date_time TEXT,
  status TEXT NOT NULL DEFAULT 'REPORTED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX fraud_reports_created_at_idx ON fraud_reports (created_at DESC);
