# Socratoia – Plateforme de tutorat socratique pour collégiens

## 1. Objectif
Créer une plateforme web immersive destinée aux élèves de Physique-Chimie (11-14 ans) leur permettant de dialoguer avec une IA professeure joviale et socratique. L'expérience doit combiner messagerie instantanée, interactions vocales, partage de schémas et sessions individuelles anonymisées (code + pseudo) tout en respectant les exigences RGPD.

## 2. Publics cibles
- **Élèves** : collégiens utilisant un code d'exercice et un pseudo libre pour lancer une session personnelle.
- **Administrateurs** : enseignants ou responsables pédagogiques créant les exercices, suivant les sessions et ajustant le comportement de l'IA.

## 3. Expérience utilisateur
### 3.1 Parcours élève
1. Saisie du code d'exercice + pseudo sur la page d'accueil.
2. Brief d'accueil de l'IA rappelant le contexte, le ton jovial et les règles d'échange.
3. Conversation écrite ou orale (dictée et synthèse vocale) avec l'IA suivant la méthode socratique.
4. Envoi de schémas (canvas intégré, import image, capture webcam) incluant :
   - Modèles moléculaires simples.
   - Schémas électriques normalisés.
   - Montages de chimie / verrerie.
5. Analyse du schéma par l'IA (ou pré-analyse humaine/automatisée) et poursuite du questionnement.
6. Possibilité de lancer une **classe virtuelle audio/vidéo** ponctuelle avec l'IA pour clarifier un point.
7. Fin de session : synthèse des acquis, anecdotes ou faits intéressants, sauvegarde de la session.

### 3.2 Parcours administrateur
1. Connexion sécurisée (MFA recommandé) à l'espace d'administration.
2. Création/édition d'exercices avec :
   - Consignes, objectifs pédagogiques, ressources médias.
   - Paramètres de guidage socratique (niveau de difficulté, tolérance aux typos/arrondis).
   - **Prompt IA modifiable** pour définir le ton jovial, l'humour et les anecdotes possibles.
3. Génération de lots de codes d'accès (valables par classe) et suivi de leur utilisation.
4. Supervision en temps réel ou différé :
   - Journal des sessions (transcriptions texte/audio, schémas envoyés).
   - Indicateurs d'avancement anonymisés (temps passé, étapes franchies).
5. Export de rapports anonymisés (PDF/CSV) pour archivage ou partage.

## 4. Composants fonctionnels
- **Accueil** : informations, champ code + pseudo, accès aux paramètres d'accessibilité (thème contraste, taille texte, lecture vocale).
- **Interface de conversation** :
  - Timeline de messages avec bulles pastel.
  - Boutons microphone/haut-parleur (dictée & synthèse vocale).
  - Modules d'envoi de schémas (canvas, upload, capture).
  - Démarrage appel audio/vidéo WebRTC avec l'IA ou un enseignant (si disponible).
  - Barre latérale présentant l'avancement des étapes de l'exercice.
- **Espace ressources** : glossaire, fiches de cours, rappels de sécurité en laboratoire.
- **Espace administration** : gestion des exercices, prompts IA, codes, suivi.

## 5. Exigences IA
- **Personnalité** : professeur/esse fun, bienveillant·e, faisant preuve d'humour mesuré et d'anecdotes contextualisées en Physique-Chimie.
- **Méthode** : questionnement permanent (ne révèle pas directement la solution, propose indices progressifs).
- **Tolérance** : accepte fautes de frappe, approximations numériques, arrondis raisonnables.
- **Personnalisation** : prompt principal modifiable côté admin, avec prévisualisation du comportement via un bac à sable.
- **Gestion audio** : capacités TTS/STT en français, ton chaleureux.

## 6. Architecture technique proposée
| Couche | Choix techniques | Justification |
| --- | --- | --- |
| Front-end | React + TypeScript, Vite, TailwindCSS | Rapidité, composantisation, styling cohérent dans un thème pastel. |
| Temps réel & audio/vidéo | WebRTC via serveur SFU (ex : mediasoup ou Jitsi) | Gestion des appels audio/vidéo sécurisés. |
| Synthèse/Dictee vocale | Web Speech API (fallback vers service RGPD compliant) | Interaction orale native, conservation locale des données. |
| Back-end API | NestJS (Node.js) | Structure modulaire, intégration GraphQL/REST, WebSockets. |
| IA | API modèle GPT-4/5 ou équivalent hébergé privé (Azure OpenAI EU, Mistral) | Respect RGPD, possibilité d'hébergement privé. |
| Analyse de schémas | Service Python (FastAPI) avec modèles vision (ex : Detectron, transformers) | Analyse d'images spécialisées en schémas scientifiques. |
| Base de données | PostgreSQL | Stockage structuré (exercices, sessions anonymisées). |
| Stockage fichiers | Object storage privé (S3 compatible) | Conservation schémas/voix. |
| Authentification admin | Keycloak ou Auth0 self-hosted | MFA, politiques de sécurité.
| Hébergement | Cloud privé européen (OVH, Scaleway) | Conformité RGPD, maîtrise des données. |

## 7. Données & RGPD
- Sessions élèves identifiées uniquement par code + pseudo.
- Journalisation des échanges texte/audio avec chiffrement au repos.
- Conservation des données limitée (durée définie par l'établissement, ex : 12 mois) avec purge automatique.
- Consentements et mentions légales adaptés à un public mineur (information aux parents/tuteurs).
- DPO déjà identifié : intégration dans les processus (revue DPIA, suivi incidents).
- Traçabilité des accès administrateur, alertes en cas d'activité suspecte.

## 8. Sécurité
- Séparation des environnements (dev, préprod, prod) sur cloud privé.
- Chiffrement TLS, stockage chiffré, rotation des clés, backups chiffrés.
- Tests de pénétration réguliers, politique de mise à jour continue.
- Limitation des appels IA par session (quota) pour prévenir abus.
- Surveillance des contenus générés (modération automatisée + revue humaine si besoin).

## 9. Accessibilité & UX
- Palette de couleurs pastels contrastées (bleu doux, vert menthe, beige).
- Typographies arrondies lisibles (Nunito, Quicksand).
- Mode sombre doux, support clavier complet, compatibilité lecteurs d'écran.
- Micro-interactions apaisantes : animations légères lors de l'envoi de messages.

## 10. Roadmap prévisionnelle
1. **Semaine 1-2** : cadrage détaillé, ateliers avec enseignants, définition prompts et cas d'usage.
2. **Semaine 3-5** : design UX/UI, maquettes, prototypage Figma.
3. **Semaine 6-10** : développement front/back de base, intégration IA conversationnelle.
4. **Semaine 11-13** : ajout audio/vidéo, module schémas, stockage sécurisé.
5. **Semaine 14-15** : tests utilisateurs (élèves pilotes), ajustements pédagogiques.
6. **Semaine 16** : audit sécurité/RGPD final, documentation, formation administrateurs.

## 11. Prochaines étapes
- Valider la liste des schémas types à reconnaître et le niveau d'automatisation souhaité.
- Confirmer le fournisseur IA conforme (Azure OpenAI, Mistral Premium, etc.).
- Préciser les attentes sur la sauvegarde et restitution des sessions aux enseignants.
- Définir les politiques de durée de conservation et anonymisation.
- Lancer la conception détaillée de l'interface (wireframes haute fidélité).
