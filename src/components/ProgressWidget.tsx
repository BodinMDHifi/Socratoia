export default function ProgressWidget({ items }: { items: { level: string; topic: string; completed: number }[] }) {
  return (
    <div className="card p-5 space-y-4">
      <h3 className="text-lg font-semibold section-title">Progression</h3>
      <ul className="space-y-2">
        {items.length === 0 && (
          <li className="text-sm text-gray-500">Aucune progression enregistrée pour l'instant.</li>
        )}
        {items.map((p, idx) => (
          <li key={idx} className="flex items-center gap-3">
            <div className="flex flex-col text-[11px] font-medium w-32">
              <span className="text-school-700">{p.level}</span>
              <span className="text-gray-500">{p.topic}</span>
            </div>
            <div className="flex-1 h-2 bg-school-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-school-500 to-school-400" style={{width: `${Math.min(100,p.completed)}%`}} />
            </div>
            <span className="text-sm font-semibold w-10 text-right">{p.completed}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
