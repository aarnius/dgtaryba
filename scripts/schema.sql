-- Idėjų dėžutė
CREATE TABLE IF NOT EXISTS ideas (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  body        TEXT,
  author      TEXT,
  status      TEXT NOT NULL DEFAULT 'pending', -- pending | approved | done
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS idea_votes (
  idea_id  INT  NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  voter    TEXT NOT NULL,
  PRIMARY KEY (idea_id, voter)
);

-- Apklausos
CREATE TABLE IF NOT EXISTS polls (
  id          SERIAL PRIMARY KEY,
  question    TEXT NOT NULL,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS poll_options (
  id       SERIAL PRIMARY KEY,
  poll_id  INT  NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  label    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS poll_votes (
  poll_id    INT  NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id  INT  NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  voter      TEXT NOT NULL,
  PRIMARY KEY (poll_id, voter)
);

-- Renginiai
CREATE TABLE IF NOT EXISTS events (
  id           SERIAL PRIMARY KEY,
  title        TEXT NOT NULL,
  description  TEXT,
  location     TEXT,
  emoji        TEXT DEFAULT '🎉',
  starts_at    TIMESTAMPTZ NOT NULL
);

-- Anoniminiai klausimai
CREATE TABLE IF NOT EXISTS questions (
  id           SERIAL PRIMARY KEY,
  body         TEXT NOT NULL,
  answer       TEXT,
  answered_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
