import { useState } from 'react'
import './App.css'

const navLinks = [
  { href: '#methode', label: 'Méthode' },
  { href: '#parcours', label: 'Parcours élèves' },
  { href: '#enseignants', label: 'Espace enseignants' },
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

function App() {
  const [menuOpen, setMenuOpen] = useState(false)

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
