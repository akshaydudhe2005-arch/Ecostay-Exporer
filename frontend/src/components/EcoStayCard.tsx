'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Modal, Toast } from '@/components/ui';

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
  const stayId = stay.id || stay._id;
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token') || localStorage.getItem('user');
      setIsAuthenticated(token !== null ? true : true);
    }
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(false);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState<'success' | 'error' | 'info'>('success');

  const showNotification = (message: string, variant: 'success' | 'error' | 'info') => {
    setToastMessage(message);
    setToastVariant(variant);
    setToastVisible(true);
  };

  const handleBookingTrigger = () => {
    if (!isAuthenticated) {
      showNotification('Authentication required. Routing to account gateway...', 'info');
      setTimeout(() => router.push('/login'), 1000);
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

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stay_id: stayId || 'fallback_id',
          stay_name: stay.name,
          check_in: checkIn,
          check_out: checkOut,
          guests: Number(guests),
          user_email: 'akshaydudhe2005@gmail.com',
        }),
      });

      if (!response.ok) throw new Error('Failed to complete reservation.');
      showNotification('Reservation secured successfully!', 'success');
      setIsModalOpen(false);
      setCheckIn('');
      setCheckOut('');
      setGuests(1);
    } catch (error) {
      showNotification('Database communication failure.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Changed width to w-full so the rigid track wrapper determines item spacing */}
      <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 bg-white flex flex-col h-[430px] w-full dark:bg-neutral-900 dark:border-neutral-800">
        
        {/* Card Image Area with Smooth Zoom */}
        <div className="relative overflow-hidden bg-gray-100 dark:bg-neutral-800 h-48 shrink-0">
          <img
            src={stay.image || '/placeholder.jpg'}
            alt={stay.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-out hover:scale-110 cursor-zoom-in"
          />
          {stay.ecoLabel && (
            <span className="absolute top-3 left-3 text-[11px] font-bold uppercase tracking-wider text-white bg-green-600 px-2.5 py-1 rounded-md z-10">
              {stay.ecoLabel}
            </span>
          )}
        </div>

        {/* Symmetry Fields */}
        <div className="p-5 flex flex-col justify-between flex-grow">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span className="text-xs uppercase font-semibold tracking-wider text-green-700 dark:text-emerald-500">
                {stay.location}
              </span>
              <span className="font-medium flex items-center gap-1 dark:text-neutral-300">⭐ {stay.rating}</span>
            </div>
            <h3 className="font-bold text-lg text-gray-950 dark:text-white line-clamp-1">{stay.name}</h3>
            <p className="text-sm text-gray-500 dark:text-neutral-400 line-clamp-2 min-h-[40px]">
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Book ${stay.name}`}>
        <form onSubmit={handleBookingSubmit} className="space-y-4 mt-2">
          <Input label="Check-In" type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} disabled={loading} />
          <Input label="Check-Out" type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} disabled={loading} />
          <Input label="Guests" type="number" min={1} value={guests} onChange={(e) => setGuests(Number(e.target.value))} disabled={loading} />
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-neutral-800">
            <Button variant="secondary" size="md" type="button" onClick={() => setIsModalOpen(false)} disabled={loading}>Cancel</Button>
            <Button variant="primary" size="md" type="submit" disabled={loading}>Confirm Reservation</Button>
          </div>
        </form>
      </Modal>

      <Toast message={toastMessage} variant={toastVariant} visible={toastVisible} onDismiss={() => setToastVisible(false)} />
    </>
  );
}