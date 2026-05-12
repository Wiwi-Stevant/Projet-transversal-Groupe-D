# Frontend EDF (React + Vite + Tailwind) — US-4.1

## Prérequis

- Node.js 18+ (idéalement 20+)

## Démarrage (dev)

```bash
npm install
npm run dev
```

Par défaut, Vite démarre sur `http://localhost:5173`.

## Variables d’environnement

- `VITE_API_URL` : URL du backend (ex: `http://localhost:5000`)

## Build (prod)

```bash
npm run build
npm run preview
```

## Docker

Build + run (sert le build via Nginx) :

```bash
docker build -t edf-frontend .
docker run --rm -p 3000:80 edf-frontend
```

Puis ouvre `http://localhost:3000`.
