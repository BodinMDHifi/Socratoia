"use client";
import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import DrawingPad from './DrawingPad';
import { speakText } from '@/lib/tts';

type VoiceApi = { start: ()=>void; stop: ()=>void; isListening: ()=>boolean };

type AnswerFormProps = {
  onSubmit: (answer: string, file?: File)=>Promise<void> | void;
  apiRef?: MutableRefObject<VoiceApi | null> | null;
  conversationMode?: boolean;
  exerciseId?: number;
  pdfExerciseId?: number;
  pageImagePath?: string;
};

export default function AnswerForm({ onSubmit, apiRef, conversationMode, exerciseId, pdfExerciseId, pageImagePath }: AnswerFormProps) {
  const [answer, setAnswer] = useState('');
  const [file, setFile] = useState<File | undefined>(undefined);
  const [padOpen, setPadOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const mediaChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [voiceMode, setVoiceMode] = useState(false);
  // DrawingPad is imported statically to avoid dynamic chunk loading errors

  // Dictation removed; keep apiRef shape as no-op for compatibility
  useEffect(() => {
    if (apiRef) {
      apiRef.current = { start: () => {}, stop: () => {}, isListening: () => false };
    }
  }, [apiRef]);
  const speak = () => {
    speakText(answer, { lang: 'fr-FR' });
  };

  // New: record audio and send directly to voice API (transcribe + TTS response)
  const startVoiceChat = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const mr = new MediaRecorder(stream);
      mediaChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) mediaChunksRef.current.push(e.data); };
      mr.onstop = async () => {
        const blob = new Blob(mediaChunksRef.current, { type: 'audio/webm' });
        const fd = new FormData();
        fd.append('audio', new File([blob], 'audio.webm', { type: 'audio/webm' }));
        if (typeof exerciseId === 'number') fd.append('exerciseId', String(exerciseId));
        if (typeof pdfExerciseId === 'number') fd.append('pdfExerciseId', String(pdfExerciseId));
        const pagePath = pageImagePath ?? '';
        if (pagePath) fd.append('pageImagePath', pagePath);
        const resp = await fetch('/api/submissions/audio', { method: 'POST', body: fd });
        const data = await resp.json();
        // Don't inject transcript into the textarea; it will appear in the conversation view
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('history:changed'));
        }
        if (data?.audioPath) {
          const audio = new Audio(data.audioPath);
          audio.play().catch(()=>{});
        }
      };
      mr.start();
      mediaRecRef.current = mr;
      setVoiceMode(true);
    } catch (e: any) {
      setMicError('Impossible de démarrer le chat vocal. Autorisations micro requises.');
    }
  };
  const stopVoiceChat = () => {
    try { mediaRecRef.current?.stop(); } catch {}
    try { mediaStreamRef.current?.getTracks().forEach(t=>t.stop()); mediaStreamRef.current = null; } catch {}
    setVoiceMode(false);
  };

  return (
    <div className="space-y-3">
      <textarea value={answer} onChange={e=>setAnswer(e.target.value)} className="w-full border rounded p-2 min-h-[120px]" placeholder="Écris ta réponse..."/>
      <div>
        <label className="text-sm text-gray-700">Ajouter une image (schéma, graphe, montage):</label>
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>setFile(e.target.files?.[0] || undefined)} className="block mt-1" />
        <div className="mt-2">
          <button type="button" onClick={()=>setPadOpen(true)} className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm">Dessiner un schéma</button>
        </div>
      </div>
      
      <div className="flex gap-2 items-center flex-wrap">
        <button type="button" onClick={voiceMode ? stopVoiceChat : startVoiceChat} className={`px-3 py-2 rounded ${voiceMode ? 'bg-red-500' : 'bg-purple-600'} text-white`}>
          {voiceMode ? 'Stop (vocal IA)' : 'Parler à l’IA (direct)'}
        </button>
  <button type="button" onClick={speak} className="px-3 py-2 rounded bg-accent text-white">Lire la réponse</button>
  <button disabled={busy} onClick={async ()=>{ setBusy(true); try { await onSubmit(answer, file); setAnswer(''); setFile(undefined); const fi = document.querySelector('input[type=file]') as HTMLInputElement | null; if (fi) fi.value = ''; } finally { setBusy(false); } }} className="px-3 py-2 rounded bg-green-600 text-white disabled:opacity-50">{busy ? 'Envoi…' : 'Envoyer'}</button>
  {/* Removed toggle for reading the student's answer */}
      </div>
      
      {micError && <p className="text-sm text-red-600">{micError}</p>}
      {padOpen && (
        <DrawingPad
          open={padOpen}
          onClose={()=>setPadOpen(false)}
          onSave={async (imgFile: File) => {
            // Auto-send the sketch immediately with any typed answer
            setBusy(true);
            try {
              await onSubmit(answer, imgFile);
              setAnswer('');
              setFile(undefined);
              const fi = document.querySelector('input[type=file]') as HTMLInputElement | null;
              if (fi) fi.value = '';
            } finally {
              setBusy(false);
              setPadOpen(false);
            }
          }}
        />
      )}
    </div>
  );
}
