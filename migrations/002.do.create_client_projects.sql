CREATE TABLE projects (
  id TEXT UNIQUE,
  name TEXT NOT NULL,
  status TEXT,
  deliverables TEXT,
  admin_approval BOOLEAN,
  client_approval BOOLEAN,
  end_timeframe TIMESTAMPTZ,
  type TEXT NOT NULL,
  price FLOAT,
  proposal TEXT,
  date_created TIMESTAMPTZ NOT NULL DEFAULT now(),
  date_modified TIMESTAMPTZ,
  user_id INTEGER
    REFERENCES users(id)
);
