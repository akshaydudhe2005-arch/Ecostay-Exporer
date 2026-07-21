'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Modal, Toast } from '@/components/ui';
import { getStoredUser } from '@/lib/api';

interface StayProps {
  stay: {
    id?: string;
    _id?: string;
    name: string;
    description: string;
    location: string;
    rating: number;
    ecoLabel?: string;
    image?: string;
  };
}

export function EcoStayCard({ stay }: StayProps) {
  const router = useRouter();

  // Extract ID gracefully across backend conventions
  const stayId = stay.id || stay._id || 'mock_stay_id';

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(false);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState<'success' | 'error' | 'info'>('success');

  // Token retrieval that checks every common storage key & sanitizes the string
  const getActiveToken = (): string | null => {
    const currentUser = getStoredUser();

    const rawToken =
      currentUser?.token ||
      currentUser?.access_token ||
      currentUser?.jwt ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('ecostay_token');

    if (!rawToken) return null;

    // Clean token string (removes extra quotes or duplicate 'Bearer' prefixes)
    return String(rawToken)
      .replace(/^Bearer\s+/i, '')
      .replace(/["']/g, '')
      .trim();
  };

  const refreshAuthStatus = useCallback(() => {
    const currentUser = getStoredUser();
    const token = getActiveToken();
    setIsAuthenticated(currentUser !== null || token !== null);
  }, []);

  useEffect(() => {
    refreshAuthStatus();
    window.addEventListener('ecostay-auth-change', refreshAuthStatus);
    window.addEventListener('focus', refreshAuthStatus);

    return () => {
      window.removeEventListener('ecostay-auth-change', refreshAuthStatus);
      window.removeEventListener('focus', refreshAuthStatus);
    };
  }, [refreshAuthStatus]);

  const showNotification = (message: string, variant: 'success' | 'error' | 'info') => {
    setToastMessage(message);
    setToastVariant(variant);
    setToastVisible(true);
  };

  const handleBookingTrigger = () => {
    const token = getActiveToken();
    const activeUserSession = getStoredUser();

    if (!activeUserSession && !token) {
      showNotification('Authentication required. Routing to login gateway...', 'info');
      setTimeout(() => {
        router.push('/login');
      }, 1000);
      return;
    }

    setIsModalOpen(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkIn || !checkOut) {
      showNotification('Please select both Check-In and Check-Out dates.', 'error');
      return;
    }

    const token = getActiveToken();
    const currentUser = getStoredUser();
    const userEmail = currentUser?.email || 'studyofakshay@gmail.com';

    if (!token) {
      showNotification('Session token missing. Please log in again.', 'error');
      setIsModalOpen(false);
      router.push('/login');
      return;
    }

    setLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      const response = await fetch(`${baseUrl}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          stay_id: String(stayId),
          stay_name: stay.name || 'EcoStay Homestay',
          check_in: checkIn,
          check_out: checkOut,
          guests: Number(guests),
          user_email: userEmail,
        }),
      });

      let errorData: any = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json();
      }

      // Handle 401 Unauthorized explicitly without throwing red Next.js exception overlays
      if (response.status === 401) {
        // Clear stale session tokens across all storage keys
        localStorage.removeItem('ecostay_user');
        localStorage.removeItem('ecostay_token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('token');

        window.dispatchEvent(new Event('ecostay-auth-change'));
        setIsModalOpen(false);
        showNotification('Invalid or expired authentication token. Please re-login.', 'error');

        setTimeout(() => {
          router.push('/login');
        }, 1200);
        return;
      }

      if (!response.ok) {
        const parsedDetail = errorData?.detail
          ? typeof errorData.detail === 'object'
            ? JSON.stringify(errorData.detail)
            : errorData.detail
          : null;

        throw new Error(parsedDetail || errorData?.message || 'Database validation failed.');
      }

      showNotification('Reservation secured successfully!', 'success');
      setIsModalOpen(false);
      setCheckIn('');
      setCheckOut('');
      setGuests(1);
    } catch (error: any) {
      console.error('Booking Submission Error:', error);
      showNotification(error.message || 'Database communication failure.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex h-[430px] w-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
        <div className="relative h-48 shrink-0 overflow-hidden bg-gray-100 dark:bg-neutral-800">
          <img
            src={stay.image || '/placeholder.jpg'}
            alt={stay.name}
            className="h-full w-full cursor-zoom-in object-cover transition-transform duration-500 ease-out hover:scale-110"
          />
          {stay.ecoLabel && (
            <span className="absolute top-3 left-3 z-10 rounded-md bg-green-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
              {stay.ecoLabel}
            </span>
          )}
        </div>

        <div className="flex flex-grow flex-col justify-between p-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span className="text-xs font-semibold uppercase tracking-wider text-green-700 dark:text-emerald-500">
                {stay.location}
              </span>
              <span className="flex items-center gap-1 font-medium dark:text-neutral-300">
                ⭐ {stay.rating}
              </span>
            </div>
            <h3 className="line-clamp-1 text-lg font-bold text-gray-950 dark:text-white">
              {stay.name}
            </h3>
            <p className="line-clamp-2 min-h-[40px] text-sm text-gray-500 dark:text-neutral-400">
              {stay.description}
            </p>
          </div>

          <div className="mt-auto pt-2">
            <Button variant="primary" size="md" className="w-full" onClick={handleBookingTrigger}>
              Book Eco-Stay
            </Button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Book ${stay.name || 'Your Eco-Stay'}`}
      >
        <form onSubmit={handleBookingSubmit} className="mt-2 space-y-4">
          <Input
            label="Check-In"
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            disabled={loading}
          />
          <Input
            label="Check-Out"
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            disabled={loading}
          />
          <Input
            label="Guests"
            type="number"
            min={1}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            disabled={loading}
          />
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-neutral-800">
            <Button
              variant="secondary"
              size="md"
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'Confirm Reservation'}
            </Button>
          </div>
        </form>
      </Modal>

      <Toast
        message={toastMessage}
        variant={toastVariant}
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />
    </>
  );
}