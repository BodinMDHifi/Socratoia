# Stratégie de développement SocratoIA

## 1. Vision produit
- **Public cible** : élèves de collège (6ᵉ à 3ᵉ) et leurs enseignants de physique-chimie.
- **Proposition de valeur** : offrir un entraînement socratique personnalisé (texte et voix) permettant de résoudre des exercices type DNB et de manipuler des schémas scientifiques simples.
- **Principes directeurs** : conversations bienveillantes, pédagogie active, respect du RGPD, simplicité de déploiement sur cloud privé, extensibilité pour nouvelles matières.

## 2. Objectifs pédagogiques et fonctionnels
### 2.1 Élèves
- Accéder à des exercices par pseudo + code partagé par l'enseignant.
- Converser avec le professeur IA en mode texte et vocal (tolérance fautes de frappe, arrondis, reformulations).
- Créer ou importer des schémas (molécules, circuits, montages) et les intégrer à la conversation.
- Obtenir des indices gradués, reformulations, rappels de méthode et synthèses.
- Télécharger le compte-rendu PDF de leurs échanges.

### 2.2 Enseignants / administrateurs
- Créer, publier et organiser des exercices unitaires ou en parcours (séquences, devoirs, révisions DNB).
- Générer et gérer des codes d'accès (durée de validité, nombre d'usages, accès parcours/exercices).
- Paramétrer le ton, le cadre pédagogique et les garde-fous du prof IA (prompt management).
- Consulter les historiques, télécharger les PDF, suivre des métriques d'usage (temps passé, nombre d'échanges, notions abordées).
- Gérer la base de schémas (templates, bibliothèques, corrections types).

## 3. Expérience utilisateur cible
1. **Connexion simplifiée** : page d'accueil douce (pastels, mascotte), pseudo + code.
2. **Onboarding** : tutoriel interactif (texte + audio) rappelant les règles d'usage et d'éthique.
3. **Interface conversationnelle** : chat temps réel, bulles différenciées, indicateurs de statut (enregistrement audio, génération réponse IA).
4. **Mode vocal** : bouton push-to-talk + retour audio. Gestion de latence < 2 s via streaming STT/TTS.
5. **Gestion des schémas** :
   - éditeur intégré (canvas + bibliothèques de symboles scientifiques) ;
   - import d'image (PNG/JPEG) depuis tablette/PC ;
   - annotation par l'IA dans le fil de discussion (intégration miniature cliquable).
6. **Fin de session** : récapitulatif des points clés, rappel des notions vues, bouton PDF.

## 4. Architecture cible
### 4.1 Front-end
- Framework SPA (React + TypeScript recommandé) avec gestion d'état (Redux Toolkit ou Zustand) et localisation (français par défaut).
- WebSocket pour conversation temps réel, fallback HTTP long-polling.
- Intégration Web Speech API + fallback service (Azure Cognitive Services, Google Cloud Speech) via proxy backend.
- Éditeur de schémas : librairie canvas (Fabric.js/Konva) + composants symboles dédiés.
- PWA pour fonctionnement sur tablettes (cache offline partiel, notifications).

### 4.2 Back-end
- API REST/GraphQL (Node.js + NestJS ou Python + FastAPI). Préférence pour NestJS pour modularité TypeScript.
- Services principaux :
  - Authentification pseudo + code (tokens courts, rafraîchissement côté serveur).
  - Gestion exercices/parcours (CRUD, hiérarchie, métadonnées notionnelles).
  - Conversation orchestration (historique, filtrage contenu, appels IA).
  - Module schémas (stockage, conversion, métadonnées).
  - Export PDF (génération via template HTML + wkhtmltopdf/WeasyPrint).
  - Administration (RBAC, audit, paramétrage prompts).
- Couches de sécurité : rate limiting, filtrage contenu (modération), journalisation RGPD, chiffrement TLS (Terminaison sur reverse proxy Nginx/Traefik).

### 4.3 Base de données & stockage
- PostgreSQL pour utilisateurs, codes d'accès, exercices, parcours, conversations (messages + pièces jointes), logs d'audit.
- Stockage objets (MinIO ou équivalent S3 privé) pour schémas, audio, PDF.
- Cache (Redis) pour sessions voix, files d'attente STT/TTS, compteurs rate limit.

### 4.4 Orchestration IA
- Service isolé "AI Orchestrator" :
  - Construction du prompt socratique (rôle, ton jovial, tolérance erreurs, références programmes officiels).
  - Gestion du contexte conversationnel (fenêtre mémoire glissante, résumé automatique).
  - Validation entrées (détection injonctions dangereuses, contenu inapproprié).
  - Multi-channel : texte et audio (conversion STT -> texte -> IA -> TTS).
  - Intégration API clé fournie, avec rotation et quotas par enseignant.
- Données pédagogiques : bibliothèque d'indications, correctifs, plans de remédiation.

## 5. Données et RGPD
- Minimisation : stockage pseudonymisé, pas de données sensibles. Codes temporaires liés à un enseignant.
- Durée de conservation configurable (ex. 12 mois par défaut). Purge automatisée.
- Consentement parental : modèle de formulaire et paramètre pour activer la collecte.
- Droits d'accès : export conversation, suppression sur demande.
- Traçabilité : journaux d'accès admin, horodatage des exports.

## 6. Monitoring, qualité et DevOps
- Déploiement sur cloud privé via conteneurs Docker orchestrés (Kubernetes ou Docker Swarm).
- Pipeline CI/CD : lint + tests unitaires + tests e2e (Playwright/Cypress) + scan sécurité (Snyk/Trivy).
- Observabilité : Prometheus + Grafana, logs centralisés (ELK/EFK), alerting (Opsgenie/Email).
- Tests pédagogiques : scénarios automatisés pour valider pédagogie socratique (prompt tests, scripts de QA).

## 7. Roadmap indicative (6-8 mois)
| Phase | Durée | Contenu clé |
|-------|-------|-------------|
| Cadrage & design | 3 semaines | Atelier personas, user stories, maquettes UI/UX, cahier des charges RGPD & voix, choix techno STT/TTS. |
| MVP texte | 8 semaines | Auth pseudo+code, chat texte, IA orchestrator v1, gestion exercices simples, admin basique, export PDF v1. |
| Voix & multimodalité | 4 semaines | Intégration STT/TTS, pipeline audio, gestion latence, tests accessibilité. |
| Schémas avancés | 4 semaines | Éditeur canvas, templates circuits/molécules, reconnaissance symboles, envoi/affichage dans chat. |
| Parcours & analytics | 4 semaines | Chaînage exercices, stats usage (tableau enseignant), filtres par notions, amélioration PDF. |
| Durcissement & conformité | 3 semaines | Tests charge/sécu, politique purge, documentation admin, formation enseignants, préparation déploiement prod. |

## 8. Améliorations futures
- Adaptation automatique du niveau (algorithmes de maîtrise des connaissances, recommandation de notions).
- Mode collaboratif multi-élèves + IA.
- Intégration de missions journalières et gamification douce (badges, progression qualitative sans notes).
- Génération de fiches de synthèse personnalisées à partir des conversations.
- Module de co-création d'exercices assisté par IA pour les enseignants.
- API publique pour intégrer d'autres outils pédagogiques du collège.

## 9. Risques & points de vigilance
- **Latence voix** : nécessité d'une infra proche des utilisateurs + optimisation streaming.
- **Qualité pédagogique** : définir une équipe de relecture régulière des prompts et scénarios.
- **Sécurité** : vérification des uploads (antivirus, taille max), modération du chat.
- **Accessibilité** : conformité RGAA, tests sur tablettes diverses.
- **Adoption enseignants** : prévoir accompagnement, documentation, webinaires.

## 10. Prochaines étapes
1. Valider le choix des technologies front/back et du service STT/TTS avec contraintes budgétaires.
2. Produire user stories détaillées et diagrammes (séquence, architecture) pour le MVP.
3. Concevoir maquettes UI (thème doux, mascotte joviale) et flow conversationnel.
4. Spécifier le prompt socratique initial + procédures de revue pédagogique.
5. Préparer environnement cloud privé (cluster, CI/CD, politiques sécurité) et plan de tests.
