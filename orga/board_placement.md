# 📋 GitHub Project Board – Placement initial

> Convention points : 1 = ~30min | 2 = ~1h | 3 = ~1h30 | 5 = ~2h30 | 8 = ~4h

---

## 🟡 READY — À prendre en premier (sprint lundi)

Ces US sont les fondations, tout le reste en dépend.

| # | User Story | Epic | Points |
|---|---|---|---|
| US-1.1 | Schéma de base de données + ERD | DB | 2 |
| US-1.2 | Déploiement PostgreSQL en container | DB | 1 |
| US-2.1 | Setup projet backend (structure, Dockerfile, README) | Backend | 2 |
| US-4.1 | Setup projet frontend (React, Tailwind, Dockerfile) | Frontend | 2 |
| US-3.1 | Hash des mots de passe (bcrypt) | Auth | 1 |

**Total Ready : 8 points**

---

## 📥 BACKLOG — À planifier ensuite

### EPIC DB

| # | User Story | Points |
|---|---|---|
| US-1.3 | Seed de données de test | 1 |

### EPIC Backend

| # | User Story | Points |
|---|---|---|
| US-2.2 | Subscriber MQTT → enregistrement en DB | 5 |
| US-2.3 | Route GET /api/events | 2 |
| US-2.4 | Route GET /api/stats | 3 |
| US-2.5 | Route POST /api/led | 2 |
| US-2.6 | Route GET+POST /api/threshold | 2 |
| US-2.7 | Documentation Swagger/OpenAPI | 2 |

### EPIC Auth

| # | User Story | Points |
|---|---|---|
| US-3.2 | Route POST /api/auth/register | 2 |
| US-3.3 | Route POST /api/auth/login (JWT) | 2 |
| US-3.4 | Middleware d'authentification JWT | 2 |
| US-3.5 | Route GET /api/auth/me | 1 |
| US-3.6 | Validation des inputs (Zod) | 2 |

### EPIC Frontend

| # | User Story | Points |
|---|---|---|
| US-4.2 | Page de login | 3 |
| US-4.3 | Protection des routes (guard) | 2 |
| US-4.4 | Dashboard – compteur temps réel | 5 |
| US-4.5 | Dashboard – graphique d'activité | 5 |
| US-4.6 | Dashboard – contrôle de la LED | 2 |
| US-4.7 | Dashboard – configuration du seuil | 2 |
| US-4.8 | Page historique paginée | 3 |

### EPIC CI/CD

| # | User Story | Points |
|---|---|---|
| US-5.1 | Tests unitaires API + coverage | 5 |
| US-5.2 | Pipeline CI (GitHub Actions) | 3 |
| US-5.3 | Pipeline CD (déploiement auto SSH) | 5 |

**Total Backlog : 62 points**

---

## 📊 Résumé par epic

| Epic | Points totaux |
|---|---|
| DB | 3 |
| Backend | 18 |
| Auth | 10 |
| Frontend | 22 |
| CI/CD | 13 |
| **TOTAL** | **66** |

---

## 📅 Suggestion de flow par demi-journée

### Lundi matin → passer en READY puis IN PROGRESS
- US-1.1, US-1.2, US-2.1, US-4.1, US-3.1

### Lundi après-midi → passer en READY
- US-3.2, US-3.3, US-3.4 (auth)
- US-2.2 (subscriber MQTT)
- US-1.3 (seed)

### Mardi matin → passer en READY
- US-2.3, US-2.4, US-2.5 (routes API)
- US-4.2, US-4.3 (login + guard)

### Mardi après-midi → passer en READY
- US-4.4, US-4.5 (dashboard)
- US-3.6 (validation)
- US-2.7 (Swagger)

### Mercredi matin → passer en READY
- US-5.1, US-5.2 (tests + CI)
- US-4.6, US-4.7, US-4.8 (finitions frontend)
- US-5.3 (CD) si le temps le permet
