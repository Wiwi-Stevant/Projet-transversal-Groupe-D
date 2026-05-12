## ERD (US-1.1)

```mermaid
erDiagram
  users {
    BIGSERIAL id PK
    CITEXT email "UNIQUE, NOT NULL"
    TEXT password_hash "NOT NULL"
    TIMESTAMPTZ created_at "DEFAULT now()"
    TIMESTAMPTZ updated_at "DEFAULT now()"
  }

  events {
    BIGSERIAL id PK
    event_type type "DEFAULT entry"
    TIMESTAMPTZ created_at "DEFAULT now()"
  }

  config {
    BIGSERIAL id PK
    TEXT key_name "UNIQUE, NOT NULL"
    TEXT value "NOT NULL"
    TIMESTAMPTZ updated_at "DEFAULT now()"
    BIGINT updated_by FK "nullable"
  }

  users ||--o{ config : "updated_by"
```

### Notes
- `events.type` est un enum PostgreSQL (`event_type`) et ne contient pour l’instant que `entry` (facile à étendre si besoin).
- `config.key_name` permet de stocker des paramètres comme `threshold` (seuil), `led_state`, etc.
- `config.updated_by` est optionnel et passe à `NULL` si l’utilisateur est supprimé.

