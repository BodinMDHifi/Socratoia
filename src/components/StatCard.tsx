import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  accent?: 'blue' | 'green' | 'purple' | 'amber';
  helper?: string;
}

const accentMap: Record<string, string> = {
  blue: 'from-school-500/90 to-school-400/70 text-white',
  green: 'from-emerald-500/90 to-emerald-400/70 text-white',
  purple: 'from-fuchsia-500/90 to-fuchsia-400/70 text-white',
  amber: 'from-amber-500/90 to-amber-400/70 text-white',
};

export default function StatCard({ label, value, icon, accent='blue', helper }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/70 bg-gradient-to-br shadow-sm backdrop-blur-sm group">
      <div className={`absolute inset-0 bg-gradient-to-br ${accentMap[accent]} opacity-90`} />
      <div className="relative p-4 flex flex-col gap-2 min-h-[110px]">
        <div className="flex items-start justify-between">
          <span className="text-xs uppercase tracking-wide font-semibold opacity-90">{label}</span>
          {icon && <span className="text-lg opacity-90">{icon}</span>}
        </div>
        <div className="text-3xl font-bold leading-none drop-shadow-sm">{value}</div>
        {helper && <div className="mt-auto text-[11px] opacity-90 font-medium">{helper}</div>}
      </div>
      <div className="pointer-events-none absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10 group-hover:scale-110 transition-transform" />
    </div>
  );
}
