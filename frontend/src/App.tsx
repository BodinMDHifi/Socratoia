import './App.css'

type JourneyStep = {
  icon: string
  title: string
  description: string
}

type FeatureCard = JourneyStep & {
  chips?: string[]
}

const heroPills = [
  'Code & pseudo anonymes',
  'Questionnement socratique',
  'Dictée et synthèse vocales',
  'Analyse de schémas scientifiques',
]

const sessionPreview: JourneyStep[] = [
  {
    icon: '🎈',
    title: 'Brief jovial',
    description:
      "Bienvenue Camille ! Aujourd'hui on explore les réactions acidobasiques. J'ai prévu des indices si tu sèches.",
  },
  {
    icon: '🎤',
    title: 'Échange multimodal',
    description:
      'Tu peux me répondre par écrit ou en parlant. Si tu bloques, je te pose une nouvelle question pour relancer.',
  },
  {
    icon: '🧪',
    title: 'Analyse de ton schéma',
    description:
      'Merci pour ton montage ! Je repère la verrerie que tu as choisie et on vérifie ensemble la sécurité.',
  },
]

const studentJourney: JourneyStep[] = [
  {
    icon: '🔑',
    title: 'Entrée simple & sécurisée',
    description:
      'L’élève saisit un code d’exercice et choisit un pseudo libre. Aucune donnée nominative ne quitte la classe.',
  },
  {
    icon: '🤝',
    title: 'Accueil personnalisé',
    description:
      'L’IA rappelle le contexte, le ton jovial et les règles d’échange pour instaurer confiance et curiosité.',
  },
  {
    icon: '💬',
    title: 'Dialogue socratique continu',
    description:
      'La professeure virtuelle questionne, reformule et guide progressivement vers la solution sans la dévoiler.',
  },
  {
    icon: '🎨',
    title: 'Partage de schémas',
    description:
      'Canvas intégré, upload ou capture webcam pour soumettre un schéma électrique ou un montage de chimie.',
  },
  {
    icon: '🔊',
    title: 'Audio & vidéo à la carte',
    description:
      'Un clic pour activer dictée, synthèse vocale ou classe virtuelle ponctuelle avec l’IA ou un enseignant.',
  },
  {
    icon: '📚',
    title: 'Synthèse finale mémorable',
    description:
      'Résumé des acquis, anecdote de physique-chimie et sauvegarde sécurisée de la session dans les archives.',
  },
]

const conversationModules: FeatureCard[] = [
  {
    icon: '💭',
    title: 'Timeline immersive',
    description:
      'Bulles pastel, avatar vivant et feedback positif pour encourager chaque réponse et rebondir instantanément.',
    chips: ['Mentorat jovial', 'Emojis modérés', 'Micro-animations'],
  },
  {
    icon: '🎙️',
    title: 'Voix naturelle',
    description:
      'Web Speech API en local ou service RGPD compliant pour transcription rapide et synthèse vocale chaleureuse.',
    chips: ['Contrôle micro', 'Scripts inclusifs', 'Bascule texte↔audio'],
  },
  {
    icon: '🧠',
    title: 'Guidage IA réglable',
    description:
      'Niveau de difficulté, tolérance aux arrondis et indices progressifs modifiables par l’équipe pédagogique.',
    chips: ['Prompts scénarisés', 'Sandbox de test', 'Suivi des indices'],
  },
  {
    icon: '🖼️',
    title: 'Analyse de schémas',
    description:
      'Reconnaissance de schémas moléculaires, montages électriques normalisés et verrerie de chimie.',
    chips: ['Canvas collaboratif', 'Import image', 'Capture webcam'],
  },
]

const adminCapabilities: FeatureCard[] = [
  {
    icon: '🛠️',
    title: 'Création d’exercices',
    description:
      'Consignes, objectifs pédagogiques, ressources média et scripts d’accompagnement pour chaque séance.',
  },
  {
    icon: '🧾',
    title: 'Lots de codes',
    description:
      'Générez et exportez en PDF/CSV des codes d’accès par classe, avec date d’expiration et quota de sessions.',
  },
  {
    icon: '📊',
    title: 'Suivi temps réel',
    description:
      'Journal des conversations, transcriptions audio, schémas envoyés et indicateurs anonymisés de progression.',
  },
  {
    icon: '🧭',
    title: 'Pilotage du ton IA',
    description:
      'Ajustez humour, anecdotes et posture socratique via un prompt éditable avec prévisualisation immédiate.',
  },
]

const techChoices: FeatureCard[] = [
  {
    icon: '⚛️',
    title: 'React + TypeScript + Vite',
    description:
      'Performance, composantisation et rapidité de développement pour un front pastel et accessible.',
    chips: ['Tailwind-ready', 'Tests Vitest', 'Storybook ultérieur'],
  },
  {
    icon: '📡',
    title: 'WebRTC via SFU dédié',
    description:
      'Mediasoup ou Jitsi pour gérer appels audio/vidéo sécurisés et scalables dans un cloud privé européen.',
    chips: ['Qualité adaptative', 'Mode faible bande', 'Enregistrement chiffré'],
  },
  {
    icon: '🛡️',
    title: 'NestJS & PostgreSQL',
    description:
      'API modulaire GraphQL/REST, WebSockets temps réel et stockage structuré des sessions anonymisées.',
    chips: ['Keycloak MFA', 'Audit trail', 'Quota d’appels IA'],
  },
  {
    icon: '🔍',
    title: 'Analyse visuelle Python',
    description:
      'FastAPI et modèles vision (transformers, Detectron) pour interpréter les schémas scientifiques déposés.',
    chips: ['Pipeline GPU', 'Annotation humaine', 'Feedback automatique'],
  },
]

const compliancePoints: JourneyStep[] = [
  {
    icon: '🔒',
    title: 'Sécurité par design',
    description:
      'Chiffrement TLS, stockage chiffré, rotation des clés et sauvegardes sécurisées opérées sur cloud européen.',
  },
  {
    icon: '🧾',
    title: 'RGPD adapté aux mineurs',
    description:
      'Mentions légales claires, consentement parental, conservation limitée (12 mois) et purge automatique.',
  },
  {
    icon: '🛰️',
    title: 'Traçabilité fine',
    description:
      'Alertes en cas d’activité suspecte, journalisation complète et supervision différée pour les enseignants.',
  },
  {
    icon: '🧑‍💼',
    title: 'Gouvernance DPO',
    description:
      'Intégration du DPO à chaque étape : revue DPIA, suivi des incidents et documentation continue.',
  },
]

const roadmap = [
  {
    phase: 'Semaines 1-2',
    focus: 'Cadrage détaillé',
    details:
      'Ateliers avec enseignants, définition des prompts IA et validation des schémas prioritaires.',
  },
  {
    phase: 'Semaines 3-5',
    focus: 'Design & prototypage',
    details: 'Wireframes haute fidélité, tests d’ergonomie avec collégiens pilotes, choix de la palette pastel.',
  },
  {
    phase: 'Semaines 6-10',
    focus: 'Développement cœur de plateforme',
    details:
      'Front/back de base, intégration IA conversationnelle, première version de l’analyse de schémas.',
  },
  {
    phase: 'Semaines 11-13',
    focus: 'Audio/vidéo & stockage',
    details: 'Ajout WebRTC, TTS/STT, sécurisation des médias et automatisation des backups chiffrés.',
  },
  {
    phase: 'Semaines 14-16',
    focus: 'Tests & lancement',
    details:
      'Tests utilisateurs, audit sécurité/RGPD final, formation des équipes et ouverture progressive.',
  },
]

function App() {
  return (
    <div className="app">
      <header className="hero">
        <nav className="nav" aria-label="Navigation principale">
          <div className="brand" aria-label="Socratoia">
            <span aria-hidden="true">🌟</span>
            Socratoia
          </div>
          <div className="nav-links">
            <a href="#experience">Parcours élève</a>
            <a href="#conversation">Conversation</a>
            <a href="#administration">Administration</a>
            <a href="#rgpd">Sécurité & RGPD</a>
            <a href="#roadmap">Roadmap</a>
          </div>
          <a className="button ghost" href="#administration">
            Espace admin
          </a>
        </nav>

        <div className="hero-content">
          <div className="hero-text">
            <div className="tagline">
              <span aria-hidden="true">✨</span>
              Tutorat socratique 11-14 ans
            </div>
            <h1>La professeure joviale qui fait parler la science</h1>
            <p>
              Socratoia accompagne chaque collégien·ne en Physique-Chimie grâce à une IA bienveillante,
              curieuse et conforme au RGPD. Conversation, voix, schémas et anecdotes&nbsp;: tout est pensé pour
              susciter la découverte.
            </p>
            <div className="cta-buttons">
              <a className="button primary" href="#experience">
                Démarrer un prototype
              </a>
              <a className="button secondary" href="#roadmap">
                Découvrir la vision produit
              </a>
            </div>
            <div className="hero-pills">
              {heroPills.map((pill) => (
                <span key={pill}>{pill}</span>
              ))}
            </div>
          </div>

          <aside className="hero-card">
            <span className="badge">Extrait d’une session élève</span>
            <h3>Une expérience immersive et rassurante</h3>
            <p>
              Chaque échange alterne questionnements, indices et feedback positif. Les outils audio et schéma sont
              toujours à portée de clic.
            </p>
            <ul className="session-preview">
              {sessionPreview.map((step) => (
                <li key={step.title}>
                  <span aria-hidden="true">{step.icon}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </header>

      <main>
        <section id="experience" className="section">
          <div className="section-header">
            <span className="section-tag">Parcours élève</span>
            <h2>Des étapes pensées pour la curiosité et l’autonomie</h2>
            <p>
              De la saisie du code jusqu’à la synthèse finale, tout est conçu pour encourager l’exploration et
              respecter l’anonymat des élèves.
            </p>
          </div>
          <div className="card-grid three">
            {studentJourney.map((step) => (
              <article className="card" key={step.title}>
                <span className="icon-circle" aria-hidden="true">
                  {step.icon}
                </span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="conversation" className="section alt">
          <div className="section-header">
            <span className="section-tag">Interface conversationnelle</span>
            <h2>Une messagerie pastel qui stimule la discussion scientifique</h2>
            <p>
              Les modules de conversation orchestrent textes, voix, schémas et feedback pour garder l’élève engagé
              tout en respectant le rythme de la classe.
            </p>
          </div>
          <div className="feature-grid">
            {conversationModules.map((feature) => (
              <article className="feature" key={feature.title}>
                <span className="icon-circle" aria-hidden="true">
                  {feature.icon}
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                {feature.chips && (
                  <div className="chip-row">
                    {feature.chips.map((chip) => (
                      <span className="chip" key={chip}>
                        {chip}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        <section id="administration" className="section">
          <div className="section-header">
            <span className="section-tag">Espace administration</span>
            <h2>Des outils puissants pour les enseignants et responsables pédagogiques</h2>
            <p>
              Créez des exercices, pilotez les prompts, suivez les sessions et exportez les rapports en un clin d’œil.
            </p>
          </div>
          <div className="card-grid four">
            {adminCapabilities.map((feature) => (
              <article className="card" key={feature.title}>
                <span className="icon-circle" aria-hidden="true">
                  {feature.icon}
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="technologie" className="section alt">
          <div className="section-header">
            <span className="section-tag">Architecture technique</span>
            <h2>Un socle moderne et scalable conforme aux attentes RGPD</h2>
            <p>
              Chaque couche privilégie des solutions européennes ou auto-hébergées pour garder la maîtrise des
              données sensibles.
            </p>
          </div>
          <div className="card-grid four">
            {techChoices.map((choice) => (
              <article className="card" key={choice.title}>
                <span className="icon-circle" aria-hidden="true">
                  {choice.icon}
                </span>
                <h3>{choice.title}</h3>
                <p>{choice.description}</p>
                {choice.chips && (
                  <div className="chip-row">
                    {choice.chips.map((chip) => (
                      <span className="chip" key={chip}>
                        {chip}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        <section id="rgpd" className="section">
          <div className="section-header">
            <span className="section-tag">Sécurité & conformité</span>
            <h2>Protection des données et gouvernance pédagogique intégrées</h2>
            <p>
              Socratoia s’appuie sur un DPO identifié, une traçabilité complète et des politiques de conservation
              adaptées aux établissements scolaires.
            </p>
          </div>
          <div className="card-grid four">
            {compliancePoints.map((item) => (
              <article className="card" key={item.title}>
                <span className="icon-circle" aria-hidden="true">
                  {item.icon}
                </span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="roadmap" className="section alt">
          <div className="section-header">
            <span className="section-tag">Feuille de route</span>
            <h2>16 semaines pour lancer une expérience pilote complète</h2>
            <p>
              Une progression maîtrisée, de la co-construction pédagogique à l’audit final, afin de livrer une
              plateforme prête pour les classes pilotes.
            </p>
          </div>
          <div className="roadmap">
            {roadmap.map((step) => (
              <div className="roadmap-step" key={step.phase}>
                <strong>{step.phase}</strong>
                <div>
                  <h3>{step.focus}</h3>
                  <p>{step.details}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        © {new Date().getFullYear()} Socratoia — Plateforme de tutorat socratique pour collégiens. Inspirée par les
        besoins des enseignants et des élèves.
      </footer>
    </div>
  )
}

export default App
