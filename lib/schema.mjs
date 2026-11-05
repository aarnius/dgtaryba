// Lentelės sukuriamos automatiškai (CREATE TABLE IF NOT EXISTS),
// todėl saugu paleisti kiek nori kartų. Naują lentelę ar stulpelį pridėk čia.
export const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS ideas (
    id          SERIAL PRIMARY KEY,
    title       TEXT NOT NULL,
    body        TEXT,
    author      TEXT,
    status      TEXT NOT NULL DEFAULT 'pending',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS idea_votes (
    idea_id  INT  NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    voter    TEXT NOT NULL,
    PRIMARY KEY (idea_id, voter)
  )`,
  `CREATE TABLE IF NOT EXISTS polls (
    id          SERIAL PRIMARY KEY,
    question    TEXT NOT NULL,
    active      BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS poll_options (
    id       SERIAL PRIMARY KEY,
    poll_id  INT  NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    label    TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS poll_votes (
    poll_id    INT  NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    option_id  INT  NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
    voter      TEXT NOT NULL,
    PRIMARY KEY (poll_id, voter)
  )`,
  `CREATE TABLE IF NOT EXISTS events (
    id           SERIAL PRIMARY KEY,
    title        TEXT NOT NULL,
    description  TEXT,
    location     TEXT,
    emoji        TEXT DEFAULT '🎉',
    starts_at    TIMESTAMPTZ NOT NULL
  )`,
  // Puslapio redaktoriaus blokai (mygtukai, tekstai, juostos, nuotraukos)
  `CREATE TABLE IF NOT EXISTS blocks (
    id          SERIAL PRIMARY KEY,
    kind        TEXT NOT NULL,
    place       TEXT NOT NULL DEFAULT 'bottom',
    title       TEXT,
    body        TEXT,
    url         TEXT,
    color       TEXT NOT NULL DEFAULT 'mustard',
    position    INT  NOT NULL DEFAULT 0,
    visible     BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  // Tarybos nariai ir jų teisės (savininkas nurodytas lib/perms.js)
  `CREATE TABLE IF NOT EXISTS members (
    email       TEXT PRIMARY KEY,
    name        TEXT,
    perms       TEXT[] NOT NULL DEFAULT '{}',
    added_by    TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS questions (
    id           SERIAL PRIMARY KEY,
    body         TEXT NOT NULL,
    answer       TEXT,
    answered_at  TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  // Tarybos puslapis
  `CREATE TABLE IF NOT EXISTS council_members (
    id SERIAL PRIMARY KEY, name TEXT NOT NULL, role TEXT, class_name TEXT, bio TEXT,
    photo_url TEXT, contact TEXT, position INT NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS decisions (
    id SERIAL PRIMARY KEY, title TEXT NOT NULL, body TEXT, decided_on DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY, title TEXT NOT NULL, body TEXT, emoji TEXT DEFAULT '✅', done_on DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  // Galerija ir video
  `CREATE TABLE IF NOT EXISTS albums (
    id SERIAL PRIMARY KEY, title TEXT NOT NULL, event_date DATE, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS photos (
    id SERIAL PRIMARY KEY, album_id INT NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
    url TEXT NOT NULL, width INT, height INT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS videos (
    id SERIAL PRIMARY KEY, platform TEXT NOT NULL, video_id TEXT NOT NULL, url TEXT NOT NULL, title TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  // Nustatymai (pvz. skambučių tvarkaraštis) ir pranešimų prenumeratos
  `CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS push_subs (
    endpoint TEXT PRIMARY KEY, p256dh TEXT NOT NULL, auth TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  // Pokalbiai mokinys ↔ taryba
  `CREATE TABLE IF NOT EXISTS chat_threads (
    id SERIAL PRIMARY KEY, voter TEXT NOT NULL UNIQUE, name TEXT, status TEXT NOT NULL DEFAULT 'open',
    unread_admin INT NOT NULL DEFAULT 0, unread_user INT NOT NULL DEFAULT 0,
    last_at TIMESTAMPTZ NOT NULL DEFAULT now(), created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY, thread_id INT NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
    from_admin BOOLEAN NOT NULL DEFAULT false, author TEXT, body TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS chat_messages_thread ON chat_messages (thread_id, id)`,
];
