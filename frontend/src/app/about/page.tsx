import { PageButtonLink } from '@/components/PageButtonLink';

const missionFeatures = [
  {
    title: 'Carbon-Conscious Booking',
    description:
      'Every listing is vetted for renewable energy use, waste reduction, and measurable carbon offset programs.',
    icon: '🌱',
  },
  {
    title: 'Community-Led Conservation',
    description:
      'A portion of each booking funds local habitat restoration, wildlife protection, and indigenous-led eco-tourism.',
    icon: '🤝',
  },
  {
    title: 'Transparent Impact Tracking',
    description:
      'Your dashboard shows real-time metrics for carbon saved, eco-stays hosted, and sustainability reward badges earned.',
    icon: '📊',
  },
  {
    title: 'Zero-Greenwashing Policy',
    description:
      'We audit accommodations annually and remove listings that fail to meet our strict environmental standards.',
    icon: '✅',
  },
];

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-12 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          Our Green Mission
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100 sm:text-4xl">
          Travel beautifully. Leave nothing behind.
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          EcoStay Explorer connects conscious travelers with verified sustainable
          accommodations — making responsible tourism accessible, transparent, and rewarding.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {missionFeatures.map((feature) => (
          <article
            key={feature.title}
            className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-2xl dark:bg-emerald-950">
              {feature.icon}
            </span>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {feature.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        <PageButtonLink href="/dashboard" label="View Impact Dashboard" variant="primary" />
        <PageButtonLink href="/showcase" label="UI Component Showcase" variant="secondary" />
      </div>
    </main>
  );
}
