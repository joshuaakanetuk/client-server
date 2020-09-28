CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  type TEXT NOT NULL,
  date_created TIMESTAMPTZ,
  created_by TEXT NOT NULL,
  project_id TEXT NOT NULL
    REFERENCES projects(id)
);
