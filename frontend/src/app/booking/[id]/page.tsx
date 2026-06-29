"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface StayDetails {
  id: string;
  name: string;
  description: string;
  location: string;
  rating: number;
  ecoLabel: string;
  image?: string;
}

export default function BookingPage() {
  const params = useParams();
  const id = params?.id as string;

  const [stay, setStay] = useState<StayDetails | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Reservation Form States
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:8000/api/stays/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Stay not found");
        return res.json();
      })
      .then((data) => {
        setStay(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading stay data:", err);
        setLoading(false);
      });
  }, [id]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIn || !checkOut || !email) {
      alert("Please fill out all booking fields.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("http://localhost:8000/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stay_id: id,
          stay_name: stay?.name || "Eco Stay",
          check_in: checkIn,
          check_out: checkOut,
          guests: Number(guests),
          user_email: email,
        }),
      });

      if (response.ok) {
        setIsBooked(true);
      } else {
        const errData = await response.json();
        alert(`Booking failed: ${errData.detail || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Network error submitting booking:", error);
      alert("Server connection failed. Make sure your backend is up.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center p-12 text-gray-600 font-medium">Gathering eco-stay details...</div>;
  if (!stay) return <div className="text-center p-12 text-red-500 font-semibold">Eco-stay profile could not be located.</div>;

  // Render a clean success layout when reservation completes
  if (isBooked) {
    return (
      <div className="max-w-md mx-auto mt-16 p-8 bg-white border border-gray-100 rounded-2xl shadow-xl text-center space-y-4">
        <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-sm">
          ✓
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Pack Your Bags!</h2>
        <p className="text-gray-600 text-sm">
          Your sustainable getaway at <span className="font-semibold text-gray-900">{stay.name}</span> has been confirmed. Confirmation details have been sent to <span className="font-medium text-green-700">{email}</span>.
        </p>
        <div className="pt-4">
          <Link href="/">
            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-xl transition shadow-sm">
              Return to Discovery Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 min-h-screen bg-gray-50/50 mt-6 rounded-xl">
      <h1 className="text-3xl font-bold text-gray-900">{stay.name}</h1>
      <p className="text-green-700 font-semibold mt-1 uppercase tracking-wider text-sm">
        🌿 {stay.ecoLabel} • {stay.location}
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <img src={stay.image || "/placeholder.jpg"} alt={stay.name} className="w-full h-96 object-cover rounded-2xl shadow-sm" />
          <h2 className="text-xl font-bold text-gray-800 mt-4">About this eco-stay</h2>
          <p className="text-gray-600 leading-relaxed text-justify">{stay.description}</p>
        </div>

        {/* Dynamic Reservation Submission Box */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm h-fit sticky top-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Reservation</h3>
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500">Contact Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@domain.com"
                className="w-full mt-1 border rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none text-gray-700 text-sm" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500">Check-in Date</label>
              <input 
                type="date" 
                required
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full mt-1 border rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none text-gray-700 text-sm" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500">Check-out Date</label>
              <input 
                type="date" 
                required
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full mt-1 border rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none text-gray-700 text-sm" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500">Number of Guests</label>
              <select 
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full mt-1 border rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none text-gray-700 bg-white text-sm"
              >
                <option value={1}>1 Guest</option>
                <option value={2}>2 Guests</option>
                <option value={3}>3 Guests</option>
              </select>
            </div>
            
            <div className="pt-2 border-t mt-4">
              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-xl transition shadow-sm hover:shadow"
              >
                {submitting ? "Processing Reservation..." : "Confirm Booking"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}