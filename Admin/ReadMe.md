# 🏗️ Infrastructure LAN + DMZ (Docker / Debian)

Ce document résume l’architecture complète de l’infrastructure composée de **deux machines Debian**, chacune exécutant des services en **Docker**, avec une séparation stricte entre le **LAN interne** et la **DMZ**.

---

# 📌 1. Vue d’ensemble

L’infrastructure repose sur deux serveurs :

- **Machine LAN interne**
  - Héberge les services internes critiques :
    - DNS interne
    - Reverse proxy interne
    - Système de logs centralisé
    - Serveur NTP interne
- **Machine DMZ**
  - Héberge les services exposés ou semi-exposés :
    - Reverse proxy DMZ
    - Web/API
    - Base de données
    - Proxy sortant

La DMZ est isolée du LAN via un firewall, avec uniquement les flux nécessaires autorisés.

---

# 📌 2. Schéma global (avec conteneurs)

```
                           ┌──────────────────────────────┐
                           │            Internet           │
                           └───────────────┬──────────────┘
                                           │ 80/443
                                   ┌───────┴────────┐
                                   │  Machine DMZ    │
                                   │  Debian + Docker│
                                   └───────┬────────┘
                                           │
                                 ┌─────────┴──────────┐
                                 │        DMZ          │
                                 └─────────┬──────────┘
                                           │
       ┌───────────────────────────────────┼──────────────────────────────────┐
       │                                   │                                  │
       ▼                                   ▼                                  ▼
┌────────────────┐                ┌────────────────┐                 ┌────────────────┐
│ Reverse Proxy   │ (container)   │ Web/API         │ (container)    │ DB (Postgres/  │ (container)
│ DMZ (Traefik)   │ <──80/443──── │ (Docker)        │  <──5432────── │ MariaDB)       │
└────────────────┘                └────────────────┘                 └────────────────┘
       │                                   │
       │                                   ▼
       │                          ┌────────────────┐
       │                          │ Proxy sortant  │ (container)
       │                          │   (Squid)      │
       │                          └────────────────┘
       │
       │  UDP 123 (NTP) + Logs + DNS (optionnel)
       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                             Machine LAN interne                               │
│                             Debian + Docker                                   │
└───────────────────────────────────┬──────────────────────────────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
┌────────────────┐        ┌──────────────────┐        ┌──────────────────────┐
│ DNS interne     │        │ Reverse Proxy    │        │ Système de logs      │
│ (CoreDNS)       │        │ interne (Nginx)  │        │ (Loki / ELK / Graylog)│
│ (container)     │        │ (container)      │        │ (container)           │
└────────────────┘        └──────────────────┘        └──────────────────────┘
         │                          │                          │
         └───────────────┬──────────┴──────────┬──────────────┘
                         ▼                     ▼
                ┌────────────────┐     ┌────────────────┐
                │ NTP interne     │     │ Services divers │
                │ (cturra/ntp)    │     │ (containers)    │
                │ (host network)  │     └────────────────┘
                └────────────────┘
```

---

# 📌 5. Flux réseau autorisés

### 🔐 Internet → DMZ
- `80/443` → Reverse proxy DMZ

### 🔐 DMZ → LAN
- `UDP 123` → NTP interne
- `TCP 3100 / 5044 / 12201` → Système de logs
- `TCP/UDP 53` → DNS interne 
- `HTTP/HTTPS` → Proxy sortant (si en LAN)

### 🔐 LAN → DMZ
- SSH (via bastion)
- Monitoring (ICMP, SNMP, Prometheus)

---

# 📌 6. Synchronisation NTP

### Machine LAN (serveur NTP)
→ Conteneur `cturra/ntp` en mode host.

### Machine DMZ (client NTP)
Dans `/etc/chrony/chrony.conf` :

```
server <IP_LAN_NTP> iburst
```

Puis :

```
systemctl restart chrony
```

Les conteneurs DMZ montent :

```
/etc/localtime:/etc/localtime:ro
```

➡️ Ils héritent de l’heure du host.

---

# 📌 7. Objectifs atteints

✔ Séparation stricte LAN / DMZ  
✔ Services internes sécurisés  
✔ Services exposés isolés  
✔ Logs centralisés  
✔ NTP interne fiable  
✔ Architecture professionnelle et maintenable  
✔ Full Docker sur Debian  

---

# 📌 8. Auteur

Infrastructure conçue pour un environnement pédagogique / professionnel moderne, basée sur Docker, Debian et une segmentation réseau stricte.

test
