import { MapPin } from 'lucide-react';
import { formatShippingRoute } from '@/models/procurement.model';

interface RouteDisplayProps {
  origin?: string;
  destination?: string;
  className?: string;
}

/**
 * Reusable component to display shipping route with icon
 */
export function RouteDisplay({ origin, destination, className = '' }: RouteDisplayProps) {
  const route = formatShippingRoute(origin, destination);
  
  if (route === '-') {
    return <span className={`text-gray-400 ${className}`}>-</span>;
  }
  
  return (
    <span className={`flex items-center gap-1 ${className}`}>
      <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
      <span>{route}</span>
    </span>
  );
}
