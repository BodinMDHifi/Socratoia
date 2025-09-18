# SocratoIA – Interface web

Ce paquet contient la première itération de l’interface web de SocratoIA, une plateforme d’entraînement en physique-chimie
s’appuyant sur un professeur IA socratique. Cette version met l’accent sur les éléments essentiels : présentation de la
proposition de valeur, parcours élèves, espace enseignants et formulaire de contact.

## Démarrer en local

```bash
npm install
npm run dev
```

Le serveur Vite est alors accessible sur [http://localhost:5173](http://localhost:5173). Le rechargement à chaud est activé
pour faciliter l’itération sur les composants React et la feuille de styles.

## Scripts disponibles

- `npm run dev` : lance le serveur de développement Vite.
- `npm run build` : génère la version de production dans le dossier `dist`.
- `npm run preview` : sert localement la version construite.

## Structure du projet

- `src/App.tsx` : composition des sections principales (navigation, héros, fonctionnalités, etc.).
- `src/App.css` et `src/index.css` : styles globaux et composants.
- `public/` : ressources statiques servies telles quelles.

## Étapes suivantes

- Connecter le formulaire de contact à l’API du futur back-office.
- Ajouter une navigation mobile complète (fermeture automatique sur changement de section, ancrage fixe).
- Intégrer des visuels haute-fidélité et les futures captures du tableau de bord enseignant.
