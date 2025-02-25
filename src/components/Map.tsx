import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Marker, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { TrafficUpdate } from '../types';

interface MapProps {
  trafficData: TrafficUpdate[];
  selectedLocation: string | null;
  onLocationSelect: (location: string) => void;
}

// Coordinates for major Palestinian cities
const CITIES = {
  'Jerusalem': [31.7683, 35.2137],
  'Ramallah': [31.9038, 35.2034],
  'Nablus': [32.2211, 35.2544],
  'Hebron': [31.5326, 35.0998],
  'Gaza': [31.5017, 34.4668],
  'Bethlehem': [31.7054, 35.2024],
  'Tulkarm': [32.3104, 35.0286],
  'Jenin': [32.4597, 35.2956],
  'Jericho': [31.8667, 35.4500],
} as const;

// Coordinates for major checkpoints
const CHECKPOINTS = {
  'Qalandia': [31.8672, 35.2094],
  'Huwara': [32.1789, 35.2561],
  'Container': [31.7172, 35.2714],
  'Beit El DCO': [31.9272, 35.2167],
  'Zatara': [32.1711, 35.2503],
} as const;

// Custom icons
const cityIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const checkpointIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map center and zoom when selection changes
function MapController({ selectedLocation }: { selectedLocation: string | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedLocation) {
      const cityCoords = CITIES[selectedLocation as keyof typeof CITIES];
      const checkpointCoords = CHECKPOINTS[selectedLocation as keyof typeof CHECKPOINTS];
      const coords = cityCoords || checkpointCoords;

      if (coords) {
        map.setView(coords as [number, number], 12);
      }
    } else {
      map.setView([31.9522, 35.2332], 9);
    }
  }, [selectedLocation, map]);

  return null;
}

export default function Map({ trafficData, selectedLocation, onLocationSelect }: MapProps) {
  // Get all unique checkpoints from traffic data
  const activeCheckpoints = useMemo(() => {
    const checkpoints = new Set<string>();
    trafficData.forEach(update => {
      if (update.checkpoint_status) {
        Object.keys(update.checkpoint_status).forEach(checkpoint => {
          checkpoints.add(checkpoint);
        });
      }
    });
    return checkpoints;
  }, [trafficData]);

  return (
    <MapContainer
      center={[31.9522, 35.2332]}
      zoom={9}
      className="h-full w-full rounded-lg"
    >
      <MapController selectedLocation={selectedLocation} />
      
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Cities */}
      {Object.entries(CITIES).map(([city, coords]) => {
        const cityData = trafficData.find(update => 
          update.cities?.includes(city)
        );
        
        const getColor = () => {
          if (!cityData) return '#gray';
          const status = Object.values(cityData.traffic_status || {}).join(' ').toLowerCase();
          if (status.includes('heavy') || status.includes('closed')) return '#ef4444';
          if (status.includes('moderate')) return '#f59e0b';
          return '#22c55e';
        };

        return (
          <Marker
            key={city}
            position={coords as [number, number]}
            icon={cityIcon}
            eventHandlers={{
              click: () => onLocationSelect(city)
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold">{city}</h3>
                {cityData && (
                  <div className="mt-2 text-sm">
                    <p>Status: {Object.values(cityData.traffic_status || {}).join(', ')}</p>
                    {cityData.checkpoint_status && Object.entries(cityData.checkpoint_status).map(([checkpoint, status]) => (
                      <p key={checkpoint}>{checkpoint}: {status}</p>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => onLocationSelect(city)}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  Show updates
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Checkpoints */}
      {Object.entries(CHECKPOINTS).map(([checkpoint, coords]) => {
        if (!activeCheckpoints.has(checkpoint)) return null;

        const checkpointData = trafficData.find(update => 
          update.checkpoint_status && checkpoint in update.checkpoint_status
        );

        return (
          <Marker
            key={checkpoint}
            position={coords as [number, number]}
            icon={checkpointIcon}
            eventHandlers={{
              click: () => onLocationSelect(checkpoint)
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold">{checkpoint} Checkpoint</h3>
                {checkpointData && (
                  <div className="mt-2 text-sm">
                    <p>Status: {checkpointData.checkpoint_status?.[checkpoint]}</p>
                  </div>
                )}
                <button
                  onClick={() => onLocationSelect(checkpoint)}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  Show updates
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}