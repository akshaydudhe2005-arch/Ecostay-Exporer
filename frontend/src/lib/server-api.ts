import { ecoStays, type EcoStay } from '@/data/ecoStays';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export async function fetchStaysServer(): Promise<EcoStay[]> {
  try {
    const response = await fetch(`${API_BASE}/api/stays`, {
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    if (!response.ok) return ecoStays;
    return (await response.json()) as EcoStay[];
  } catch {
    return ecoStays;
  }
}
