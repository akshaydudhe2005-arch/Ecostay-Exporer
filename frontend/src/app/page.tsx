import { EcoStayCard } from '@/components/EcoStayCard';
import { NavButtonLink } from '@/components/NavButtonLink';
import { fetchStaysServer } from '@/lib/server-api';

export default async function HomePage() {
  const stays = await fetchStaysServer();

  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-700 px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&q=80')] bg-cover bg-center opacity-20" />
        <div className="relative mx-auto flex w-full max-w-7xl flex-col items-start gap-6 md:max-w-4xl lg:max-w-7xl">
          <span className="rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-widest backdrop-blur-sm">
            Sustainable Travel Platform
          </span>
          <h1 className="max-w-2xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            Discover eco-stays that protect the planet you love
          </h1>
          <p className="max-w-xl text-base text-emerald-50 sm:text-lg">
            Book verified green accommodations, track your carbon savings, and earn
            rewards for responsible travel choices.
          </p>
          <div className="flex flex-wrap gap-3">
            <NavButtonLink href="/dashboard" label="Explore Dashboard" variant="primary" />
            <NavButtonLink href="/about" label="Our Mission" variant="secondary" />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
            Featured Eco-Accommodations
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600 dark:text-gray-400">
            Hand-picked nature retreats with premium photography, eco-certifications, and
            community impact badges.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {stays.map((stay) => (
            <EcoStayCard key={stay.id} stay={stay} />
          ))}
        </div>
      </section>
    </main>
  );
}
