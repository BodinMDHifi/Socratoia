# Socratoia Frontend

Prototype d’interface pour la plateforme de tutorat socratique décrite dans le README racine. L’objectif est de proposer une
page d’accueil immersive présentant le parcours élève, les modules de conversation et les garanties RGPD.

## Prérequis
- Node.js 20+
- npm 10+

## Démarrage rapide
```bash
npm install
npm run dev
```
Le serveur Vite écoute par défaut sur [http://localhost:5173](http://localhost:5173). Ajoutez `-- --host 0.0.0.0` pour un accès
réseau.

## Scripts disponibles
- `npm run dev` : serveur de développement avec HMR.
- `npm run build` : build de production (`dist/`).
- `npm run preview` : prévisualisation du build local.
- `npm run lint` : lint via ESLint.

## Structure
- `src/App.tsx` : composition de la page (hero, parcours, modules, roadmap).
- `src/App.css` : styles spécifiques à la page.
- `src/index.css` : variables de thème pastel, polices et styles globaux.

## Étapes suivantes
- Intégrer un routeur et préparer l’espace administration.
- Ajouter des composants interactifs (chat, canvas, audio) connectés à l’API.
- Couvrir les nouveaux composants avec des tests unitaires (Vitest / Testing Library).
