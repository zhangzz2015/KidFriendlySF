import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import LocationMarker from './LocationMarker';
import type { Location } from '../types/location';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  locations: Location[];
  activeFilters: Set<string>;
  onCenterMapRef: (centerMap: () => void) => void;
}

// Component to handle map centering
function MapController({ onCenterMapRef }: { onCenterMapRef: (centerMap: () => void) => void }) {
  const map = useMap();
  
  useEffect(() => {
    const centerMap = () => {
      map.setView([37.7749, -122.4194], 12);
    };
    onCenterMapRef(centerMap);
  }, [map, onCenterMapRef]);

  return null;
}

export default function MapView({ locations, activeFilters, onCenterMapRef }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);

  // Filter locations based on active filters
  const visibleLocations = locations.filter(location => 
    activeFilters.has(location.type)
  );

  return (
    <div className="flex-1 relative">
      <MapContainer
        center={[37.7749, -122.4194]}
        zoom={12}
        className="h-full w-full"
        ref={mapRef}
        maxBounds={[
          [37.70, -122.55], // Southwest
          [37.85, -122.30]  // Northeast
        ]}
        maxBoundsViscosity={1.0}
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={18}
        />
        
        <MapController onCenterMapRef={onCenterMapRef} />
        
        {/* Render location markers */}
        {visibleLocations.map((location) => (
          <LocationMarker 
            key={location.id} 
            location={location} 
          />
        ))}
      </MapContainer>

      {/* Status Bar */}
      <div className="absolute bottom-4 left-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg p-3 lg:left-auto lg:w-80">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-600">
              <i className="fas fa-map-marker-alt mr-1 text-blue-600" />
              <span>{locations.length} locations</span>
            </div>
            <div className="flex items-center text-gray-600">
              <i className="fas fa-eye mr-1 text-green-600" />
              <span>{visibleLocations.length} visible</span>
            </div>
          </div>
          <div className="flex items-center text-green-600">
            <i className="fas fa-wifi mr-1" />
            <span className="text-xs">Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
