import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Location } from '../types/location';
import { LOCATION_TYPES } from '../types/location';

interface LocationMarkerProps {
  location: Location;
}

export default function LocationMarker({ location }: LocationMarkerProps) {
  const config = LOCATION_TYPES[location.type];
  
  // Create custom icon
  const customIcon = L.divIcon({
    html: `
      <div class="custom-marker-icon" style="
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
        <i class="${config.icon} text-white text-sm"></i>
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });

  return (
    <Marker 
      position={[location.latitude, location.longitude]} 
      icon={customIcon}
    >
      <Popup>
        <div className="p-2 min-w-48">
          <div className="flex items-center space-x-2 mb-2">
            <i 
              className={config.icon} 
              style={{ color: config.color }}
            />
            <h3 className="font-semibold text-gray-900">{location.name}</h3>
          </div>
          
          {location.address && (
            <p className="text-sm text-gray-600 mb-2">
              <i className="fas fa-map-marker-alt mr-1" />
              {location.address}
            </p>
          )}
          
          <div className="text-xs text-gray-500 space-y-1">
            <div>
              <strong>Type:</strong> {config.name.slice(0, -1)}
            </div>
            
            {location.openingHours && (
              <div>
                <strong>Hours:</strong> {location.openingHours}
              </div>
            )}
            
            {location.phone && (
              <div>
                <strong>Phone:</strong> {location.phone}
              </div>
            )}
            
            {location.website && (
              <div>
                <a 
                  href={location.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  <i className="fas fa-external-link-alt mr-1" />
                  Visit Website
                </a>
              </div>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
