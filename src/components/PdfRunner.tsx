"use client";
import { useEffect, useRef, useState } from 'react';
import AnswerForm from '@/components/AnswerForm';
import Calculator from '@/components/Calculator';
import ChatTranscript from '@/components/ChatTranscript';
import { speakText, speakViaApi, speakViaStream } from '@/lib/tts';

export default function PdfRunner({ pdfId, title, level, topic, selectedImagePath }: { pdfId: number; title: string; level: string; topic: string; selectedImagePath?: string }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [conversationMode, setConversationMode] = useState(true);
  const [cloudTts, setCloudTts] = useState(true);
  const answerApiRef = useRef<null | { start: ()=>void; stop: ()=>void; isListening: ()=>boolean }>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const [calcOpen, setCalcOpen] = useState(false);

  async function refreshHistory() {
    try {
      const res = await fetch(`/api/submissions?pdfExerciseId=${pdfId}`, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } });
      if (!res.ok) return;
      const data = await res.json();
      setHistory((data.items || []).map((h: any) => ({ ...h, createdAt: h.createdAt })));
    } catch {}
  }

  useEffect(() => { refreshHistory(); }, [pdfId]);
  // Live refresh with lightweight polling, paused when tab is hidden
  useEffect(() => {
    let t: any;
    const tick = () => { if (typeof document === 'undefined' || document.visibilityState === 'visible') refreshHistory(); };
    t = setInterval(tick, 2000);
    const onVis = () => { if (document.visibilityState === 'visible') refreshHistory(); };
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVis);
    return () => { if (t) clearInterval(t); if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVis); };
  }, [pdfId]);
  useEffect(() => {
    const onChanged = () => refreshHistory();
    if (typeof window !== 'undefined') window.addEventListener('history:changed', onChanged as any);
    return () => { if (typeof window !== 'undefined') window.removeEventListener('history:changed', onChanged as any); };
  }, [pdfId]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [history.length]);

  const onSubmit = async (answer: string, file?: File) => {
    try {
      setError(null); setLoading(true);
      let res: Response;
      if (file) {
        const fd = new FormData();
        fd.append('pdfExerciseId', String(pdfId));
        fd.append('answer', answer || '');
        if (selectedImagePath) fd.append('pageImagePath', selectedImagePath);
        fd.append('image', file);
        res = await fetch('/api/submissions', { method: 'POST', body: fd });
      } else {
        res = await fetch('/api/submissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pdfExerciseId: pdfId, answer, pageImagePath: selectedImagePath }) });
      }
      if (!res.ok) throw new Error('Erreur lors de l\'envoi');
      const data = await res.json();
      refreshHistory();
      if (ttsEnabled && typeof window !== 'undefined' && data.item.feedback) {
        const onEnd = () => {
          if (conversationMode && answerApiRef.current?.start) {
            try { answerApiRef.current.start(); } catch {}
          }
        };
        const short = (data.item.feedback || '').length <= 180;
        if (cloudTts && (!short || conversationMode)) {
          if (conversationMode) {
            speakViaStream(data.item.feedback, { onEnd });
          } else {
            speakViaApi(data.item.feedback, { format: 'mp3', onEnd, fallbackMs: 0 });
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
    <div className="space-y-4" data-pdfid={pdfId} data-pageimg={selectedImagePath || ''}>
      <div className="border rounded p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold">Conversation</h3>
          <button type="button" className="text-sm text-red-600 hover:underline" onClick={async ()=>{ try { await fetch(`/api/submissions?pdfExerciseId=${pdfId}`, { method: 'DELETE' }); setHistory([]); } catch {} }}>Vider</button>
        </div>
        {history.length ? <><ChatTranscript items={history} /><div ref={endRef}/></> : <p className="text-sm text-gray-500">Aucune conversation pour le moment.</p>}
      </div>

      <div className="flex items-center justify-between">
        <AnswerForm onSubmit={onSubmit} apiRef={answerApiRef} conversationMode={conversationMode} />
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
