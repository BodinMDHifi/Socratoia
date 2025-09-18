# SocratoIA

Ce dépôt contient la documentation initiale et les premières briques de la plateforme SocratoIA, un site d'entraînement en
physique-chimie destiné aux collégiens (6ᵉ à 3ᵉ) qui conversent avec un professeur IA en mode socratique.

- [Stratégie de développement](docs/strategie_developpement.md) : vision produit, architecture, roadmap et prochaines étapes.
- [Interface web](web/README.md) : socle front-end React/TypeScript construit avec Vite.

Les sections techniques, maquettes et user stories seront ajoutées au fur et à mesure de l'avancement du projet.

## Démarrer le site vitrine

```bash
cd web
npm install
npm run dev
```

Le serveur de développement écoute sur [http://localhost:5173](http://localhost:5173). Cette première version regroupe les
éléments essentiels : navigation, section héros, bénéfices clés, parcours élèves, espace enseignants et formulaire de contact
pour les établissements pilotes.
