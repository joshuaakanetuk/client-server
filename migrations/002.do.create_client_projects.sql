CREATE TABLE projects (
  id TEXT UNIQUE,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  deliverables TEXT NOT NULL,
  admin_approval BOOLEAN,
  client_approval BOOLEAN,
  end_timeframe TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL,
  price FLOAT NOT NULL,
  proposal TEXT,
  date_created TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id INTEGER NOT NULL
    REFERENCES users(id)
);
