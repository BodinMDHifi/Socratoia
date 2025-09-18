// Utilities to convert LaTeX to speech-friendly French and speak via Web Speech API

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function latexToSpokenText(input: string): string {
  if (!input) return '';
  let text = input;

  // Remove math delimiters: $$...$$, \[...], \(...)
  text = text.replace(/\$\$([\s\S]+?)\$\$/g, '$1');
  text = text.replace(/\\\[([\s\S]+?)\\\]/g, '$1');
  text = text.replace(/\\\(([\s\S]+?)\\\)/g, '$1');

  // Fractions \frac{a}{b} -> "a sur b"
  text = text.replace(/\\frac\s*{([^}]+)}\s*{([^}]+)}/g, '$1 sur $2');

  // Square root and nth root
  text = text.replace(/\\sqrt\s*{([^}]+)}/g, 'racine carrée de $1');
  text = text.replace(/\\sqrt\s*\[([^\]]+)]\s*{([^}]+)}/g, 'racine de degré $1 de $2');

  // Superscripts: ^{...} and ^x
  text = text.replace(/\^\{([^}]+)}/g, (_m, p1) => {
    if (p1 === '2') return ' au carré';
    if (p1 === '3') return ' au cube';
    return ` puissance ${p1}`;
  });
  text = text.replace(/\^([A-Za-z0-9])/g, (_m, p1) => {
    if (p1 === '2') return ' au carré';
    if (p1 === '3') return ' au cube';
    return ` puissance ${p1}`;
  });

  // Subscripts: _{...} and _x
  text = text.replace(/_\{([^}]+)}/g, ' indice $1');
  text = text.replace(/_([A-Za-z0-9])/g, ' indice $1');

  // Common symbols
  const symbolMap: Record<string, string> = {
    '\\cdot': ' fois ',
    '\\times': ' fois ',
    '\\approx': ' approximativement égal à ',
    '\\pm': ' plus ou moins ',
    '\\leq': ' inférieur ou égal à ',
    '\\geq': ' supérieur ou égal à ',
    '\\neq': ' différent de ',
    '=': ' égal ',
    '+': ' plus ',
    '-': ' moins ',
    '*': ' fois ',
  };
  for (const [k, v] of Object.entries(symbolMap)) {
    const re = new RegExp(escapeRegExp(k), 'g');
    text = text.replace(re, v);
  }

  // Greek letters (basic)
  const greek: Record<string, string> = {
    '\\alpha': ' alpha ', '\\beta': ' bêta ', '\\gamma': ' gamma ', '\\delta': ' delta ',
    '\\theta': ' thêta ', '\\lambda': ' lambda ', '\\mu': ' mu ', '\\pi': ' pi ',
    '\\rho': ' ro ', '\\sigma': ' sigma ', '\\phi': ' phi ', '\\omega': ' oméga '
  };
  for (const [k, v] of Object.entries(greek)) {
    const re = new RegExp(escapeRegExp(k), 'g');
    text = text.replace(re, v);
  }

  // Remove remaining backslashes from simple commands
  text = text.replace(/\\/g, ' ');

  // Collapse whitespace
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}

export function speakText(
  raw: string,
  opts?: { lang?: string; rate?: number; pitch?: number; onEnd?: () => void }
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  let text = raw;
  try {
    text = latexToSpokenText(raw);
  } catch {
    text = raw; // fallback if parsing fails
  }
  const u = new SpeechSynthesisUtterance(text);
  u.lang = opts?.lang || 'fr-FR';
  if (opts?.rate) u.rate = opts.rate;
  if (opts?.pitch) u.pitch = opts.pitch;
  if (opts?.onEnd) u.onend = opts.onEnd;

  // Try to pick a more natural French voice if available (Google/Microsoft voices are often higher quality)
  const pickVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;
    const candidates = [
      // Common higher-quality French voices
      'Google français', 'Google français (France)', 'Google UK French Female', 'Google français (Canada)',
      'Microsoft Hortense Online (Natural) - French (France)', 'Microsoft Julie', 'Microsoft Hortense - French (France)',
    ];
    // Prefer voices matching our language and a known nice name
    const bestByName = voices.find(v => candidates.some(c => v.name.includes(c)) && v.lang?.toLowerCase().startsWith('fr'));
    if (bestByName) return bestByName;
    // Otherwise prefer any French voice with "Natural" or high-quality vendor
    const natural = voices.find(v => v.lang?.toLowerCase().startsWith('fr') && /google|microsoft|natural/i.test(v.name));
    if (natural) return natural;
    // Fallback to first French voice
    const fr = voices.find(v => v.lang?.toLowerCase().startsWith('fr'));
    return fr || null;
  };

  const assignVoiceAndSpeak = () => {
    const v = pickVoice();
    if (v) u.voice = v;
    // Stop any ongoing speech to avoid overlap
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  // Some browsers load voices asynchronously
  if (window.speechSynthesis.getVoices().length === 0) {
    const once = () => { assignVoiceAndSpeak(); window.speechSynthesis.removeEventListener('voiceschanged', once); };
    window.speechSynthesis.addEventListener('voiceschanged', once);
    // Trigger load
    window.speechSynthesis.getVoices();
  } else {
    assignVoiceAndSpeak();
  }
}

// Optional: use server-side neural TTS for more natural voice
export async function speakViaApi(text: string, opts?: { voice?: string; format?: 'mp3'|'wav'|'ogg'; onEnd?: () => void; fallbackMs?: number }) {
  let fallbackStarted = false;
  const timeoutMs = typeof opts?.fallbackMs === 'number' ? opts.fallbackMs : 700;
  const t = timeoutMs > 0 ? setTimeout(() => {
    fallbackStarted = true;
    speakText(text, { lang: 'fr-FR', onEnd: opts?.onEnd });
  }, timeoutMs) : null as any;
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice: opts?.voice, format: opts?.format || 'mp3' }),
    });
    if (!res.ok) throw new Error('TTS API failed');
    const blob = await res.blob();
    if (t) clearTimeout(t);
    if (fallbackStarted) {
      // Already speaking locally; don't double-play
      return;
    }
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.onended = () => { URL.revokeObjectURL(url); if (opts?.onEnd) opts.onEnd(); };
    await audio.play();
  } catch (e) {
    if (t) clearTimeout(t);
    if (!fallbackStarted) {
      // Fallback to on-device TTS
      speakText(text, { lang: 'fr-FR', onEnd: opts?.onEnd });
    }
  }
}

// Streaming version: fetches NDJSON of mp3 base64 chunks and plays them sequentially with minimal gap.
export async function speakViaStream(text: string, opts?: { voice?: string; onEnd?: () => void; sentenceGapMs?: number }) {
  if (typeof window === 'undefined') return;
  const gap = opts?.sentenceGapMs ?? 120;
  try {
    const res = await fetch('/api/tts/stream', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, voice: opts?.voice }) });
    if (!res.ok || !res.body) throw new Error('stream request failed');
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let playing = false;
    const queue: HTMLAudioElement[] = [];

    const playNext = () => {
      if (playing) return;
      const item = queue.shift();
      if (!item) { opts?.onEnd?.(); return; }
      playing = true;
      item.onended = () => { playing = false; setTimeout(playNext, gap); };
      item.play().catch(()=>{ playing = false; setTimeout(playNext, gap); });
    };

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 1);
        if (!line) continue;
        try {
          const json = JSON.parse(line);
          if (json?.b64) {
            const url = 'data:audio/mpeg;base64,' + json.b64;
            const audio = new Audio(url);
            queue.push(audio);
            playNext();
          }
        } catch {}
      }
    }
    // Flush remaining
    if (buffer.trim()) {
      try {
        const json = JSON.parse(buffer.trim());
        if (json?.b64) {
          const url = 'data:audio/mpeg;base64,' + json.b64;
          const audio = new Audio(url);
          queue.push(audio);
          playNext();
        }
      } catch {}
    }
  } catch (e) {
    // fallback to standard
    speakViaApi(text, { fallbackMs: 0 });
  }
}
