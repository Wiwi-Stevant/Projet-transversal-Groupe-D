# 🚀 Procédure de Déploiement - TP05/TP06/TP07

## 📋 Table des matières

1. [Déploiement Local](#déploiement-local)
2. [Déploiement en Production](#déploiement-en-production)
3. [Configuration Docker](#configuration-docker)
4. [Variables d'Environnement](#variables-denvironnement)
5. [Vérification & Tests](#vérification--tests)

---

## 🏠 Déploiement Local

### Prérequis

- Node.js >= 18.x
- npm >= 9.x
- PostgreSQL 14+ (ou SQLite pour développement)
- Git

### Étapes

#### 1. Cloner et Préparer

```bash
# Cloner le dépôt
git clone https://github.com/JN-EPHEC/individual-gaulthier-mre-01.git
cd individual-gaulthier-mre-01

# Vérifier les branches disponibles
git branch -a

# Vérifier TP05 (CI/CD)
git checkout main
git log --oneline | head -5

# Vérifier TP06 (Refactoring)
git checkout tp06
git log --oneline | head -5

# Vérifier TP07 (Authentication)
git checkout tp07
git log --oneline | head -5
```

#### 2. Installation Backend

```bash
cd server

# Installer les dépendances
npm install

# Configuration de la base de données
# Créer le fichier .env avec les variables nécessaires
cat > .env << EOF
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dev3_tp
DB_USER=postgres
DB_PASSWORD=your_password
DB_DIALECT=postgres

# JWT Secrets
JWT_ACCESS_SECRET=your_access_secret_key_min_32_chars_long
JWT_REFRESH_SECRET=your_refresh_secret_key_min_32_chars_long

# Server
PORT=5000
NODE_ENV=development
EOF

# Créer les migrations et base de données
npm run migrate

# Compiler TypeScript
npm run build

# Lancer le serveur
npm run dev
```

**Le serveur démarre sur:** `http://localhost:5000`
**Swagger API:** `http://localhost:5000/api-docs`

#### 3. Installation Frontend

```bash
cd ../client

# Installer les dépendances
npm install

# Créer le fichier .env
cat > .env << EOF
VITE_API_URL=http://localhost:5000
EOF

# Lancer le serveur de développement
npm run dev
```

**L'application démarre sur:** `http://localhost:5173`

---

## 🌍 Déploiement en Production

### Architecture Recommandée

```
┌─────────────────────────────────────────┐
│     Vercel / Netlify (Frontend)         │
│     - Client React optimisé (dist/)     │
│     - Variables d'env en CI/CD          │
└─────────────────────────────────────────┘
              ↓ (HTTPS)
┌─────────────────────────────────────────┐
│   Railway / Render (Backend API)        │
│     - Serveur Express avec TS compilé   │
│     - PostgreSQL managed database       │
│     - JWT authentication                │
└─────────────────────────────────────────┘
```

### Option 1: Railway.app

#### Backend API

1. **Créer un compte** sur [railway.app](https://railway.app)

2. **Connecter le dépôt GitHub**
   ```bash
   # Dans le dashboard Railway
   # New → GitHub Repo → Sélectionner individual-gaulthier-mre-01
   ```

3. **Configurer le Service API**
   ```yaml
   # Railway détecte automatiquement Node.js
   # Configure le build:
   - Start Command: npm run build && npm start
   - Working Directory: server/
   ```

4. **Ajouter les Variables d'Environnement**
   - `NODE_ENV` = `production`
   - `JWT_ACCESS_SECRET` = (générer une clé sécurisée)
   - `JWT_REFRESH_SECRET` = (générer une clé sécurisée)
   - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

5. **Ajouter PostgreSQL Plugin**
   ```
   Railway → Add Service → PostgreSQL
   # Les variables de connexion sont auto-remplies
   ```

6. **Déployer**
   ```bash
   # Railway déploie automatiquement sur chaque push à main
   # URL générée: https://api-[xxx].railway.app
   ```

#### Frontend React

1. **Builder le projet**
   ```bash
   cd client
   npm run build
   # Génère dist/
   ```

2. **Déployer sur Vercel**
   ```bash
   npm i -g vercel
   cd ../client
   vercel --prod
   ```

3. **Configurer les Variables**
   - Dans Vercel Dashboard → Settings → Environment Variables
   - `VITE_API_URL` = `https://api-[xxx].railway.app`

4. **Redéployer après changements**
   ```bash
   vercel --prod
   ```

---

### Option 2: Docker Compose (VPS/On-Premise)

#### Structure Dockerfile

**server/Dockerfile** (déjà existant):
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

#### Créer docker-compose.yml

```bash
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${DB_NAME:-dev3_tp}
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    environment:
      NODE_ENV: production
      DB_HOST: db
      DB_PORT: 5432
      DB_NAME: ${DB_NAME:-dev3_tp}
      DB_USER: ${DB_USER:-postgres}
      DB_PASSWORD: ${DB_PASSWORD:-postgres}
      JWT_ACCESS_SECRET: ${JWT_ACCESS_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      PORT: 5000
    ports:
      - "5000:5000"
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend (optionnel, servir en production par Nginx)
  frontend:
    image: nginx:alpine
    ports:
      - "3000:80"
    volumes:
      - ./client/dist:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - backend

volumes:
  postgres_data:
EOF
```

#### Créer nginx.conf

```bash
cat > nginx.conf << 'EOF'
events {
  worker_connections 1024;
}

http {
  server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location / {
      try_files $uri $uri/ /index.html;
    }

    location /api {
      proxy_pass http://backend:5000;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_cache_bypass $http_upgrade;
    }
  }
}
EOF
```

#### Lancer avec Docker Compose

```bash
# Créer le fichier .env pour Docker
cat > .env << EOF
DB_NAME=dev3_production
DB_USER=postgres
DB_PASSWORD=your_secure_password_here
JWT_ACCESS_SECRET=your_access_secret_key_min_32_chars_long
JWT_REFRESH_SECRET=your_refresh_secret_key_min_32_chars_long
EOF

# Builder les images
docker-compose build

# Lancer les services
docker-compose up -d

# Vérifier le statut
docker-compose ps

# Logs backend
docker-compose logs -f backend

# Logs frontend
docker-compose logs -f frontend
```

**Accès:**
- Frontend: `http://localhost:3000`
- API: `http://localhost:5000`
- Swagger: `http://localhost:5000/api-docs`

---

## 🔐 Variables d'Environnement

### Production (.env)

```env
# ============================================
# DATABASE
# ============================================
DB_HOST=your_postgres_host
DB_PORT=5432
DB_NAME=dev3_production
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_DIALECT=postgres

# ============================================
# JWT SECRETS (Générer avec: openssl rand -base64 32)
# ============================================
JWT_ACCESS_SECRET=your_generated_access_secret_32_chars_min
JWT_REFRESH_SECRET=your_generated_refresh_secret_32_chars_min

# ============================================
# SERVER
# ============================================
PORT=5000
NODE_ENV=production

# ============================================
# CORS (Frontend URL)
# ============================================
FRONTEND_URL=https://yourfrontend.com
```

### Générer des Secrets Sécurisés

```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Node.js (universel)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## ✅ Vérification & Tests

### 1. Tester l'API Backend

```bash
# Health check
curl http://localhost:5000/health

# Swagger UI
open http://localhost:5000/api-docs

# Test d'authentification
# HTTP Basic Auth
curl -u admin:supersecret http://localhost:5000/api/admin/basic

# JWT Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"student","password":"password123"}'

# Réponse attendue:
# {
#   "accessToken": "eyJhbGc...",
#   "user": {"id":1,"username":"student","role":"admin"}
# }

# Accéder à /profile (protégé)
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/profile
```

### 2. Tester le Frontend

```bash
# Dev mode
npm run dev

# Production build
npm run build

# Préview production
npm run preview

# Tests
npm run test

# Linter
npm run lint
```

### 3. Vérifier les Branches

```bash
# Main (TP05 - CI/CD)
git checkout main
npm run build

# TP06 (Refactoring + Design Patterns)
git checkout tp06
npm run build
npm run test  # Vérifier les fonctionnalités

# TP07 (Authentication)
git checkout tp07
npm run build
# Tester login: student/password123
```

---

## 📊 Checklist de Déploiement

### Pre-Deployment

- [ ] Code testé localement (`npm run build` sans erreurs)
- [ ] `.env` configuré avec tous les secrets
- [ ] Base de données créée et migrations exécutées
- [ ] Dépendances npm à jour (`npm audit`)
- [ ] Logs des CI/CD verts

### Deployment

- [ ] Branches correctes poussées sur GitHub (main, tp06, tp07)
- [ ] Variables d'environnement configurées en production
- [ ] Base de données PostgreSQL accessible
- [ ] SSL/HTTPS activé
- [ ] CORS autorisé pour frontend URL

### Post-Deployment

- [ ] Frontend accessible et charge sans erreurs
- [ ] API répond à health check
- [ ] Swagger UI fonctionne (`/api-docs`)
- [ ] Login réussit avec credentials de démo
- [ ] Tokens générés correctement
- [ ] Endpoints protégés retournent 401 sans token
- [ ] Token expiration gérée correctement

---

## 🆘 Troubleshooting

### Backend

```bash
# "Cannot connect to database"
→ Vérifier DB_HOST, DB_PORT, DB_USER, DB_PASSWORD

# "JWT_ACCESS_SECRET not defined"
→ Ajouter dans .env

# "Port already in use"
→ Changer PORT=5001 ou kill process: lsof -i :5000
```

### Frontend

```bash
# "VITE_API_URL not defined"
→ Créer .env avec VITE_API_URL=http://localhost:5000

# "CORS error from backend"
→ Vérifier FRONTEND_URL en variables d'environnement backend

# "Token stored but not sent"
→ Vérifier localStorage.getItem("accessToken") en console
```

### Docker

```bash
# "postgres health check failing"
docker-compose logs db

# "Backend can't connect to database"
docker-compose logs backend

# Redémarrer tous les services
docker-compose restart
```

---

## 📝 Commandes Utiles

```bash
# Build tout
npm run build-all  # À personnaliser selon package.json root

# Test tout
npm run test-all

# Push branche actuelle
git push -u origin $(git branch --show-current)

# Voir les fichiers non ignorés
git check-ignore -v $(git ls-files -o -i --exclude-standard | head -20)

# Vérifier secrets dans git (avant de pousser!)
git log --all -S 'PASSWORD' --pretty=format:"%h - %s"

# Préparer pour production
npm install --omit=dev
npm prune --production
```

---

## 🎯 Résumé des URLs

| Environnement | Backend | Frontend | Swagger |
|---|---|---|---|
| **Local Dev** | `http://localhost:5000` | `http://localhost:5173` | `http://localhost:5000/api-docs` |
| **Docker Local** | `http://localhost:5000` | `http://localhost:3000` | `http://localhost:5000/api-docs` |
| **Railway Prod** | `https://api-[id].railway.app` | `https://[project].vercel.app` | `https://api-[id].railway.app/api-docs` |

---

**Dernière mise à jour:** 2026-04-01  
**Version:** TP07 Complete
