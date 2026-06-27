export interface EcoStay {
  id: number;
  title: string;
  description: string;
  image: string;
  location: string;
  rating: number;
  badge: string;
}

export const ecoStays: EcoStay[] = [
  {
    id: 1,
    title: 'Forest Canopy Retreat',
    description:
      'Wake up among ancient trees in a solar-powered treehouse with rainwater harvesting and zero-waste dining.',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
    location: 'Pacific Northwest, USA',
    rating: 4.9,
    badge: 'Carbon Neutral',
  },
  {
    id: 2,
    title: 'Bamboo Valley Lodge',
    description:
      'Sustainable bamboo architecture nestled in terraced rice fields, powered entirely by renewable energy.',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80',
    location: 'Bali, Indonesia',
    rating: 4.8,
    badge: 'Solar Powered',
  },
  {
    id: 3,
    title: 'Alpine Eco Chalet',
    description:
      'A cozy mountain escape with geothermal heating, organic farm-to-table meals, and wildlife conservation tours.',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    location: 'Swiss Alps',
    rating: 4.7,
    badge: 'Wildlife Safe',
  },
];

export interface Reservation {
  id: string;
  guest: string;
  stay: string;
  checkIn: string;
  status: 'Confirmed' | 'Pending' | 'Checked In';
}

export const upcomingReservations: Reservation[] = [
  {
    id: 'RSV-1042',
    guest: 'Ava Mitchell',
    stay: 'Forest Canopy Retreat',
    checkIn: 'Jun 28, 2026',
    status: 'Confirmed',
  },
  {
    id: 'RSV-1043',
    guest: 'Leo Fernandez',
    stay: 'Bamboo Valley Lodge',
    checkIn: 'Jul 02, 2026',
    status: 'Pending',
  },
  {
    id: 'RSV-1044',
    guest: 'Maya Chen',
    stay: 'Alpine Eco Chalet',
    checkIn: 'Jul 09, 2026',
    status: 'Checked In',
  },
];
