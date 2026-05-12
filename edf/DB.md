# Base de données (PostgreSQL en container) — US-1.2

## Lancer PostgreSQL

```bash
docker compose -f docker-compose.db.yml up -d
```

## Vérifier la DB 

```bash
docker compose -f docker-compose.db.yml ps
docker logs edf_postgres
```

## Connexion 

- Host: `localhost`
- Port: `${POSTGRES_PORT}` (par défaut `5432`)
- Database: `${POSTGRES_DB}` (par défaut `edf`)
- User: `${POSTGRES_USER}` (par défaut `postgres`)
- Password: `${POSTGRES_PASSWORD}`

## Initialisation du schéma

Le schéma est exécuté automatiquement au **premier** démarrage si le volume est vide via `edf/db.sql` monté dans `/docker-entrypoint-initdb.d/`.
(perte des données) :

```bash
docker compose -f docker-compose.db.yml down -v
docker compose -f docker-compose.db.yml up -d
```
