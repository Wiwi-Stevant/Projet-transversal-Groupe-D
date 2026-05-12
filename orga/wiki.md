Application Web IoT Entry Counter

> Projet transversal 2T – Groupe D  

---
 
## 1. Description de la webapp
 
**IoT Entry Counter** est une application web temps réel permettant de visualiser et de contrôler un système de comptage d'entrées physiques basé sur un Raspberry Pi Pico W.
 
Concrètement, chaque appui sur le bouton physique connecté au Pico W déclenche l'envoi d'un message MQTT qui est reçu par le backend, enregistré en base de données, et immédiatement reflété sur le dashboard web. En sens inverse, l'utilisateur peut depuis l'interface web allumer ou éteindre la LED connectée au Pico W, et configurer un seuil d'alerte à partir duquel la LED s'allume automatiquement.
 
L'application s'adresse aux administrateurs du système qui souhaitent :
- Suivre l'activité en temps réel (nombre d'entrées du jour, de la semaine, du mois)
- Analyser les données historiques via des graphiques
- Piloter l'actionneur physique (LED) à distance
- Accéder à un historique complet et filtrable des événements
---
 
## 2. Choix techniques
 
### 2.1 Backend – Node.js + Express
 
Nous avons choisi **Node.js** avec le framework **Express** pour le backend pour plusieurs raisons :
 
- **Ecosystème riche** : librairies disponibles pour MQTT (`mqtt.js`), JWT (`jsonwebtoken`), ORM (`Prisma`), validation (`Zod`)
- **Async natif** : Node.js est particulièrement adapté aux applications orientées événements, ce qui correspond parfaitement à notre architecture MQTT
- **Uniformité** : JavaScript côté backend et frontend, ce qui facilite la collaboration au sein de l'équipe
- **Rapidité de développement** : Express est minimaliste et nous permet de structurer l'API rapidement
### 2.2 Frontend – React + Tailwind CSS
 
**React** a été choisi pour le frontend car :
 
- Framework vu en cours, maîtrisé par l'équipe
- Architecture en composants réutilisables, idéale pour un dashboard avec plusieurs widgets (compteur, graphique, contrôle LED…)
- Gestion d'état simple avec les hooks (`useState`, `useEffect`) pour le polling temps réel
- Large choix de librairies de graphiques compatibles (Recharts)
**Tailwind CSS** complète React pour le style :
 
- Utility-first : pas besoin de fichiers CSS séparés, le style est directement dans le composant
- Cohérence visuelle garantie par le système de design intégré
- Rapide à prendre en main, gain de temps significatif sur un projet de 3 jours

### 2.3 Documentation API – Swagger (OpenAPI)
 
**Swagger UI** via `swagger-jsdoc` + `swagger-ui-express` permet :
 
- Une documentation interactive accessible sur `/api/docs`
- De tester les endpoints directement depuis le navigateur sans outil externe
- De formaliser le contrat d'API entre le frontend et le backend dès le début du projet
### 2.4 Authentification – JWT
 
L'authentification est gérée via **JSON Web Tokens** :
 
- Stateless : pas besoin de session côté serveur
- Le token est signé avec un secret fort et expire après 24h
- Les mots de passe sont hashés avec **bcrypt** (10 rounds) avant stockage
- Un middleware Express vérifie le token sur toutes les routes protégées
### 2.5 Communication IoT – MQTT (Mosquitto)
 
Le broker **Mosquitto** est déployé en container et sert de pivot entre le Pico W et le backend :
 
- Topic montant : `iot/groupe-d/entry` (Pico W → backend → DB)
- Topic descendant : `iot/groupe-d/led/command` (backend → Pico W → LED)
- Authentification par user/password activée sur Mosquitto
- Le backend s'abonne et publie via la librairie `mqtt.js`
### 2.6 Conteneurisation – Docker
 
L'ensemble de l'application est conteneurisé via **Docker Compose** :
 
- Un container par service : `api`, `frontend`, `db`, `mosquitto`, `nginx`
- Facilite le déploiement sur les serveurs MiniForums
- Garantit la reproductibilité de l'environnement
### 2.7 CI/CD – GitHub Actions
 
- **CI** : lint + tests unitaires + rapport de coverage à chaque push
- **CD** : déploiement automatique sur le serveur via SSH à chaque merge sur `main`
---
 
## 3. Fonctionnalités à implémenter
 
### Fonctionnalités 
 
#### Authentification
- [ ] Inscription d'un compte administrateur
- [ ] Connexion avec email + mot de passe
- [ ] Protection des routes sensibles (JWT)
- [ ] Déconnexion
#### Dashboard – Visualisation temps réel
- [ ] Affichage du compteur d'entrées du jour, mis à jour automatiquement
- [ ] Affichage des totaux de la semaine et du mois
- [ ] Graphique d'activité par heure (dernières 24h)
- [ ] Indicateur d'heure de pointe
#### Contrôle IoT
- [ ] Bouton ON/OFF pour contrôler la LED à distance
- [ ] Indicateur visuel de l'état actuel de la LED
- [ ] Configuration d'un seuil d'alerte (la LED s'allume automatiquement si le compteur le dépasse)
#### Logs
- [ ] Tableau paginé de tous les événements (timestamp + type)
- [ ] Filtre par plage de dates
#### API REST documentée
- [ ] `GET /api/events` – liste paginée des événements
- [ ] `GET /api/stats` – statistiques agrégées
- [ ] `POST /api/led` – commande de la LED (protégée)
- [ ] `GET /api/threshold` – lecture du seuil
- [ ] `POST /api/threshold` – mise à jour du seuil (protégée)
- [ ] `POST /api/auth/register` – inscription
- [ ] `POST /api/auth/login` – connexion
- [ ] `GET /api/auth/me` – profil utilisateur connecté
- [ ] Documentation Swagger sur `/api/docs`
#### Base de données
- [ ] Table `users`
- [ ] Table `events`
- [ ] Table `config` (seuil)
- [ ] Migrations versionnées
#### Infrastructure dev
- [ ] Docker Compose complet (api, frontend, db, mosquitto, nginx)
- [ ] Variables d'environnement via `.env`

---
 
## 4. Architecture globale
 
```
[Pico W]
   │  bouton pressé → publie sur MQTT topic "entry"
   │  reçoit commande → allume/éteint LED
   ▼
[Mosquitto BROKER] ←──────────────────────────────────┐
   │                                                   │
   ▼                                                   │
[Node.js / Express API]                                │
   │  subscribe → insère en DB                         │
   │  POST /api/led → publie commande LED ─────────────┘
   │
   ├── [MySql DB]
   │
   ▼
[React Frontend]
   │  polling toutes les 10s → GET /api/stats
   │  clic bouton → POST /api/led
   ▼
[Nginx reverse proxy – HTTPS]
   └── expose l'ensemble sur le réseau