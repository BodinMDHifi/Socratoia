"use client";
import React, { useEffect, useRef, useState } from 'react';

export default function PdfPageViewer({ pdfUrl, onAttachChange }: { pdfUrl: string; onAttachChange: (dataUrl: string | null) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [attach, setAttach] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workerWarn, setWorkerWarn] = useState<boolean>(false);
  const [retryKey, setRetryKey] = useState<number>(0);

  // Load PDF without worker (simpler in Next)
  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        setLoading(true); setError(null);
  // Use legacy build which plays nicer with SSR bundlers
  const pdfjsLib: any = await import('pdfjs-dist/legacy/build/pdf.js');
  try { (pdfjsLib as any).GlobalWorkerOptions.workerSrc = undefined as any; } catch {}
        // Fetch the PDF as ArrayBuffer to avoid any URL/CORS issues
        const resp = await fetch(pdfUrl);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.arrayBuffer();
  const task = (pdfjsLib as any).getDocument({ data, disableWorker: true });
        const doc = await task.promise;
        if (canceled) return;
        setPdfDoc(doc);
        setNumPages(doc.numPages || 1);
        setPageNum(1);
      } catch (e: any) {
        const msg = String(e?.message || '');
        if (/Setting up fake worker failed/i.test(msg)) {
          // Try a second import path as a fallback
          try {
            const pdfjsAlt: any = await import('pdfjs-dist/build/pdf.js');
            try { (pdfjsAlt as any).GlobalWorkerOptions.workerSrc = undefined as any; } catch {}
            const resp = await fetch(pdfUrl);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const data = await resp.arrayBuffer();
            const task = (pdfjsAlt as any).getDocument({ data, disableWorker: true });
            const doc = await task.promise;
            if (canceled) return;
            setPdfDoc(doc);
            setNumPages(doc.numPages || 1);
            setPageNum(1);
            setWorkerWarn(false);
            setError(null);
          } catch {
            setWorkerWarn(true);
            setError(null); // use iframe fallback quietly
          }
        } else {
          setError(`Impossible de charger le PDF${msg ? ` (${msg})` : ''}.`);
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => { canceled = true; };
  }, [pdfUrl, retryKey]);

  // Render current page
  useEffect(() => {
    let canceled = false;
    (async () => {
      if (!pdfDoc) return;
      try {
        const page = await pdfDoc.getPage(pageNum);
        if (canceled) return;
        const canvas = canvasRef.current; const container = containerRef.current;
        if (!canvas || !container) return;
        const viewport0 = page.getViewport({ scale: 1.0 });
        const maxW = Math.max(300, container.clientWidth || 800);
        const scale = Math.min(2, maxW / viewport0.width);
        const viewport = page.getViewport({ scale });
        const ctx = canvas.getContext('2d'); if (!ctx) return;
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        await page.render({ canvasContext: ctx, viewport }).promise;
        if (attach) {
          // Downscale to max 1280px to keep payload reasonable
          const maxDim = 1280;
          const maxSide = Math.max(canvas.width, canvas.height);
          if (maxSide > maxDim) {
            const scale2 = maxDim / maxSide;
            const outW = Math.round(canvas.width * scale2);
            const outH = Math.round(canvas.height * scale2);
            const exp = document.createElement('canvas');
            exp.width = outW; exp.height = outH;
            const ectx = exp.getContext('2d');
            if (ectx) {
              (ectx as any).drawImage(canvas, 0, 0, outW, outH);
              onAttachChange(exp.toDataURL('image/jpeg', 0.8));
            } else {
              onAttachChange(canvas.toDataURL('image/jpeg', 0.8));
            }
          } else {
            onAttachChange(canvas.toDataURL('image/jpeg', 0.8));
          }
        }
      } catch (e) {
        // ignore render errors
      }
    })();
    return () => { canceled = true; };
  }, [pdfDoc, pageNum, attach]);

  useEffect(() => {
    if (!attach) onAttachChange(null);
  }, [attach]);

  const prev = () => setPageNum(p => Math.max(1, p - 1));
  const next = () => setPageNum(p => Math.min(numPages, p + 1));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button type="button" onClick={prev} className="px-2 py-1 border rounded text-sm" disabled={pageNum<=1}>◀</button>
          <span className="text-sm">Page {pageNum} / {numPages}</span>
          <button type="button" onClick={next} className="px-2 py-1 border rounded text-sm" disabled={pageNum>=numPages}>▶</button>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={attach} onChange={e=>setAttach(e.target.checked)} /> Joindre l’image de cette page à ma réponse
        </label>
      </div>
      {loading && <p className="text-sm text-gray-500">Chargement du PDF…</p>}
      {(workerWarn || error) && (
        <div className="space-y-2">
          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : (
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <span>Affichage via repli (worker désactivé). L’image de page peut ne pas être jointe.</span>
              <button type="button" className="px-2 py-1 border rounded text-xs" onClick={()=>setRetryKey(k=>k+1)}>Réessayer le rendu</button>
              <label className="px-2 py-1 border rounded text-xs cursor-pointer">
                Joindre une capture…
                <input type="file" accept="image/*" className="hidden" onChange={async (e)=>{
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const buf = await f.arrayBuffer();
                  const blob = new Blob([buf], { type: f.type || 'image/jpeg' });
                  const fr = await new Promise<string>((resolve)=>{ const r = new FileReader(); r.onload = ()=> resolve(String(r.result)); r.readAsDataURL(blob); });
                  setAttach(true);
                  onAttachChange(fr);
                }} />
              </label>
            </div>
          )}
          <div className="aspect-[1/1.3] w-full bg-white border rounded overflow-hidden">
            <iframe src={pdfUrl} className="w-full h-full" />
          </div>
        </div>
      )}
      <div ref={containerRef} className="w-full bg-white border rounded overflow-auto max-h-[70vh]">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
