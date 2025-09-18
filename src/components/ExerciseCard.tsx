import Link from 'next/link';

export default function ExerciseCard({ ex }: { ex: { id: number; title: string; description: string; level: string; topic: string } }) {
  return (
    <div className="card p-5 flex flex-col gap-3 group">
      <div className="flex items-center gap-2 text-[11px] font-medium text-school-700">
        <span className="badge-soft bg-white">{ex.level}</span>
        <span className="badge-soft bg-white">{ex.topic}</span>
      </div>
      <h3 className="text-lg font-semibold leading-snug group-hover:text-school-700 transition-colors">{ex.title}</h3>
      <p className="text-sm text-gray-600 flex-grow">{ex.description}</p>
      <Link className="btn-outline mt-auto self-start" href={`/exercise/${ex.id}`}>
        Ouvrir
      </Link>
    </div>
  );
}
