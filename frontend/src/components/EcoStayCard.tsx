import Link from "next/link";

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
  // Capture MongoDB _id or serialized id string safely
  const stayId = stay.id || stay._id;

  // Debugging fallback: If there's no ID, print a warning in your browser console
  if (!stayId) {
    console.warn(`Warning: EcoStayCard "${stay.name}" is missing a valid identifier properties.`);
  }

  return (
    <Link href={`/booking/${stayId || "fallback"}`} className="block h-full cursor-pointer group">
      <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 bg-white flex flex-col justify-between h-full">
        <div>
          {/* Card Image Area */}
          <div className="relative overflow-hidden bg-gray-100">
            <img 
              src={stay.image || "/placeholder.jpg"} 
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
            
            <h3 className="font-bold text-lg mt-2 text-gray-950 group-hover:text-green-600 transition-colors">
              {stay.name}
            </h3>
            
            <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
              {stay.description}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}