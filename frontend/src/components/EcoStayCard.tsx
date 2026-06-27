import Image from 'next/image';
import type { EcoStay } from '@/data/ecoStays';

/**
 * @interface EcoStayCardProps
 * @property {EcoStay} stay - Eco-accommodation data rendered in the card.
 */

export interface EcoStayCardProps {
  stay: EcoStay;
}

export function EcoStayCard({ stay }: EcoStayCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-md transition-shadow hover:shadow-xl dark:border-emerald-900/40 dark:bg-gray-800">
      <div className="relative h-52 w-full overflow-hidden">
        <Image
          src={stay.image}
          alt={stay.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1440px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-emerald-600/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          {stay.badge}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{stay.title}</h3>
          <span className="shrink-0 rounded-md bg-emerald-50 px-2 py-0.5 text-sm font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            ★ {stay.rating}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{stay.description}</p>
        <p className="mt-auto text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          {stay.location}
        </p>
      </div>
    </article>
  );
}
