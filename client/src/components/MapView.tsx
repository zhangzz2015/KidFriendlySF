import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Location } from '../types/location';
import { LOCATION_TYPES } from '../types/location';

interface MapViewProps {
  locations: Location[];
  activeFilters: Set<string>;
  onCenterMapRef: (centerMap: () => void) => void;
}

export default function MapView({ locations, activeFilters, onCenterMapRef }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup>(new L.LayerGroup());

  // Filter locations based on active filters
  const visibleLocations = locations.filter(location => 
    activeFilters.has(location.type)
  );

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create map instance
    const map = L.map(mapRef.current, {
      center: [37.7749, -122.4194],
      zoom: 12,
      maxBounds: [
        [37.70, -122.55], // Southwest
        [37.85, -122.30]  // Northeast
      ],
      maxBoundsViscosity: 1.0
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18
    }).addTo(map);

    // Add markers layer group
    markersRef.current.addTo(map);

    // Set up center map function
    const centerMap = () => {
      map.setView([37.7749, -122.4194], 12);
    };
    onCenterMapRef(centerMap);

    mapInstanceRef.current = map;

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [onCenterMapRef]);

  // Update markers when locations or filters change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.clearLayers();

    // Add new markers
    visibleLocations.forEach((location) => {
      const config = LOCATION_TYPES[location.type];
      
      // Create custom icon
      const customIcon = L.divIcon({
        html: `
          <div style="
            background-color: ${config.color};
            border: 3px solid white;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">
            <i class="${config.icon}" style="color: white; font-size: 14px;"></i>
          </div>
        `,
        className: 'custom-div-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
      });

      // Create marker
      const marker = L.marker([location.latitude, location.longitude], {
        icon: customIcon
      });

      // Create popup content
      const popupContent = `
        <div style="padding: 8px; min-width: 200px;">
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <i class="${config.icon}" style="color: ${config.color}; margin-right: 8px;"></i>
            <h3 style="margin: 0; font-weight: 600; color: #1f2937;">${location.name}</h3>
          </div>
          
          ${location.address ? `
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">
              <i class="fas fa-map-marker-alt" style="margin-right: 4px;"></i>
              ${location.address}
            </p>
          ` : ''}
          
          <div style="font-size: 12px; color: #9ca3af;">
            <div><strong>Type:</strong> ${config.name.slice(0, -1)}</div>
            
            ${location.openingHours ? `
              <div><strong>Hours:</strong> ${location.openingHours}</div>
            ` : ''}
            
            ${location.phone ? `
              <div><strong>Phone:</strong> ${location.phone}</div>
            ` : ''}
            
            ${location.website ? `
              <div style="margin-top: 4px;">
                <a href="${location.website}" target="_blank" rel="noopener noreferrer" 
                   style="color: #2563eb; text-decoration: none;">
                  <i class="fas fa-external-link-alt" style="margin-right: 4px;"></i>
                  Visit Website
                </a>
              </div>
            ` : ''}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersRef.current.addLayer(marker);
    });
  }, [visibleLocations]);

  return (
    <div className="flex-1 relative">
      <div 
        ref={mapRef} 
        className="h-full w-full"
        style={{ minHeight: '400px' }}
      />

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
