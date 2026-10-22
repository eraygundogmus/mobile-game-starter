-- Verified runs. The client picks the id (idempotency key): a retry with the same id returns the stored row.
CREATE TABLE runs (
  id TEXT PRIMARY KEY,
  day TEXT NOT NULL,
  name TEXT NOT NULL,
  score INTEGER NOT NULL,
  ticks INTEGER NOT NULL,
  hash TEXT NOT NULL,
  engine INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX runs_board ON runs (day, score DESC, created_at ASC);
