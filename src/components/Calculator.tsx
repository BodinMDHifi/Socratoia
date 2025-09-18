"use client";
import { useEffect, useRef, useState } from 'react';

export default function Calculator({ open, onClose }: { open: boolean; onClose: ()=>void }) {
  const [expr, setExpr] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setExpr(""); setError(null);
    }
  }, [open]);

  if (!open) return null;

  const append = (t: string) => {
    setExpr((e) => (e || "") + t);
    setError(null);
  };
  const clear = () => { setExpr(""); setError(null); };
  const back = () => { setExpr((e) => e.slice(0, -1)); setError(null); };

  const sanitizeAndEval = (raw: string): number => {
    const s = (raw || "").trim();
    if (!s) return 0;
    // Allow only digits, operators, parentheses, decimal separator, spaces, percent and caret
    if (!/^[0-9+\-*/().\s%^]+$/.test(s)) {
      throw new Error("Caractères non autorisés");
    }
    // Replace percentage: 50% => (50/100)
    let expr = s.replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");
    // Replace caret with exponent
    expr = expr.replace(/\^/g, "**");
    // Extra safety: prevent multiple consecutive operators (except minus for negative)
    if (/[*\/+^%]{2,}/.test(expr.replace(/\*\*/g, '*'))) {
      throw new Error("Expression invalide");
    }
    // Evaluate using Function; input is sanitized above
    // eslint-disable-next-line no-new-func
    const fn = new Function(`return (${expr})`);
    const val = Number(fn());
    if (!isFinite(val)) throw new Error("Résultat invalide");
    return val;
  };

  const evaluate = () => {
    try {
      const v = sanitizeAndEval(expr);
      setExpr(String(v));
      setError(null);
    } catch (e: any) {
      setError(e?.message || "Erreur");
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); evaluate(); }
    if (e.key === 'Escape') { e.preventDefault(); onClose(); }
  };

  const Row = ({ children }: { children: React.ReactNode }) => (
    <div className="grid grid-cols-4 gap-2">{children}</div>
  );

  const Btn = ({ label, onClick, variant }: { label: string; onClick: ()=>void; variant?: 'op'|'eq'|'warn' }) => (
    <button
      type="button"
      onClick={onClick}
      className={`py-2 rounded text-sm font-medium border shadow-sm select-none ${
        variant === 'eq' ? 'bg-green-600 text-white border-green-600' :
        variant === 'warn' ? 'bg-red-600 text-white border-red-600' :
        variant === 'op' ? 'bg-gray-100 text-gray-900 border-gray-300' : 'bg-white text-gray-900 border-gray-300'
      } hover:opacity-90`}
    >{label}</button>
  );

  return (
    <div className="fixed bottom-4 right-4 z-50 w-72">
      <div className="bg-white border rounded-lg shadow-xl">
        <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50 rounded-t-lg">
          <div className="font-semibold text-sm">Calculatrice</div>
          <button type="button" className="text-gray-600 hover:text-gray-900" onClick={onClose} aria-label="Fermer">✕</button>
        </div>
        <div className="p-3 space-y-3">
          <input
            ref={inputRef}
            value={expr}
            onChange={(e)=>{ setExpr(e.target.value); setError(null); }}
            onKeyDown={onKeyDown}
            placeholder="Saisis une expression (ex: (3+5)*2)"
            className="w-full border rounded px-2 py-2 text-right font-mono"
          />
          {error && <div className="text-xs text-red-600">{error}</div>}
          <div className="space-y-2">
            <Row>
              <Btn label="(" onClick={()=>append('(')} />
              <Btn label=")" onClick={()=>append(')')} />
              <Btn label="%" onClick={()=>append('%')} variant="op" />
              <Btn label="^" onClick={()=>append('^')} variant="op" />
            </Row>
            <Row>
              <Btn label="7" onClick={()=>append('7')} />
              <Btn label="8" onClick={()=>append('8')} />
              <Btn label="9" onClick={()=>append('9')} />
              <Btn label="/" onClick={()=>append('/')} variant="op" />
            </Row>
            <Row>
              <Btn label="4" onClick={()=>append('4')} />
              <Btn label="5" onClick={()=>append('5')} />
              <Btn label="6" onClick={()=>append('6')} />
              <Btn label="*" onClick={()=>append('*')} variant="op" />
            </Row>
            <Row>
              <Btn label="1" onClick={()=>append('1')} />
              <Btn label="2" onClick={()=>append('2')} />
              <Btn label="3" onClick={()=>append('3')} />
              <Btn label="-" onClick={()=>append('-')} variant="op" />
            </Row>
            <Row>
              <Btn label="0" onClick={()=>append('0')} />
              <Btn label="," onClick={()=>append('.')} />
              <Btn label="C" onClick={clear} variant="warn" />
              <Btn label="+" onClick={()=>append('+')} variant="op" />
            </Row>
            <Row>
              <Btn label="⌫" onClick={back} />
              <div />
              <div />
              <Btn label="=" onClick={evaluate} variant="eq" />
            </Row>
          </div>
        </div>
      </div>
    </div>
  );
}
