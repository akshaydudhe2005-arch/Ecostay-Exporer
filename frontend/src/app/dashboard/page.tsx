'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // 1. Added Next.js routing hook
import { Button, Input, Loader, Modal, Toast } from '@/components/ui';
import {
  api,
  getStoredUser,
  type AIMetrics,
  type Reservation,
  type StoredUser,
} from '@/lib/api';

// Extended interface securely passing the original database identifier
interface ExtendedReservation extends Reservation {
  dbId: string;
}

const sidebarLinks = [
  { href: '/dashboard', label: 'Overview', active: true },
  { href: '/showcase', label: 'Components', active: false },
  { href: '/about', label: 'Mission', active: false },
  { href: '/login', label: 'Account', active: false },
];

const initialEmptyMetrics: AIMetrics = {
  carbonSaved: '0.0t',
  ecoStaysHosted: '0',
  rewardBadges: '0',
  carbonSavedDetail: 'CO₂ offset this quarter',
  ecoStaysDetail: 'Verified green listings',
  rewardBadgesDetail: 'Sustainability achievements',
  quarterlyReport: 'No live bookings found for your account yet.',
  metrics: [
    {
      label: 'Carbon Saved',
      value: '0.0t',
      detail: 'CO₂ offset this quarter',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      label: 'Eco-Stays Hosted',
      value: '0',
      detail: 'Verified green listings',
      color: 'from-green-500 to-emerald-600',
    },
    {
      label: 'Reward Badges',
      value: '0',
      detail: 'Sustainability achievements',
      color: 'from-lime-500 to-green-600',
    },
  ],
};

export default function DashboardPage() {
  const router = useRouter(); // 2. Initialized the router instance
  const [user, setUser] = useState<StoredUser | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<ExtendedReservation | null>(null);
  const [isImpactModalOpen, setIsImpactModalOpen] = useState(false);
  const [reservations, setReservations] = useState<ExtendedReservation[]>([]);
  const [metricsData, setMetricsData] = useState<AIMetrics>(initialEmptyMetrics);
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState<'connected' | 'fallback' | 'checking'>('checking');
  const [aiPrompt, setAiPrompt] = useState('How can I reduce my travel carbon footprint?');
  const [aiResult, setAiResult] = useState('');
  const [aiSource, setAiSource] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('error');

  // Automatically dismiss toast alerts after 4 seconds
  useEffect(() => {
    if (toastVisible) {
      const timer = setTimeout(() => setToastVisible(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastVisible]);

  // Isolate database compilation logic so it can be re-triggered cleanly on mutations
  const loadDashboardData = async (currentUser: StoredUser, isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      await api.health();
      const res = await fetch(`http://localhost:8000/api/bookings/user/${currentUser.email}`);
      if (!res.ok) throw new Error("Database interface rejection");
      
      const rawBookings = await res.json();

      const dynamicReservations: ExtendedReservation[] = rawBookings.map((item: any) => {
        const structuralId = item.id || item._id || '';
        return {
          id: `RSV-${String(structuralId).slice(-5).toUpperCase()}`,
          dbId: structuralId, // Retain original primary key for updates/deletes
          guest: currentUser.name || "Akshay Dudhe",
          stay: item.stay_name || "Eco Stay Location",
          checkIn: item.check_in || "N/A",
          status: "Confirmed"
        };
      });

      const liveCarbonCalculated = (dynamicReservations.length * 0.4).toFixed(1) + "t";
      const liveStaysCalculated = dynamicReservations.length.toString();
      const liveBadgesCalculated = dynamicReservations.length > 0 ? (dynamicReservations.length + 1).toString() : "0";

      const dynamicMetrics: AIMetrics = {
        carbonSaved: liveCarbonCalculated,
        ecoStaysHosted: liveStaysCalculated,
        rewardBadges: liveBadgesCalculated,
        carbonSavedDetail: 'CO₂ offset this quarter',
        ecoStaysDetail: 'Verified green listings',
        rewardBadgesDetail: 'Sustainability achievements',
        quarterlyReport: `Your account has offset ${liveCarbonCalculated} of CO₂ this quarter through ${liveStaysCalculated} verified eco-stay bookings.`,
        metrics: [
          { label: 'Carbon Saved', value: liveCarbonCalculated, detail: 'CO₂ offset this quarter', color: 'from-emerald-500 to-teal-600' },
          { label: 'Eco-Stays Hosted', value: liveStaysCalculated, detail: 'Verified green listings', color: 'from-green-500 to-emerald-600' },
          { label: 'Reward Badges', value: liveBadgesCalculated, detail: 'Sustainability achievements', color: 'from-lime-500 to-green-600' },
        ],
      };

      // GUARANTEED FIX: Since data successfully loaded from the backend, force the badge to Connected
      setBackendStatus('connected');
      
      setReservations(dynamicReservations);
      setMetricsData(dynamicMetrics);
    } catch (err) {
      console.error("Failed to compile real-time telemetry:", err);
      setBackendStatus('fallback');
      setReservations([]);
      setMetricsData(initialEmptyMetrics);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    const currentUser = getStoredUser();

    // 3. CRITICAL INTERCEPTION: If credentials don't exist, kick the user back out immediately
    if (!currentUser || !currentUser.email) {
      router.push('/login?redirect=/dashboard');
      return;
    }

    setUser(currentUser);
    loadDashboardData(currentUser);
  }, [router]);

  // CRUD Operation: UPDATE
  const handleModifyBooking = async (dbId: string) => {
    const newDate = prompt("Enter a new Check-In Date (YYYY-MM-DD):", "2026-08-15");
    if (!newDate) return;

    try {
      let response = await fetch(`http://localhost:8000/api/bookings/${dbId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ check_in: newDate }),
      });

      if (!response.ok) {
        response = await fetch(`http://localhost:8000/api/bookings/${dbId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ check_in: newDate }),
        });
      }

      if (!response.ok) {
        response = await fetch(`http://localhost:8000/api/bookings/${dbId}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ check_in: newDate }),
        });
      }

      if (!response.ok) throw new Error("Could not update the transaction documents");

      setToastVariant('success');
      setToastMessage('Booking date adjusted successfully!');
      setToastVisible(true);
      
      if (user) loadDashboardData(user, true);
    } catch (err) {
      setToastVariant('error');
      setToastMessage(err instanceof Error ? err.message : 'Modification failed');
      setToastVisible(true);
    }
  };

  // CRUD Operation: DELETE
  const handleCancelBooking = async (dbId: string) => {
    if (!confirm("Are you sure you want to completely remove this reservation from the cluster database?")) return;

    try {
      let response = await fetch(`http://localhost:8000/api/bookings/${dbId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        response = await fetch(`http://localhost:8000/api/bookings/${dbId}/`, {
          method: 'DELETE',
        });
      }

      if (!response.ok) throw new Error("Database rejection on record drop");

      setToastVariant('success');
      setToastMessage('Reservation purged successfully!');
      setToastVisible(true);

      if (user) loadDashboardData(user, true);
    } catch (err) {
      setToastVariant('error');
      setToastMessage(err instanceof Error ? err.message : 'Deletion failed');
      setToastVisible(true);
    }
  };

  const runAiAnalysis = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiResult('');
    try {
      const result = await api.analyzeSustainability(aiPrompt.trim());
      setAiResult(result.analysis);
      setAiSource(result.source === 'gemini' ? 'Powered by Gemini AI' : 'EcoStay smart insights');
    } catch (err) {
      setToastVariant('error');
      setToastMessage(err instanceof Error ? err.message : 'Analysis failed');
      setToastVisible(true);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 lg:flex-row lg:px-8">
      <aside className="w-full shrink-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:w-64">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
          Navigation
        </h2>
        <nav aria-label="Dashboard sidebar">
          <ul className="flex flex-row flex-wrap gap-2 lg:flex-col">
            {sidebarLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    link.active
                      ? 'bg-emerald-600 text-white'
                      : 'text-gray-700 hover:bg-emerald-50 dark:text-gray-300 dark:hover:bg-emerald-950'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-6 rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">API Status</p>
          <p
            className={`mt-1 text-sm font-medium ${
              backendStatus === 'connected'
                ? 'text-emerald-600'
                : backendStatus === 'fallback'
                  ? 'text-amber-600'
                  : 'text-gray-500'
            }`}
          >
            {backendStatus === 'checking' && 'Checking...'}
            {backendStatus === 'connected' && '● Live Data Verified'}
            {backendStatus === 'fallback' && '● Connection Fallback'}
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
              Impact Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Logged in account: <span className="text-emerald-600 font-semibold">{user?.email || 'Loading...'}</span>
            </p>
          </div>
          <Button variant="primary" size="md" onClick={() => setIsImpactModalOpen(true)}>
            View Impact Report
          </Button>
        </header>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader label="Loading real-time account telemetry..." size="md" />
          </div>
        ) : (
          <>
            <section
              aria-label="Environmental impact metrics"
              className="grid grid-cols-1 gap-4 sm:grid-cols-3"
            >
              {metricsData.metrics.map((metric) => (
                <article
                  key={metric.label}
                  className={`flex aspect-square flex-col justify-between rounded-2xl bg-gradient-to-br ${metric.color} p-5 text-white shadow-md`}
                >
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
                    {metric.label}
                  </p>
                  <p className="text-4xl font-bold">{metric.value}</p>
                  <p className="text-sm text-white/90">{metric.detail}</p>
                </article>
              ))}
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                AI Sustainability Advisor
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Ask about eco-travel, carbon offsets, or green accommodation choices.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Input
                  label="Your question"
                  type="text"
                  placeholder="How can I travel more sustainably?"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="flex-1"
                />
                <div className="flex items-end">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={runAiAnalysis}
                    disabled={aiLoading}
                    className="w-full sm:w-auto"
                  >
                    {aiLoading ? 'Analyzing...' : 'Get Insight'}
                  </Button>
                </div>
              </div>
              {aiLoading && (
                <div className="mt-4 flex justify-center py-4">
                  <Loader label="Generating insight..." size="sm" />
                </div>
              )}
              {aiResult && !aiLoading && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    {aiSource}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                    {aiResult}
                  </p>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Upcoming Reservations
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                    <tr>
                      <th className="px-5 py-3 font-semibold">ID</th>
                      <th className="px-5 py-3 font-semibold">Guest</th>
                      <th className="px-5 py-3 font-semibold">Eco-Stay</th>
                      <th className="px-5 py-3 font-semibold">Check-In</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 font-semibold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {reservations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400 font-medium">
                          No active upcoming reservations found linked to this account database profile.
                        </td>
                      </tr>
                    ) : (
                      reservations.map((reservation) => (
                        <tr key={reservation.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                          <td className="px-5 py-4 font-mono text-xs text-gray-600 dark:text-gray-400">
                            {reservation.id}
                          </td>
                          <td className="px-5 py-4 font-medium text-gray-900 dark:text-gray-100">
                            {reservation.guest}
                          </td>
                          <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                            {reservation.stay}
                          </td>
                          <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                            {reservation.checkIn}
                          </td>
                          <td className="px-5 py-4">
                            <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 text-xs font-semibold">
                              {reservation.status}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setSelectedReservation(reservation)}
                              >
                                Details
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleModifyBooking(reservation.dbId)}
                                className="border-amber-500 text-amber-600 hover:bg-amber-50"
                              >
                                Modify
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleCancelBooking(reservation.dbId)}
                                className="border-red-500 text-red-600 hover:bg-red-50"
                              >
                                Cancel
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>

      <Modal
        isOpen={isImpactModalOpen}
        onClose={() => setIsImpactModalOpen(false)}
        title="Quarterly Impact Report"
      >
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">{metricsData.quarterlyReport}</p>
        <Button variant="primary" size="md" onClick={() => setIsImpactModalOpen(false)}>
          Close Report
        </Button>
      </Modal>

      <Modal
        isOpen={selectedReservation !== null}
        onClose={() => setSelectedReservation(null)}
        title="Reservation Details"
      >
        {selectedReservation && (
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500 dark:text-gray-400">Reservation ID</dt>
              <dd className="font-mono font-medium text-gray-900 dark:text-gray-100">{selectedReservation.id}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500 dark:text-gray-400">Guest</dt>
              <dd className="font-medium text-gray-900 dark:text-gray-100">{selectedReservation.guest}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500 dark:text-gray-400">Eco-Stay</dt>
              <dd className="font-medium text-gray-900 dark:text-gray-100">{selectedReservation.stay}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500 dark:text-gray-400">Check-In</dt>
              <dd className="font-medium text-gray-900 dark:text-gray-100">{selectedReservation.checkIn}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500 dark:text-gray-400">Status</dt>
              <dd className="font-medium text-gray-900 dark:text-gray-100">{selectedReservation.status}</dd>
            </div>
          </dl>
        )}
        <div className="mt-6">
          <Button variant="primary" size="md" onClick={() => setSelectedReservation(null)}>
            Close
          </Button>
        </div>
      </Modal>

      <Toast
        message={toastMessage}
        variant={toastVariant}
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />
    </main>
  );
}