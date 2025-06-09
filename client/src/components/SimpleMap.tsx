import { useEffect } from 'react';
import L from 'leaflet';

export default function SimpleMap() {
  useEffect(() => {
    // Initialize map
    const map = L.map('simple-map').setView([37.7749, -122.4194], 12);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Add a test marker
    L.marker([37.7749, -122.4194]).addTo(map)
      .bindPopup('San Francisco Center')
      .openPopup();
    
    return () => {
      map.remove();
    };
  }, []);

  return (
    <div 
      id="simple-map" 
      style={{ 
        height: '400px', 
        width: '100%',
        border: '2px solid red' // Debug border
      }}
    />
  );
}