"use client";
import React, { useEffect, useRef, useState } from 'react';

type Tool = 'pen' | 'eraser' | 'line' | 'arrow' | 'rect' | 'circle' | 'text';

export default function DrawingPad({ open, onClose, onSave }: { open: boolean; onClose: ()=>void; onSave: (file: File)=>void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState<string>('#111827'); // gray-900
  const [size, setSize] = useState<number>(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{x:number;y:number}|null>(null);
  const [undoStack, setUndoStack] = useState<ImageData[]>([]);
  const [redoStack, setRedoStack] = useState<ImageData[]>([]);
  const [showGrid, setShowGrid] = useState(true);
  const [snap45, setSnap45] = useState(false);
  const [startSnap, setStartSnap] = useState<ImageData|null>(null);

  // Enable Ctrl+V paste of images while the pad is open
  useEffect(() => {
    if (!open) return;
    const onPaste = (e: ClipboardEvent) => {
      try {
        const items = e.clipboardData?.items || [] as any;
        for (let i = 0; i < items.length; i++) {
          const it: any = items[i];
          if (it.kind === 'file' && it.type?.startsWith('image/')) {
            const file = it.getAsFile();
            if (file) {
              e.preventDefault();
              void drawPastedImage(file);
              break;
            }
          }
        }
      } catch {}
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [open]);

  // Resize canvas to container size with DPR
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement as HTMLElement | null;
    if (!parent) return;
    const resize = () => {
      const dpr = Math.max(1, (window as any).devicePixelRatio || 1);
      const w = Math.max(600, parent.clientWidth);
      const h = Math.max(360, Math.round(parent.clientWidth * 0.6));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      const ctx = canvas.getContext('2d');
      if (ctx) {
        (ctx as any).setTransform(1,0,0,1,0,0);
        ctx.scale(dpr, dpr);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0,0,w,h);
      }
    };
    resize();
    const ro = new (window as any).ResizeObserver(resize);
    ro.observe(parent);
    return () => ro.disconnect();
  }, [open]);

  const pushUndo = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const w = Math.floor(parseInt(canvas.style.width || '0') || canvas.width);
    const h = Math.floor(parseInt(canvas.style.height || '0') || canvas.height);
    const img = ctx.getImageData(0, 0, w, h);
    setUndoStack((s)=>[...s.slice(-19), img]);
    setRedoStack([]);
  };

  const getCtx = () => {
    const canvas = canvasRef.current; if (!canvas) return { canvas: null as any, ctx: null as any, cw: 0, ch: 0 };
    const ctx = canvas.getContext('2d'); if (!ctx) return { canvas, ctx: null as any, cw: 0, ch: 0 };
    const cw = Math.floor(parseInt(canvas.style.width || '0') || canvas.width);
    const ch = Math.floor(parseInt(canvas.style.height || '0') || canvas.height);
    return { canvas, ctx, cw, ch };
  };

  const restoreStartSnapshot = () => {
    const { ctx } = getCtx(); if (!ctx) return;
    if (startSnap) (ctx as any).putImageData(startSnap, 0, 0);
  };

  const drawArrowHead = (ctx: CanvasRenderingContext2D, x1:number, y1:number, x2:number, y2:number) => {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const len = Math.max(8, size * 3);
    (ctx as any).beginPath();
    (ctx as any).moveTo(x2, y2);
    (ctx as any).lineTo(x2 - len * Math.cos(angle - Math.PI / 6), y2 - len * Math.sin(angle - Math.PI / 6));
    (ctx as any).moveTo(x2, y2);
    (ctx as any).lineTo(x2 - len * Math.cos(angle + Math.PI / 6), y2 - len * Math.sin(angle + Math.PI / 6));
    (ctx as any).stroke();
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (tool === 'text') {
      const text = (window as any).prompt('Texte à insérer:');
      if (text) {
        pushUndo();
        const ctx = canvas.getContext('2d'); if (!ctx) return;
        ctx.fillStyle = color;
        (ctx as any).font = '16px Inter, system-ui, sans-serif';
        (ctx as any).fillText(text, x, y);
      }
      return;
    }
    pushUndo();
    setIsDrawing(true);
    setStartPos({ x, y });
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    if (tool === 'pen' || tool === 'eraser') {
      const ctx = canvas.getContext('2d'); if (!ctx) return;
      (ctx as any).strokeStyle = tool === 'pen' ? color : '#000000';
      (ctx as any).lineWidth = size;
      (ctx as any).lineCap = 'round';
      (ctx as any).globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
      (ctx as any).beginPath();
      (ctx as any).moveTo(x, y);
    } else {
      // capture snapshot for preview shapes
      const w = Math.floor(parseInt(canvas.style.width || '0') || canvas.width);
      const h = Math.floor(parseInt(canvas.style.height || '0') || canvas.height);
      setStartSnap(ctx.getImageData(0, 0, w, h));
    }
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    if (tool === 'pen' || tool === 'eraser') {
      (ctx as any).lineTo(x, y);
      (ctx as any).stroke();
    } else if (startPos) {
      // Shape preview: restore snapshot and draw current shape
      restoreStartSnapshot();
      (ctx as any).strokeStyle = color;
      (ctx as any).lineWidth = size;
      (ctx as any).lineCap = 'round';
      let x2 = x, y2 = y;
      if (snap45 && (tool === 'line' || tool === 'arrow')) {
        const dx = x - startPos.x; const dy = y - startPos.y;
        const ang = Math.atan2(dy, dx);
        const step = Math.PI / 4; // 45°
        const len = Math.hypot(dx, dy);
        const a2 = Math.round(ang / step) * step;
        x2 = startPos.x + len * Math.cos(a2);
        y2 = startPos.y + len * Math.sin(a2);
      }
      if (tool === 'line' || tool === 'arrow') {
        (ctx as any).beginPath();
        (ctx as any).moveTo(startPos.x, startPos.y);
        (ctx as any).lineTo(x2, y2);
        (ctx as any).stroke();
        if (tool === 'arrow') drawArrowHead(ctx, startPos.x, startPos.y, x2, y2);
      } else if (tool === 'rect') {
        const rx = Math.min(startPos.x, x2); const ry = Math.min(startPos.y, y2);
        const rw = Math.abs(x2 - startPos.x); const rh = Math.abs(y2 - startPos.y);
        (ctx as any).strokeRect(rx, ry, rw, rh);
      } else if (tool === 'circle') {
        const dx = x2 - startPos.x; const dy = y2 - startPos.y;
        const r = Math.hypot(dx, dy);
        (ctx as any).beginPath();
        (ctx as any).ellipse(startPos.x, startPos.y, r, r, 0, 0, Math.PI * 2);
        (ctx as any).stroke();
      }
    }
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    if ((tool === 'line' || tool === 'arrow' || tool === 'rect' || tool === 'circle') && startPos) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      (ctx as any).strokeStyle = color;
      (ctx as any).lineWidth = size;
      (ctx as any).lineCap = 'round';
      let x2 = x, y2 = y;
      if (snap45 && (tool === 'line' || tool === 'arrow')) {
        const dx = x - startPos.x; const dy = y - startPos.y;
        const ang = Math.atan2(dy, dx);
        const step = Math.PI / 4; const len = Math.hypot(dx, dy);
        const a2 = Math.round(ang / step) * step;
        x2 = startPos.x + len * Math.cos(a2);
        y2 = startPos.y + len * Math.sin(a2);
      }
      if (tool === 'line' || tool === 'arrow') {
        (ctx as any).beginPath();
        (ctx as any).moveTo(startPos.x, startPos.y);
        (ctx as any).lineTo(x2, y2);
        (ctx as any).stroke();
        if (tool === 'arrow') drawArrowHead(ctx, startPos.x, startPos.y, x2, y2);
      } else if (tool === 'rect') {
        const rx = Math.min(startPos.x, x2); const ry = Math.min(startPos.y, y2);
        const rw = Math.abs(x2 - startPos.x); const rh = Math.abs(y2 - startPos.y);
        (ctx as any).strokeRect(rx, ry, rw, rh);
      } else if (tool === 'circle') {
        const dx = x2 - startPos.x; const dy = y2 - startPos.y;
        const r = Math.hypot(dx, dy);
        (ctx as any).beginPath();
        (ctx as any).ellipse(startPos.x, startPos.y, r, r, 0, 0, Math.PI * 2);
        (ctx as any).stroke();
      }
    }
    // reset eraser blend mode after finishing
    if (tool === 'eraser') {
      (ctx as any).globalCompositeOperation = 'source-over';
    }
    setStartPos(null);
    setStartSnap(null);
  };

  const clear = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const w = parseInt(canvas.style.width || '0') || canvas.width;
    const h = parseInt(canvas.style.height || '0') || canvas.height;
    (ctx as any).clearRect(0,0,w,h);
    (ctx as any).fillStyle = '#ffffff';
    (ctx as any).fillRect(0,0,w,h);
  };

  const undo = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const prev = undoStack[undoStack.length - 1];
    if (!prev) return;
    const w = parseInt(canvas.style.width || '0') || canvas.width;
    const h = parseInt(canvas.style.height || '0') || canvas.height;
    // push current to redo, then restore prev
    const cur = (ctx as any).getImageData(0, 0, w, h);
    setRedoStack((r)=>[...r.slice(-19), cur]);
    (ctx as any).putImageData(prev, 0, 0);
    setUndoStack((s)=>s.slice(0, -1));
  };

  const redo = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const next = redoStack[redoStack.length - 1];
    if (!next) return;
    const w = parseInt(canvas.style.width || '0') || canvas.width;
    const h = parseInt(canvas.style.height || '0') || canvas.height;
    const cur = (ctx as any).getImageData(0, 0, w, h);
    setUndoStack((u)=>[...u.slice(-19), cur]);
    (ctx as any).putImageData(next, 0, 0);
    setRedoStack((r)=>r.slice(0, -1));
  };

  const insertAxes = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    pushUndo();
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const w = parseInt(canvas.style.width || '0') || canvas.width;
    const h = parseInt(canvas.style.height || '0') || canvas.height;
    (ctx as any).strokeStyle = '#9CA3AF'; // gray-400
    (ctx as any).lineWidth = 1;
    (ctx as any).beginPath();
    // X axis
    (ctx as any).moveTo(40, h - 40);
    (ctx as any).lineTo(w - 20, h - 40);
    // Y axis
    (ctx as any).moveTo(40, h - 40);
    (ctx as any).lineTo(40, 20);
    (ctx as any).stroke();
    // Arrow heads
    (ctx as any).beginPath();
    (ctx as any).moveTo(w - 24, h - 44); (ctx as any).lineTo(w - 20, h - 40); (ctx as any).lineTo(w - 24, h - 36);
    (ctx as any).moveTo(36, 24); (ctx as any).lineTo(40, 20); (ctx as any).lineTo(44, 24);
    (ctx as any).stroke();
  };

  const save = async () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const w = parseInt(canvas.style.width || '0') || canvas.width;
    const h = parseInt(canvas.style.height || '0') || canvas.height;
    // Downscale if large to keep payload reasonable for the AI (maxDim 1280)
    const maxDim = 1280;
    const scale = Math.min(1, maxDim / Math.max(w, h));
    const outW = Math.round(w * scale);
    const outH = Math.round(h * scale);
    // Create export canvas with white background
    const exp = document.createElement('canvas');
    exp.width = outW; exp.height = outH;
    const ectx = exp.getContext('2d'); if (!ectx) return;
    (ectx as any).fillStyle = '#ffffff'; (ectx as any).fillRect(0,0,outW,outH);
    (ectx as any).drawImage(canvas, 0, 0, outW, outH);
    // Prefer JPEG to reduce size
    const blob: Blob | null = await new Promise(res => (exp as any).toBlob((b: Blob)=>res(b), 'image/jpeg', 0.85));
    if (!blob) return;
    const file = new File([blob], `schema-${Date.now()}.jpg`, { type: 'image/jpeg' });
    onSave(file);
    onClose();
  };

  const copyToClipboard = async () => {
    try {
      const canvas = canvasRef.current; if (!canvas) return;
      const blob: Blob | null = await new Promise(res => (canvas as any).toBlob((b: Blob)=>res(b), 'image/png', 1.0));
      if (!blob) throw new Error('toBlob returned null');
      const item = new (window as any).ClipboardItem({ 'image/png': blob });
      await (navigator as any).clipboard.write([item]);
      (window as any).alert('Image copiée dans le presse‑papier.');
    } catch (err) {
      try {
        const canvas = canvasRef.current; if (!canvas) return;
        const dataUrl = (canvas as HTMLCanvasElement).toDataURL('image/png');
        await navigator.clipboard.writeText(dataUrl);
        (window as any).alert('Data URL copiée dans le presse‑papier.');
      } catch (e) {
        (window as any).alert('Copie impossible dans ce contexte.');
      }
    }
  };

  const drawPastedImage = async (blobOrFile: Blob) => {
    const { canvas, ctx, cw, ch } = getCtx(); if (!ctx || !canvas) return;
    pushUndo();
    try {
      // Ensure normal blending for image draw
      (ctx as any).globalCompositeOperation = 'source-over';
      const blob = blobOrFile;
      const url = URL.createObjectURL(blob);
      const img = new Image();
      await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; img.src = url; });
      // Fit image into canvas while preserving aspect ratio
      const scale = Math.min(cw / img.width, ch / img.height, 1);
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const x = Math.round((cw - w) / 2);
      const y = Math.round((ch - h) / 2);
      (ctx as any).drawImage(img, x, y, w, h);
      try { URL.revokeObjectURL(url); } catch {}
    } catch (err) {
      (window as any).alert('Impossible de coller l\'image. Autorisations du presse‑papier manquantes ?');
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const navAny = navigator as any;
      if (!navAny.clipboard || !navAny.clipboard.read) {
        (window as any).alert('Ton navigateur ne permet pas la lecture directe du presse‑papier ici. Essaie Ctrl+V dans la zone de dessin.');
        return;
      }
      const items = await navAny.clipboard.read();
      for (const item of items) {
        const t = item.types?.find((ty: string) => ty.startsWith('image/'));
        if (t) {
          const blob = await item.getType(t);
          await drawPastedImage(blob);
          return;
        }
      }
      (window as any).alert('Aucune image trouvée dans le presse‑papier.');
    } catch (e) {
      (window as any).alert('Lecture du presse‑papier refusée. Essaie Ctrl+V.');
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-[95vw] max-w-4xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-wrap gap-2 items-center">
            <select value={tool} onChange={e=>setTool(e.target.value as Tool)} className="border rounded px-2 py-1 text-sm">
              <option value="pen">Crayon</option>
              <option value="eraser">Gomme</option>
              <option value="line">Segment</option>
              <option value="arrow">Flèche</option>
              <option value="rect">Rectangle</option>
              <option value="circle">Cercle</option>
              <option value="text">Texte</option>
            </select>
            <input type="color" value={color} onChange={e=>setColor(e.target.value)} className="h-8 w-10" />
            <input type="range" min={1} max={12} value={size} onChange={e=>setSize(parseInt(e.target.value))} />
            <button type="button" onClick={undo} className="px-3 py-2 rounded bg-gray-100 border hover:bg-gray-200 text-sm">Annuler</button>
            <button type="button" onClick={redo} className="px-3 py-2 rounded bg-gray-100 border hover:bg-gray-200 text-sm">Refaire</button>
            <button type="button" onClick={clear} className="px-3 py-2 rounded bg-gray-100 border hover:bg-gray-200 text-sm">Effacer</button>
            <button type="button" onClick={insertAxes} className="px-3 py-2 rounded bg-gray-100 border hover:bg-gray-200 text-sm">Insérer axes</button>
            <label className="flex items-center gap-1 text-sm">
              <input type="checkbox" checked={showGrid} onChange={e=>setShowGrid(e.target.checked)} /> Grille
            </label>
            <label className="flex items-center gap-1 text-sm">
              <input type="checkbox" checked={snap45} onChange={e=>setSnap45(e.target.checked)} /> Alignement 45°
            </label>
            <button type="button" onClick={copyToClipboard} className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm">Copier l'image</button>
            <button type="button" onClick={pasteFromClipboard} className="px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 text-sm">Coller une image</button>
            <span className="text-xs text-gray-500">(ou Ctrl+V)</span>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Fermer</button>
            <button type="button" onClick={save} className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">Enregistrer</button>
          </div>
        </div>
        <div className="relative">
          {showGrid && (
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: `repeating-linear-gradient(0deg, rgba(125,163,255,0.15) 0px, rgba(125,163,255,0.15) 1px, transparent 1px, transparent 24px), repeating-linear-gradient(90deg, rgba(125,163,255,0.1) 0px, rgba(125,163,255,0.1) 1px, transparent 1px, transparent 24px)`
            }} />
          )}
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="w-full h-auto border rounded bg-white touch-none"
          />
        </div>
      </div>
    </div>
  );
}
