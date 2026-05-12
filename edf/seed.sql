-- Données de test (US-1.3) — exécuté après le schéma (docker-entrypoint-initdb.d).
-- Mot de passe applicatif documenté pour les comptes seed : edf-seed
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO users (id, email, password_hash) VALUES
  (1, 'demo@edf.local', crypt('edf-seed', gen_salt('bf'))),
  (2, 'admin@edf.local', crypt('edf-seed', gen_salt('bf')));

SELECT setval(
  pg_get_serial_sequence('users', 'id'),
  COALESCE((SELECT MAX(id) FROM users), 1)
);

INSERT INTO events (type, created_at) VALUES
  ('entry', TIMESTAMPTZ '2026-01-10 08:00:00+00'),
  ('entry', TIMESTAMPTZ '2026-01-10 09:15:00+00'),
  ('entry', TIMESTAMPTZ '2026-01-10 10:30:00+00');

INSERT INTO config (key_name, value, updated_by) VALUES
  ('activity_threshold', '100', 1),
  ('site_name', 'EDF Demo', NULL);

COMMIT;
