'use client';

import { useState } from 'react';
import { Button, Input, Modal, Toast } from '@/components/ui';

interface StayProps {
  stay: {
    id?: string;
    _id?: string;
    name: string;
    description: string;
    location: string;
    rating: number;
    ecoLabel: string;
    image?: string;
  };
}

export function EcoStayCard({ stay }: StayProps) {
  const stayId = stay.id || stay._id;

  // Modal and Interactive UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(false);

  // Toast Notifications State
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState<'success' | 'error' | 'info'>('success');

  if (!stayId) {
    console.warn(`Warning: EcoStayCard "${stay.name}" is missing a valid identifier properties.`);
  }

  const showNotification = (message: string, variant: 'success' | 'error' | 'info') => {
    setToastMessage(message);
    setToastVariant(variant);
    setToastVisible(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      showNotification('Please select both Check-In and Check-Out dates.', 'error');
      return;
    }

    setLoading(true);

    const bookingPayload = {
      stay_id: stayId || 'fallback_id',
      stay_name: stay.name,
      check_in: checkIn,
      check_out: checkOut,
      guests: Number(guests),
      user_email: 'akshaydudhe2005@gmail.com', // Explicit targeted account email
    };

    try {
      const response = await fetch('http://localhost:8000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to complete reservation.');
      }

      showNotification('Reservation secured successfully!', 'success');
      setIsModalOpen(false);
      // Reset form fields
      setCheckIn('');
      setCheckOut('');
      setGuests(1);
    } catch (error) {
      console.error('Booking submission error:', error);
      showNotification(error instanceof Error ? error.message : 'Database communication failure.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 bg-white flex flex-col justify-between h-full group">
        <div>
          {/* Card Image Area */}
          <div className="relative overflow-hidden bg-gray-100">
            <img
              src={stay.image || '/placeholder.jpg'}
              alt={stay.name}
              className="w-full h-48 object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
            <span className="absolute top-3 left-3 text-[11px] font-bold uppercase tracking-wider text-white bg-green-600 px-2.5 py-1 rounded-md shadow-sm">
              {stay.ecoLabel}
            </span>
          </div>

          {/* Card Content Details */}
          <div className="p-5">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span className="text-xs uppercase font-semibold tracking-wider text-green-700">
                {stay.location}
              </span>
              <span className="font-medium flex items-center gap-1">⭐ {stay.rating}</span>
            </div>

            <h3 className="font-bold text-lg mt-2 text-gray-950 transition-colors">
              {stay.name}
            </h3>

            <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
              {stay.description}
            </p>

            <div className="mt-5">
              <Button variant="primary" size="md" className="w-full" onClick={() => setIsModalOpen(true)}>
                Book Eco-Stay
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Reusable Booking Interactive Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Book ${stay.name}`}>
        <form onSubmit={handleBookingSubmit} className="space-y-4 mt-2">
          <Input
            label="Check-In Date"
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            disabled={loading}
          />
          <Input
            label="Check-Out Date"
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            disabled={loading}
          />
          <Input
            label="Number of Guests"
            type="number"
            min={1}
            max={10}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            disabled={loading}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" size="md" type="button" onClick={() => setIsModalOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" disabled={loading}>
              {loading ? 'Securing...' : 'Confirm Reservation'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Feedback Toast System */}
      <Toast
        message={toastMessage}
        variant={toastVariant}
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />
    </>
  );
}