-- Schéma PostgreSQL (US-1.1)
-- Tables: users, events, config

BEGIN;

-- Extension utile pour email (optionnel mais pratique).
-- Si vous ne voulez pas d'extensions, supprimez ces 2 lignes et gardez email en TEXT.
CREATE EXTENSION IF NOT EXISTS citext;

-- Enum pour typer les événements.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_type') THEN
    CREATE TYPE event_type AS ENUM ('entry');
  END IF;
END$$;

-- Fonction/trigger standard pour maintenir updated_at.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS users (
  id           BIGSERIAL PRIMARY KEY,
  email        CITEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS events (
  id         BIGSERIAL PRIMARY KEY,
  type       event_type NOT NULL DEFAULT 'entry',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);

CREATE TABLE IF NOT EXISTS config (
  id         BIGSERIAL PRIMARY KEY,
  key_name   TEXT UNIQUE NOT NULL,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by BIGINT NULL REFERENCES users(id) ON DELETE SET NULL
);

DROP TRIGGER IF EXISTS trg_config_updated_at ON config;
CREATE TRIGGER trg_config_updated_at
BEFORE UPDATE ON config
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

COMMIT;