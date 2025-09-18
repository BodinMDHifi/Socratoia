"use client";
import { useEffect, useRef, useState } from 'react';
import AnswerForm from '@/components/AnswerForm';
import Calculator from '@/components/Calculator';
import MathText from '@/components/MathText';
import ChatTranscript from '@/components/ChatTranscript';
import { speakText, speakViaApi, speakViaStream } from '@/lib/tts';

export default function ExerciseRunner({ exerciseId }: { exerciseId: number }) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [conversationMode, setConversationMode] = useState(true);
  const [cloudTts, setCloudTts] = useState(true);
  const answerApiRef = useRef<null | { start: ()=>void; stop: ()=>void; isListening: ()=>boolean }>(null);
  const [history, setHistory] = useState<any[]>([]);
  const endRef = useRef<HTMLDivElement | null>(null);
  const [calcOpen, setCalcOpen] = useState(false);

  async function refreshHistory() {
    try {
      const res = await fetch(`/api/submissions?exerciseId=${exerciseId}`);
      if (!res.ok) return;
      const data = await res.json();
      setHistory((data.items || []).map((h: any) => ({ ...h, createdAt: h.createdAt })));
    } catch {}
  }

  useEffect(() => { refreshHistory(); }, [exerciseId]);
  useEffect(() => {
    const onChanged = () => refreshHistory();
    const listener = onChanged as EventListener;
    if (typeof window !== 'undefined') window.addEventListener('history:changed', listener);
    return () => { if (typeof window !== 'undefined') window.removeEventListener('history:changed', listener); };
  }, [exerciseId]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [history.length]);

  const onSubmit = async (answer: string, file?: File) => {
    try {
      setError(null); setFeedback(null); setScore(undefined); setLoading(true);
      let res: Response;
      if (file) {
        const fd = new FormData();
        fd.append('exerciseId', String(exerciseId));
        fd.append('answer', answer || '');
        fd.append('image', file);
        res = await fetch('/api/submissions', { method: 'POST', body: fd });
      } else {
        res = await fetch('/api/submissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ exerciseId, answer }) });
      }
      if (!res.ok) {
        const data = await res.json().catch(()=>({ error: 'Erreur' }));
        throw new Error(data.error || 'Erreur lors de l\'envoi');
      }
      const data = await res.json();
      setFeedback(data.item.feedback);
      setScore(data.item.score);
      // Update existing conversation without duplicating the block elsewhere
      refreshHistory();
      if (ttsEnabled && typeof window !== 'undefined' && data.item.feedback) {
        const onEnd = () => {
          if (conversationMode && answerApiRef.current?.start) {
            // give the mic back to the student
            try { answerApiRef.current.start(); } catch {}
          }
        };
        const short = (data.item.feedback || '').length <= 180;
        if (cloudTts && (!short || conversationMode)) {
          // Use streaming for faster first audio; fallback to single file for very short answers
          if (conversationMode) {
            speakViaStream(data.item.feedback, { onEnd });
          } else {
            speakViaApi(data.item.feedback, { voice: undefined, format: 'mp3', onEnd, fallbackMs: 0 });
          }
        } else {
          speakText(data.item.feedback, { lang: 'fr-FR', onEnd });
        }
      }
    } catch (e: any) {
      setError(e.message || 'Erreur inattendue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4" data-exerciseid={exerciseId}>
      <div className="border rounded p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold">Conversation</h3>
          <button
            type="button"
            className="text-sm text-red-600 hover:underline"
            onClick={async ()=>{
              try {
                await fetch(`/api/submissions?exerciseId=${exerciseId}`, { method: 'DELETE' });
                setHistory([]);
              } catch {}
            }}
          >Vider</button>
        </div>
        {history.length > 0 ? (
          <>
            <ChatTranscript items={history} />
            <div ref={endRef} />
          </>
        ) : (
          <p className="text-sm text-gray-500">Aucune conversation pour le moment.</p>
        )}
      </div>
      <div className="flex items-center justify-between">
        <AnswerForm onSubmit={onSubmit} apiRef={answerApiRef} conversationMode={conversationMode} exerciseId={exerciseId} />
        <button type="button" onClick={()=>setCalcOpen(true)} className="ml-3 px-3 py-2 rounded border bg-white hover:bg-gray-50 text-sm">Calculatrice</button>
      </div>
      <div className="flex items-center gap-2">
        <input id="toggle-tts" type="checkbox" className="h-4 w-4" checked={ttsEnabled} onChange={e=>setTtsEnabled(e.target.checked)} />
        <label htmlFor="toggle-tts" className="text-sm select-none">Lecture audio du feedback</label>
        <span className="mx-2 text-gray-300">|</span>
        <input id="toggle-tts-cloud" type="checkbox" className="h-4 w-4" checked={cloudTts} onChange={e=>setCloudTts(e.target.checked)} />
        <label htmlFor="toggle-tts-cloud" className="text-sm select-none">Voix naturelle (serveur)</label>
        <span className="mx-2 text-gray-300">|</span>
        <input id="toggle-conv" type="checkbox" className="h-4 w-4" checked={conversationMode} onChange={e=>setConversationMode(e.target.checked)} />
        <label htmlFor="toggle-conv" className="text-sm select-none">Mode conversation (alternance voix)</label>
      </div>
  <Calculator open={calcOpen} onClose={()=>setCalcOpen(false)} />
      {loading && <p className="text-sm text-gray-600">Analyse de la réponse…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
