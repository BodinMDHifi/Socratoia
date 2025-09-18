import { useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import './App.css'

const ADMIN_PASSWORD = 'admin'

type Exercise = {
  id: number
  title: string
  notion: string
  level: string
  description: string
  createdAt: string
  imageName?: string
  imageDataUrl?: string | null
  pdfName?: string
  pdfSize?: string
}

type ExerciseFormState = {
  title: string
  notion: string
  level: string
  description: string
  image: File | null
  pdf: File | null
}

type StudentStat = {
  id: number
  name: string
  className: string
  completionRate: number
  lastSession: string
  focusArea: string
  masteryLabel: string
  voiceUsage: number
}

type ResourceShare = {
  id: number
  label: string
  audience: string
  enabled: boolean
}

type ActivityItem = {
  id: number
  title: string
  details: string
  time: string
  icon: string
}

const navLinks = [
  { href: '#methode', label: 'Méthode' },
  { href: '#parcours', label: 'Parcours élèves' },
  { href: '#enseignants', label: 'Espace enseignants' },
  { href: '#admin', label: 'Admin' },
  { href: '#contact', label: 'Contact' },
]

const heroHighlights = [
  { value: '6ᵉ → 3ᵉ', label: 'Programmes alignés' },
  { value: 'IA socratique', label: 'Coaching individualisé' },
  { value: 'Texte · Voix · Schémas', label: 'Multimodal' },
]

const features = [
  {
    title: 'Dialogue socratique guidé',
    description:
      "L'IA relance avec des questions ouvertes, reformule les hypothèses et valorise les essais pour ancrer la méthode scientifique.",
    icon: '💬',
  },
  {
    title: 'Exercices prêts pour le DNB',
    description:
      'Parcours créés par les enseignants avec indices gradués, rappels de cours et corrections détaillées téléchargeables.',
    icon: '📚',
  },
  {
    title: 'Schémas interactifs',
    description:
      'Dessinez un circuit ou une molécule, importez une photo : le professeur IA s’appuie dessus pour guider la résolution.',
    icon: '🧪',
  },
]

const studentSteps = [
  {
    title: 'Je me connecte en toute simplicité',
    description:
      "Pseudo + code partagé par l'enseignant : aucune donnée sensible, juste un espace sécurisé pour expérimenter.",
  },
  {
    title: "Je dialogue avec le professeur IA",
    description:
      "Je réponds à voix haute ou au clavier, je teste mes idées et j'obtiens des indices ciblés quand je bloque.",
  },
  {
    title: 'Je repars avec une synthèse',
    description:
      'Points clés, pistes de progrès et fiche PDF pour réviser ensuite ou partager avec mon enseignant.',
  },
]

const teacherHighlights = [
  'Création rapide de séances, devoirs ou parcours thématiques.',
  'Paramétrage du ton, du niveau de guidage et des garde-fous IA.',
  'Suivi des conversations, export PDF et métriques d’usage.',
  'Banque de schémas corrigés et de ressources pédagogiques.',
]

const trustPillars = [
  {
    title: 'Sécurité & RGPD',
    description:
      'Données pseudonymisées, hébergement souverain et contrôle fin des durées de conservation.',
  },
  {
    title: 'Qualité pédagogique',
    description:
      'Prompts revus par des enseignants, scénarios testés sur les compétences du socle commun.',
  },
  {
    title: 'Interopérable',
    description:
      'API et export conçus pour s’intégrer avec vos ENT et outils favoris.',
  },
]

const initialExercises: Exercise[] = [
  {
    id: 1,
    title: 'Circuit série : tension totale',
    notion: 'Électricité',
    level: '4ᵉ',
    description:
      'Questionnaire guidé autour de la loi d’additivité des tensions avec schéma annoté et relances socratiques.',
    pdfName: 'sequence_circuit_4e.pdf',
    pdfSize: '1,1 Mo',
    imageName: 'schema_circuit.png',
    imageDataUrl: null,
    createdAt: '12 février 2025',
  },
  {
    id: 2,
    title: 'Transformation chimique et équation-bilan',
    notion: 'Chimie',
    level: '3ᵉ',
    description:
      'Analyse d’une situation expérimentale avec identification des réactifs et des produits et correction détaillée.',
    pdfName: 'corrige_transformation.pdf',
    pdfSize: '940 Ko',
    imageName: 'experience_chimie.jpg',
    imageDataUrl: null,
    createdAt: '5 février 2025',
  },
]

const initialStudentStats: StudentStat[] = [
  {
    id: 1,
    name: 'Léa Martin',
    className: '3ᵉB',
    completionRate: 88,
    lastSession: 'Hier',
    focusArea: 'Chimie · réactions',
    masteryLabel: 'Prête pour le DNB',
    voiceUsage: 62,
  },
  {
    id: 2,
    name: 'Naël Dupont',
    className: '3ᵉB',
    completionRate: 46,
    lastSession: 'Aujourd’hui',
    focusArea: 'Électricité · loi d’Ohm',
    masteryLabel: 'À renforcer',
    voiceUsage: 18,
  },
  {
    id: 3,
    name: 'Sofia Rahmani',
    className: '4ᵉA',
    completionRate: 72,
    lastSession: 'Hier',
    focusArea: 'Optique · lentilles',
    masteryLabel: 'En progression',
    voiceUsage: 41,
  },
  {
    id: 4,
    name: 'Mathis Leroy',
    className: '5ᵉC',
    completionRate: 64,
    lastSession: 'Aujourd’hui',
    focusArea: 'Physique · proportionnalité',
    masteryLabel: 'En progression',
    voiceUsage: 55,
  },
  {
    id: 5,
    name: 'Inès Carvalho',
    className: '3ᵉA',
    completionRate: 92,
    lastSession: 'Cette semaine',
    focusArea: 'Chimie · transformations',
    masteryLabel: 'Prête pour le DNB',
    voiceUsage: 70,
  },
  {
    id: 6,
    name: 'Hugo Bernard',
    className: '5ᵉC',
    completionRate: 38,
    lastSession: 'Il y a 3 jours',
    focusArea: 'Astronomie · phases de la Lune',
    masteryLabel: 'À relancer',
    voiceUsage: 25,
  },
]

const initialResourceShares: ResourceShare[] = [
  {
    id: 1,
    label: 'Banque DNB – Série énergie',
    audience: 'Classes de 3ᵉ',
    enabled: true,
  },
  {
    id: 2,
    label: 'Séance laboratoire : distillation',
    audience: '5ᵉC et 5ᵉD',
    enabled: false,
  },
  {
    id: 3,
    label: 'Fiche méthode : schéma électrique',
    audience: 'Tous les enseignants',
    enabled: true,
  },
]

const adminActivity: ActivityItem[] = [
  {
    id: 1,
    title: 'Export PDF envoyé à Mme Lemaire',
    details: 'Synthèse de Léa – réactions d’oxydoréduction transmise depuis le tableau de bord.',
    time: 'il y a 15 min',
    icon: '📄',
  },
  {
    id: 2,
    title: 'Nouveau parcours « Énergie 3ᵉ »',
    details: '8 exercices assignés à 3ᵉA avec seuil de relance automatique à 40%.',
    time: 'il y a 2 h',
    icon: '🧭',
  },
  {
    id: 3,
    title: 'Participation vocale en hausse',
    details: 'Le groupe 5ᵉC dépasse 55% d’utilisation du micro sur la dernière séance.',
    time: 'hier',
    icon: '🎙️',
  },
]

const initialExerciseForm: ExerciseFormState = {
  title: '',
  notion: '',
  level: '3ᵉ',
  description: '',
  image: null,
  pdf: null,
}

const formatFileSize = (size: number): string => {
  if (size < 1024) {
    return `${size} o`
  }
  const kb = size / 1024
  if (kb < 1024) {
    return `${kb.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Ko`
  }
  const mb = kb / 1024
  return `${mb.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Mo`
}

const readFileAsDataURL = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("Impossible de lire le fichier importé."))
    reader.readAsDataURL(file)
  })

const formatDate = (date: Date): string =>
  date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises)
  const [exerciseForm, setExerciseForm] = useState<ExerciseFormState>(initialExerciseForm)
  const [exerciseFeedback, setExerciseFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [isSavingExercise, setIsSavingExercise] = useState(false)
  const [studentStats] = useState<StudentStat[]>(initialStudentStats)
  const [selectedClass, setSelectedClass] = useState<'all' | string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [resourceShares, setResourceShares] = useState<ResourceShare[]>(initialResourceShares)
  const [recentActivity] = useState<ActivityItem[]>(adminActivity)
  const exerciseFormRef = useRef<HTMLFormElement | null>(null)

  const totalStudents = studentStats.length
  const averageCompletion = totalStudents
    ? Math.round(studentStats.reduce((total, stat) => total + stat.completionRate, 0) / totalStudents)
    : 0
  const voiceUsageAverage = totalStudents
    ? Math.round(studentStats.reduce((total, stat) => total + stat.voiceUsage, 0) / totalStudents)
    : 0
  const atRiskStudents = studentStats.filter((stat) => stat.completionRate < 50).length
  const masteryStudents = studentStats.filter((stat) => stat.completionRate >= 80).length

  const classOptions = Array.from(new Set(studentStats.map((stat) => stat.className)))
  const sanitizedQuery = searchQuery.trim().toLowerCase()

  const filteredStats = studentStats
    .filter((stat) => {
      const matchesClass = selectedClass === 'all' || stat.className === selectedClass
      const matchesQuery =
        sanitizedQuery.length === 0 ||
        stat.name.toLowerCase().includes(sanitizedQuery) ||
        stat.focusArea.toLowerCase().includes(sanitizedQuery)
      return matchesClass && matchesQuery
    })
    .sort((a, b) => b.completionRate - a.completionRate)

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setLoginPassword(event.target.value)
    if (loginError) {
      setLoginError('')
    }
  }

  const handleAdminLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (loginPassword.trim() === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true)
      setLoginPassword('')
      setLoginError('')
    } else {
      setLoginError('Mot de passe incorrect. Essayez «\u00a0admin\u00a0» ou contactez le support.')
    }
  }

  const handleLogout = () => {
    setIsAdminAuthenticated(false)
    setLoginPassword('')
  }

  const handleExerciseTextChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    const fieldName = name as 'title' | 'notion' | 'level' | 'description'
    setExerciseForm((prev) => ({
      ...prev,
      [fieldName]: value,
    }))
  }

  const handleExerciseFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = event.target
    const fieldName = name as 'image' | 'pdf'
    const file = files?.[0] ?? null
    setExerciseForm((prev) => ({
      ...prev,
      [fieldName]: file,
    }))
  }

  const handleExerciseSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSavingExercise) {
      return
    }

    const trimmedTitle = exerciseForm.title.trim()
    const trimmedNotion = exerciseForm.notion.trim()
    const trimmedDescription = exerciseForm.description.trim()

    if (!trimmedTitle || !trimmedNotion || !trimmedDescription) {
      setExerciseFeedback({ type: 'error', message: 'Renseignez le titre, la notion et la description de l’exercice.' })
      return
    }

    if (!exerciseForm.image && !exerciseForm.pdf) {
      setExerciseFeedback({ type: 'error', message: 'Ajoutez au moins un support (image ou PDF) pour l’exercice.' })
      return
    }

    setExerciseFeedback(null)
    setIsSavingExercise(true)

    try {
      const imageDataUrl = exerciseForm.image ? await readFileAsDataURL(exerciseForm.image) : null

      const newExercise: Exercise = {
        id: Date.now(),
        title: trimmedTitle,
        notion: trimmedNotion,
        level: exerciseForm.level,
        description: trimmedDescription,
        imageName: exerciseForm.image?.name,
        imageDataUrl,
        pdfName: exerciseForm.pdf?.name,
        pdfSize: exerciseForm.pdf ? formatFileSize(exerciseForm.pdf.size) : undefined,
        createdAt: formatDate(new Date()),
      }

      setExercises((previous) => [newExercise, ...previous])
      setExerciseFeedback({ type: 'success', message: 'Exercice ajouté à la bibliothèque interne.' })
      setExerciseForm(initialExerciseForm)
      exerciseFormRef.current?.reset()
    } catch (error) {
      setExerciseFeedback({
        type: 'error',
        message: "Impossible d'importer le fichier. Veuillez réessayer ou vérifier le format.",
      })
    } finally {
      setIsSavingExercise(false)
    }
  }

  const handleResourceToggle = (id: number) => {
    setResourceShares((previous) =>
      previous.map((resource) =>
        resource.id === id
          ? {
              ...resource,
              enabled: !resource.enabled,
            }
          : resource,
      ),
    )
  }

  const getCompletionBadgeClass = (value: number) => {
    if (value >= 80) {
      return 'badge success'
    }
    if (value < 50) {
      return 'badge alert'
    }
    return 'badge neutral'
  }

  return (
    <div className="page">
      <header className="site-header" id="accueil">
        <nav className="nav">
          <div className="brand">
            <span className="brand-mark">S</span>
            <div>
              <span className="brand-name">SocratoIA</span>
              <span className="brand-tag">Coaching scientifique socratique</span>
            </div>
          </div>
          <button
            className={menuOpen ? 'nav-toggle active' : 'nav-toggle'}
            aria-label="Ouvrir le menu"
            aria-expanded={menuOpen}
            aria-controls="navigation"
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
          <div id="navigation" className={menuOpen ? 'nav-links open' : 'nav-links'}>
            <ul>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} onClick={() => setMenuOpen(false)}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <a className="button primary" href="#contact" onClick={() => setMenuOpen(false)}>
              Demander un accès
            </a>
          </div>
        </nav>
        <div className="hero">
          <div className="hero-content">
            <p className="tagline">Plateforme d’entraînement physique-chimie</p>
            <h1>Stimulez la curiosité scientifique de vos élèves grâce au dialogue socratique.</h1>
            <p className="hero-description">
              SocratoIA accompagne les collégiens du cycle 3 et 4 dans la résolution d’exercices complexes. L’IA questionne,
              reformule et valorise chaque raisonnement pour faire progresser toute la classe.
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#parcours">
                Je suis élève
              </a>
              <a className="button secondary" href="#enseignants">
                Je suis enseignant
              </a>
            </div>
            <div className="hero-highlights">
              {heroHighlights.map((item) => (
                <div key={item.label} className="highlight-card">
                  <span className="highlight-value">{item.value}</span>
                  <span className="highlight-label">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="chat-card">
              <div className="chat-header">
                <span className="chat-title">Session SocratoIA</span>
                <span className="chat-status">En cours</span>
              </div>
              <div className="chat-messages">
                <div className="chat-message student">
                  <span className="author">Élève</span>
                  <p>Je ne comprends pas comment calculer la tension totale dans ce circuit en série.</p>
                </div>
                <div className="chat-message coach">
                  <span className="author">Prof IA</span>
                  <p>
                    Quels éléments du schéma te donnent la valeur des tensions partielles&nbsp;? Essayons de les additionner
                    ensemble.
                  </p>
                </div>
                <div className="chat-message student">
                  <span className="author">Élève</span>
                  <p>Il y a 3 volts sur la lampe A et 3 volts sur la lampe B.</p>
                </div>
                <div className="chat-message coach">
                  <span className="author">Prof IA</span>
                  <p>
                    Très bien&nbsp;! En circuit série, la tension totale est la somme des tensions de chaque dipôle. Quelle
                    conclusion peux-tu en tirer&nbsp;?
                  </p>
                </div>
              </div>
              <div className="chat-footer">
                <div>
                  <strong>Récap auto</strong>
                  <p>La tension totale est de 6 V. Penser à vérifier la cohérence avec la source.</p>
                </div>
                <button className="button tertiary" type="button">
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section id="methode" className="section features">
          <div className="section-header">
            <p className="section-kicker">Pourquoi SocratoIA ?</p>
            <h2>Un compagnon pédagogique exigeant et bienveillant.</h2>
            <p className="section-intro">
              Nous combinons les meilleures pratiques de pédagogie active avec la puissance d’un orchestrateur IA maîtrisé.
              Chaque échange encourage la réflexion, la preuve et l’autonomie.
            </p>
          </div>
          <div className="feature-grid">
            {features.map((feature) => (
              <article key={feature.title} className="feature-card">
                <span className="feature-icon" aria-hidden>
                  {feature.icon}
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="parcours" className="section steps">
          <div className="section-header">
            <p className="section-kicker">Parcours élèves</p>
            <h2>Une expérience fluide du premier clic au compte-rendu.</h2>
          </div>
          <div className="steps-grid">
            {studentSteps.map((step, index) => (
              <article key={step.title} className="step-card">
                <span className="step-number">{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="enseignants" className="section educators">
          <div className="educators-grid">
            <div className="educators-content">
              <p className="section-kicker">Pour les enseignants</p>
              <h2>Gardez la main sur les objectifs pédagogiques.</h2>
              <p>
                Configurez vos séances, personnalisez le ton du professeur IA et suivez les progrès de vos élèves. SocratoIA
                s’adapte à vos pratiques de classe et renforce la différenciation.
              </p>
              <ul className="checklist">
                {teacherHighlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="educators-card">
              <h3>Tableau de bord enseignant</h3>
              <div className="dashboard-preview">
                <div>
                  <span className="preview-label">Codes actifs</span>
                  <strong>12</strong>
                </div>
                <div>
                  <span className="preview-label">Temps moyen</span>
                  <strong>18 min</strong>
                </div>
                <div>
                  <span className="preview-label">Notions travaillées</span>
                  <strong>Électricité, transformations</strong>
                </div>
              </div>
              <p>
                Visualisez les échanges, commentez les productions des élèves et exportez des synthèses pour votre ENT en un
                clic.
              </p>
              <a className="button primary" href="#contact">
                Planifier une démo
              </a>
            </div>
          </div>
        </section>

        <section className="section trust">
          <div className="section-header">
            <p className="section-kicker">Essentiels techniques</p>
            <h2>Une plateforme fiable, respectueuse et extensible.</h2>
          </div>
          <div className="trust-grid">
            {trustPillars.map((pillar) => (
              <article key={pillar.title} className="trust-card">
                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="admin" className="section admin">
          <div className="section-header">
            <p className="section-kicker">Espace administrateur</p>
            <h2>Pilotez les contenus et accompagnez vos classes en temps réel.</h2>
            <p className="section-intro">
              Gestion centralisée des exercices, suivi par élève et diffusion de vos ressources pédagogiques. Les données
              restent hébergées en France et accessibles uniquement aux comptes habilités.
            </p>
          </div>

          {!isAdminAuthenticated ? (
            <div className="admin-login">
              <div className="admin-login-card">
                <h3>Connexion sécurisée</h3>
                <p>
                  Entrez le mot de passe administrateur pour accéder au tableau de bord et configurer les parcours
                  personnalisés.
                </p>
                <form onSubmit={handleAdminLogin} className="admin-login-form">
                  <label htmlFor="admin-password">
                    Mot de passe
                    <input
                      id="admin-password"
                      type="password"
                      name="password"
                      autoComplete="current-password"
                      placeholder="••••••"
                      value={loginPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </label>
                  {loginError && (
                    <p role="alert" className="form-error">
                      {loginError}
                    </p>
                  )}
                  <button className="button primary" type="submit">
                    Accéder au tableau de bord
                  </button>
                  <p className="form-hint">Mot de passe par défaut&nbsp;: admin</p>
                </form>
              </div>
              <ul className="admin-login-perks">
                <li>Bibliothèque d’exercices multimédia (images, PDF, indices gradués).</li>
                <li>Statistiques par élève avec alerte en cas de baisse de progression.</li>
                <li>Partage des ressources par classe et historique des actions.</li>
              </ul>
            </div>
          ) : (
            <div className="admin-dashboard">
              <div className="admin-top">
                <div>
                  <h3>Tableau de bord SocratoIA</h3>
                  <span className="admin-top-meta">Synchronisé il y a 5&nbsp;minutes • {masteryStudents} élèves proches du DNB</span>
                </div>
                <button className="button secondary" type="button" onClick={handleLogout}>
                  Se déconnecter
                </button>
              </div>

              <div className="admin-metrics">
                <div className="metric-card">
                  <span className="metric-label">Exercices publiés</span>
                  <strong className="metric-value">{exercises.length}</strong>
                  <span className="metric-caption">dont {masteryStudents} pour le DNB</span>
                </div>
                <div className="metric-card">
                  <span className="metric-label">Taux de complétion moyen</span>
                  <strong className="metric-value">{averageCompletion}%</strong>
                  <span className="metric-caption">Objectif fixé à 75%</span>
                </div>
                <div className="metric-card">
                  <span className="metric-label">Élèves à accompagner</span>
                  <strong className="metric-value">{atRiskStudents}</strong>
                  <span className="metric-caption">Sous les 50% de réussite</span>
                </div>
                <div className="metric-card">
                  <span className="metric-label">Utilisation de la voix</span>
                  <strong className="metric-value">{voiceUsageAverage}%</strong>
                  <span className="metric-caption">Participation moyenne hebdo</span>
                </div>
              </div>

              <div className="admin-grid">
                <div className="admin-column">
                  <div className="admin-card">
                    <div className="admin-card-header">
                      <h3>Ajouter un exercice</h3>
                      <span className="admin-card-subtitle">Formats acceptés&nbsp;: image (.png, .jpg) et PDF.</span>
                    </div>
                    <form ref={exerciseFormRef} onSubmit={handleExerciseSubmit} className="admin-form">
                      <div className="field-row">
                        <label>
                          Titre de l’exercice
                          <input
                            type="text"
                            name="title"
                            placeholder="Circuit série – loi des tensions"
                            value={exerciseForm.title}
                            onChange={handleExerciseTextChange}
                            required
                          />
                        </label>
                        <label>
                          Niveau ciblé
                          <select name="level" value={exerciseForm.level} onChange={handleExerciseTextChange}>
                            <option value="6ᵉ">6ᵉ</option>
                            <option value="5ᵉ">5ᵉ</option>
                            <option value="4ᵉ">4ᵉ</option>
                            <option value="3ᵉ">3ᵉ</option>
                          </select>
                        </label>
                      </div>
                      <label>
                        Notion principale
                        <input
                          type="text"
                          name="notion"
                          placeholder="Électricité – Loi d’additivité"
                          value={exerciseForm.notion}
                          onChange={handleExerciseTextChange}
                          required
                        />
                      </label>
                      <label>
                        Consigne et accompagnement
                        <textarea
                          name="description"
                          placeholder="Décrivez les étapes, les relances IA et les critères de réussite."
                          value={exerciseForm.description}
                          onChange={handleExerciseTextChange}
                          rows={4}
                          required
                        />
                      </label>
                      <div className="field-row">
                        <label>
                          Importer une image
                          <input type="file" name="image" accept="image/*" onChange={handleExerciseFileChange} />
                        </label>
                        <label>
                          Ajouter un PDF
                          <input type="file" name="pdf" accept="application/pdf" onChange={handleExerciseFileChange} />
                        </label>
                      </div>
                      <p className="form-hint">Les fichiers restent localisés sur votre navigateur pendant cette démonstration.</p>
                      {exerciseFeedback && (
                        <p className={`feedback ${exerciseFeedback.type === 'success' ? 'success' : 'error'}`}>
                          {exerciseFeedback.message}
                        </p>
                      )}
                      <button className="button primary" type="submit" disabled={isSavingExercise}>
                        {isSavingExercise ? 'Enregistrement…' : 'Publier dans la bibliothèque'}
                      </button>
                    </form>
                  </div>

                  <div className="admin-card">
                    <div className="admin-card-header">
                      <h3>Ressources partagées</h3>
                      <span className="admin-card-subtitle">Activez ou désactivez la diffusion par classe.</span>
                    </div>
                    <div className="resource-list">
                      {resourceShares.map((resource) => (
                        <div key={resource.id} className="resource-item">
                          <div className="resource-info">
                            <strong>{resource.label}</strong>
                            <span className="resource-audience">{resource.audience}</span>
                          </div>
                          <div className="resource-actions">
                            <span className={resource.enabled ? 'resource-status active' : 'resource-status'}>
                              {resource.enabled ? 'Partagé' : 'Brouillon'}
                            </span>
                            <button
                              type="button"
                              className={resource.enabled ? 'toggle active' : 'toggle'}
                              onClick={() => handleResourceToggle(resource.id)}
                              aria-pressed={resource.enabled}
                            >
                              <span className="sr-only">
                                {resource.enabled ? 'Désactiver la ressource' : 'Activer la ressource'} {resource.label}
                              </span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="admin-card">
                    <div className="admin-card-header">
                      <h3>Exercices récemment ajoutés</h3>
                      <span className="admin-card-subtitle">Prévisualisez les supports importés avant publication ENT.</span>
                    </div>
                    <ul className="exercise-list">
                      {exercises.map((exercise) => (
                        <li key={exercise.id} className="exercise-item">
                          <div className="exercise-header">
                            <h4>{exercise.title}</h4>
                            <span className="exercise-date">Ajouté le {exercise.createdAt}</span>
                          </div>
                          <p>{exercise.description}</p>
                          <div className="exercise-meta">
                            <span className="exercise-tag">{exercise.level}</span>
                            <span className="exercise-tag subtle">{exercise.notion}</span>
                          </div>
                          <div className="exercise-preview">
                            {exercise.imageDataUrl ? (
                              <img src={exercise.imageDataUrl} alt={exercise.imageName ?? 'Aperçu de l’exercice'} />
                            ) : (
                              <div className="exercise-placeholder" aria-hidden>
                                🖼️
                              </div>
                            )}
                            <div className="exercise-files">
                              {exercise.imageName && (
                                <span className="resource-chip">🖼️ {exercise.imageName}</span>
                              )}
                              {exercise.pdfName && (
                                <span className="resource-chip">
                                  📄 {exercise.pdfName}
                                  {exercise.pdfSize ? ` · ${exercise.pdfSize}` : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="admin-column">
                  <div className="admin-card">
                    <div className="admin-card-header">
                      <h3>Statistiques élèves</h3>
                      <div className="admin-card-controls">
                        <select value={selectedClass} onChange={(event) => setSelectedClass(event.target.value)}>
                          <option value="all">Toutes les classes</option>
                          {classOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <input
                          type="search"
                          placeholder="Rechercher un élève ou une notion"
                          value={searchQuery}
                          onChange={(event) => setSearchQuery(event.target.value)}
                        />
                      </div>
                    </div>
                    {filteredStats.length === 0 ? (
                      <p className="empty-state">Aucun élève ne correspond à vos filtres pour le moment.</p>
                    ) : (
                      <>
                        <div className="student-table-head">
                          <span>Élève</span>
                          <span>Progression</span>
                          <span>Notion clé</span>
                          <span>Actions</span>
                        </div>
                        <div className="student-table">
                          {filteredStats.map((stat) => (
                            <div key={stat.id} className="student-row">
                              <div className="student-cell">
                                <strong className="student-name">{stat.name}</strong>
                                <span className="student-meta">
                                  {stat.className} • Dernière séance&nbsp;: {stat.lastSession}
                                </span>
                              </div>
                              <div className="student-cell">
                                <div className="progress">
                                  <span style={{ width: `${stat.completionRate}%` }} />
                                </div>
                                <span className={getCompletionBadgeClass(stat.completionRate)}>
                                  {stat.completionRate}%
                                </span>
                              </div>
                              <div className="student-cell">
                                <span className="student-focus">{stat.focusArea}</span>
                                <span className="student-mastery">{stat.masteryLabel}</span>
                              </div>
                              <div className="student-cell">
                                <span className="student-voice">{stat.voiceUsage}% voix</span>
                                <button className="button tertiary small" type="button">
                                  Voir le détail
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="admin-card">
                    <div className="admin-card-header">
                      <h3>Activité récente</h3>
                      <span className="admin-card-subtitle">Historique des actions sur les 24&nbsp;dernières heures.</span>
                    </div>
                    <ul className="timeline">
                      {recentActivity.map((item) => (
                        <li key={item.id} className="timeline-item">
                          <span className="timeline-icon" aria-hidden>
                            {item.icon}
                          </span>
                          <div>
                            <div className="timeline-header">
                              <strong>{item.title}</strong>
                              <span>{item.time}</span>
                            </div>
                            <p>{item.details}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <section id="contact" className="section contact">
          <div className="contact-card">
            <div>
              <p className="section-kicker">Envie de participer ?</p>
              <h2>Rejoignez les premiers établissements pilotes.</h2>
              <p>
                Nous accompagnons un nombre restreint de collèges pour co-construire le MVP. Laissez-nous un message et nous
                reviendrons vers vous sous 48 heures.
              </p>
            </div>
            <form className="contact-form">
              <label>
                Nom et établissement
                <input type="text" name="name" placeholder="Collège Ada Lovelace" />
              </label>
              <label>
                Adresse e-mail professionnelle
                <input type="email" name="email" placeholder="prenom.nom@etablissement.fr" />
              </label>
              <label>
                Votre besoin principal
                <textarea name="message" placeholder="Décrivez votre contexte pédagogique"></textarea>
              </label>
              <button className="button primary" type="submit">
                Être recontacté·e
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div>
            <strong>SocratoIA</strong>
            <p>Plateforme d’entraînement physique-chimie par dialogue socratique.</p>
          </div>
          <div className="footer-links">
            <a href="#methode">Méthode</a>
            <a href="#parcours">Parcours</a>
            <a href="#enseignants">Enseignants</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="footer-meta">
            <span>© {new Date().getFullYear()} SocratoIA.</span>
            <a href="mailto:contact@socratoia.fr">contact@socratoia.fr</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
