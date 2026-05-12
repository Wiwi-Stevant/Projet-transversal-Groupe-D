# Base de données (PostgreSQL en container) — US-1.2

## Lancer PostgreSQL

Depuis la racine du repo :

```bash
docker compose -f docker-compose.db.yml up -d
```

## Vérifier que la DB est prête

```bash
docker compose -f docker-compose.db.yml ps
docker logs edf_postgres
```

## Connexion (depuis ta machine)

- Host: `localhost`
- Port: `${POSTGRES_PORT}` (par défaut `5432`)
- Database: `${POSTGRES_DB}` (par défaut `edf`)
- User: `${POSTGRES_USER}` (par défaut `postgres`)
- Password: `${POSTGRES_PASSWORD}`

## Initialisation du schéma

Le schéma est exécuté automatiquement au **premier** démarrage si le volume est vide via `edf/db.sql` monté dans `/docker-entrypoint-initdb.d/`.

Si tu veux réinitialiser (perte des données) :

```bash
docker compose -f docker-compose.db.yml down -v
docker compose -f docker-compose.db.yml up -d
```

## Seed de données de test (US-1.3)

Au premier démarrage avec volume vide, après le schéma (`edf/db.sql`), le fichier `edf/seed.sql` est appliqué automatiquement (`002_seed.sql`).

Comptes créés (mot de passe pour tests locaux : `edf-seed`) : `demo@edf.local`, `admin@edf.local`. Des lignes `events` et `config` sont aussi insérées.

Pour vérifier côté backend : depuis `edf/server`, avec PostgreSQL qui tourne (`docker compose -f docker-compose.db.yml up -d`), lancer `npm test` 
