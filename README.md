# PhysChim — Site d'exercices pour collège

Un site éducatif Next.js pour des exercices de Physique-Chimie (6e, 5e, 4e, 3e) avec feedback IA, mode vocal, suivi de progression et badges.

## Prérequis
- Node.js 18+
- Windows PowerShell (les commandes ci-dessous sont compatibles)

## Configuration rapide
1. Copier `.env.example` en `.env` et compléter:
   - DATABASE_URL (SQLite)
   - NEXTAUTH_SECRET (générer un secret fort)
   - NEXTAUTH_URL (ex: http://localhost:3000)
   - OPENAI_API_KEY (optionnel)
2. Installer dépendances, générer Prisma, et lancer en dev:

```powershell
npm install
npm run prisma:generate
npm run dev
```

Ouvrir http://localhost:3000.

## Scripts utiles
```powershell
npm run build
npm start
npm run prisma:migrate
npm run test
```

## Comptes et rôles
- Inscription: /register (par défaut rôle Élève)
- Connexion: /login
- Espace élève: /dashboard
- Espace enseignant: /teacher (nécessite rôle TEACHER)

Pour promouvoir un compte en enseignant, mettre `role = 'TEACHER'` dans la DB (via Prisma Studio ou migration).

## RGPD (checklist synthétique)
- Minimisation des données: email, nom (optionnel), mot de passe haché (bcrypt).
- Base légale: intérêt légitime pédagogique; consentement pour la voix (si activée).
- Hébergement et transfert: vérifier l’emplacement si hébergé; éviter tout export hors UE non conforme.
- Durées de conservation: définir des périodes (ex: purge des soumissions après X mois).
- Droit d’accès/rectification/suppression: prévoir une page ou contact.
- Sous-traitants: si usage d’API IA (OpenAI), informer et fournir alternative locale (feedback interne par règles si pas de clé).
- Cookies: session d’auth (NextAuth). Ajouter bannière/informations si analytics.
- Sécurité: hachage bcrypt, sessions sécurisées, rate limiting à ajouter en prod.

## Tests
```powershell
npm run test
```

## Déploiement
- Variables d’env: reproduire celles de `.env.example`.
- Exécuter les migrations Prisma.

---
Ce projet est un point de départ; adaptez les exercices et la charte graphique selon votre collège.
