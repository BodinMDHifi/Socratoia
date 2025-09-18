// Lightweight exercise type to avoid coupling to Prisma types
type ExerciseLite = { title?: string; description?: string; topic?: string; expected?: string | null };

export type FeedbackResult = {
  feedback: string;
  score?: number; // 0-100
};

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

const keywordsByTopic: Record<string, string[]> = {
  MATTER: ['atome', 'molécule', 'masse', 'volume', 'dissolution', 'mélange', 'pure'],
  SIGNALS: ['onde', 'fréquence', 'amplitude', 'lumière', 'son', 'microphone', 'écran'],
  ENERGY: ['énergie', 'conversion', 'puissance', 'stockage', 'rendement', 'transfert'],
  MOTION: ['vitesse', 'accélération', 'force', 'trajet', 'temps', 'distance'],
};

function toNumbers(text: string): number[] {
  if (!text) return [];
  let s = text;
  // LaTeX fraction \frac{a}{b}
  s = s.replace(/\\frac\s*{([^}]+)}\s*{([^}]+)}/g, (_m, a, b) => {
    const na = parseFloat(String(a).replace(',', '.'));
    const nb = parseFloat(String(b).replace(',', '.'));
    if (isFinite(na) && isFinite(nb) && nb !== 0) return String(na / nb);
    return `${a}/${b}`;
  });
  // Simple fractions a/b
  s = s.replace(/(-?\d+[\.,]?\d*)\s*\/\s*(-?\d+[\.,]?\d*)/g, (_m, a, b) => {
    const na = parseFloat(String(a).replace(',', '.'));
    const nb = parseFloat(String(b).replace(',', '.'));
    if (isFinite(na) && isFinite(nb) && nb !== 0) return String(na / nb);
    return `${a}/${b}`;
  });
  // Normalize decimal comma
  s = s.replace(/,/g, '.');
  // Extract numbers
  const nums = (s.match(/-?\d*\.?\d+/g) || []).map((x) => parseFloat(x)).filter((n) => isFinite(n));
  return nums;
}

function closeWithinTolerance(a: number, b: number, absTol = 0.01, relTol = 0.02): boolean {
  const diff = Math.abs(a - b);
  const thresh = Math.max(absTol, relTol * Math.max(1, Math.abs(b)));
  return diff <= thresh;
}

export function ruleBasedFeedback(answer: string, exercise?: Pick<ExerciseLite, 'topic' | 'expected'>): FeedbackResult {
  const a = (answer || '').toLowerCase();
  let score = 0;
  const expected = exercise?.expected?.toLowerCase();
  if (expected) {
    const overlap = expected
      .split(/[^a-zà-ÿ]+/)
      .filter(Boolean)
      .filter((w: string) => a.includes(w));
    score = Math.min(100, Math.round((overlap.length / Math.max(3, expected.length / 6)) * 100));

    // Numeric permissiveness: accept rounded results (comma or dot) with tolerance
    const numsE = toNumbers(expected);
    const numsA = toNumbers(a);
    if (numsE.length && numsA.length) {
      let matched = false;
      for (const ne of numsE) {
        for (const na of numsA) {
          if (closeWithinTolerance(na, ne)) { matched = true; break; }
        }
        if (matched) break;
      }
      if (matched) {
        score = Math.max(score, 85);
      }
    }
  }
  if (exercise?.topic) {
    const kws = keywordsByTopic[exercise.topic] || [];
    const hits = kws.filter(k => a.includes(k)).length;
    score = Math.max(score, Math.min(100, hits * 15));
  }
  const feedback = score >= 70
    ? "Très bien — résultat acceptable même avec un arrondi (ex: 2/3 ≈ 0,67). Vérifie l’unité et explique la méthode."
    : score >= 40
    ? "Il y a des éléments corrects. Attention aux unités et aux arrondis (utilise 2 décimales en général)."
    : "Piste: revois le vocabulaire du chapitre et la méthode (données → relation → calcul → unité)."
  return { feedback, score };
}

export async function aiFeedback(
  answer: string,
  exercise?: Pick<ExerciseLite, 'title'|'description'|'topic'|'expected'>,
  history?: ChatMessage[],
  images?: string[]
): Promise<FeedbackResult> {
  if (!process.env.OPENAI_API_KEY) {
    return ruleBasedFeedback(answer, exercise);
  }
  // Lazy import to avoid bundling in edge
  const OpenAI = (await import('openai')).default;
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const sys = 'Tu es un professeur particulier de Physique-Chimie adoptant une approche socratique avec des collégiens. En français, analyse les réponses des élèves aux questions du sujet proposé, valide leur réponse si correct et passe à la question suivante. Si la réponse des élèves sont fausses ou incompletes, demande des précisions et guide-les étape par étape vers la bonne réponse mais sans donner les réponses. Ne relie le contenu des questions que sur demande. Sois très concis, ne décrit pas les images, ne réexplique pas les réponses des élèves, ne remercie pas pour les images ou les sujets envoyés. Si l’énoncé provient d’une image ou d’un document, avance sous-question par sous-question. Tu peux recevoir des images (schémas de molécules, circuits électriques normalisés, graphiques, montages expérimentaux, photos d’énoncés). Accepte les arrondis usuels (±2% ou ±0,01) ainsi que les approximations dû à la transcription voix/texte ou encore aux typos. Si il y a un doute, propose aux élèves de choisir parmi quelques propositions proches. Quand l’exercice est terminé, résume les réponses attendues et termine la conversation. Sois bienveillant, espiègle et motivant. Ne pas hésiter à être légèrement extravagant/fun';

  // Build conversation context with exercise info and recent history (limit to last ~2*HISTORY_EXCHANGES messages)
  const msgs: any[] = [
    { role: 'system', content: sys },
  ];
  if (exercise) {
    msgs.push({ role: 'user', content: `Exercice en cours: ${exercise.title}\nContexte / énoncé: ${exercise.description || ''}` });
  }
  const HISTORY_EXCHANGES = Math.max(1, Math.min(50, Number(process.env.HISTORY_EXCHANGES) || 20));
  if (history && history.length) {
    const recent = history.slice(-(2 * HISTORY_EXCHANGES));
  msgs.push({ role: 'system', content: 'Rappel: nous poursuivons la même question/sous-question du sujet. Relie ta réponse à l’énoncé et à l’historique ci-dessous. Si une image est fournie, ne la décris pas: utilise-la uniquement pour lire discrètement valeurs/texte (OCR si besoin) et vérifier les étapes de résolution.' });
    msgs.push(...recent.map(m => ({ role: m.role, content: m.content })));
  }
  if (images && images.length) {
    const content: any[] = [{ type: 'text', text: `Réponse élève (texte): ${answer || '(aucun texte)'}\nIMPORTANT: N’énumère pas ce que tu vois et ne décris pas l’image. Utilise l’image uniquement pour vérifier/calculer, lire discrètement le texte/chiffres (OCR implicite) et relier à la sous-question en cours. Ne dis jamais que tu ne peux pas faire d’OCR. Ne décris l’image que si l’élève le demande explicitement.` }];
    for (const url of images) {
      // Accept data URLs or remote URLs; request higher visual detail
      content.push({ type: 'image_url', image_url: { url, detail: 'high' } as any });
    }
    msgs.push({ role: 'user', content });
  } else {
    msgs.push({ role: 'user', content: `Réponse élève: ${answer}` });
  }

  const baseModel = process.env.FEEDBACK_MODEL || 'gpt-4o-mini';
  const looksVision = /4o|4\.1|omni|vision|gpt-4-turbo|gpt-4o-mini/i.test(baseModel);
  // Always pick a vision-capable model when images are present, regardless of FEEDBACK_MODEL
  let model = (images && images.length)
    ? (process.env.FEEDBACK_VISION_MODEL || 'gpt-4o-mini')
    : baseModel;
  // Note: history is already sliced; we keep the initial system prompt and exercise context intact.
  let chat;
  try {
    chat = await client.chat.completions.create({ model, messages: msgs, temperature: 0.2 });
  } catch (e: any) {
    const msg = String(e?.message || '');
    // If model doesn't support image_url, retry once with a known vision model
    if (images && images.length && /image_url is only supported|Invalid content type/i.test(msg)) {
      const vision = process.env.FEEDBACK_VISION_MODEL || 'gpt-4o-mini';
      chat = await client.chat.completions.create({ model: vision, messages: msgs, temperature: 0.2 });
    } else {
      throw e;
    }
  }
  try { console.debug('[aiFeedback] images:', images?.length || 0, 'model:', model); } catch {}
  const text = chat.choices[0]?.message?.content || '';
  const m = text.match(/\{\s*"score"\s*:\s*(\d{1,3})\s*\}/i);
  const score = m ? Math.max(0, Math.min(100, parseInt(m[1], 10))) : undefined;
  return { feedback: text, score };
}
