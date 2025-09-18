export default function RewardsWidget({ badges }: { badges: { name: string; description: string; icon: string }[] }) {
  return (
    <div className="card p-5 space-y-4">
      <h3 className="text-lg font-semibold section-title">Récompenses</h3>
      <ul className="space-y-3">
        {badges.length === 0 && (
          <li className="text-sm text-gray-500">Aucun badge obtenu pour le moment.</li>
        )}
        {badges.map((b, idx) => (
          <li key={idx} className="flex items-center gap-4 text-sm rounded-lg p-3 bg-gradient-to-r from-amber-50 to-white border border-amber-100/70">
            <span className="text-2xl drop-shadow-sm">{b.icon}</span>
            <div>
              <div className="font-medium text-board">{b.name}</div>
              <div className="text-gray-600 text-[13px] leading-snug">{b.description}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
