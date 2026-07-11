import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair, MapPin, Loader } from 'lucide-react';

// Fix default marker icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const DEFAULT_CENTER = [20.5937, 78.9629]; // Center of India as fallback
const DEFAULT_ZOOM = 15;

/** Reverse geocode lat/lng -> address string using Nominatim (free, no key) */
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

/** Inner component: pans map + listens for clicks */
function MapController({ position, onMapClick }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, DEFAULT_ZOOM, { animate: true });
    }
  }, [position, map]);

  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });

  return null;
}

function RecenterButton({ onRecenter }) {
  return (
    <button className="recenter-btn" onClick={onRecenter} type="button">
      <Crosshair size={14} />
      My Location
    </button>
  );
}

/**
 * LocationMap
 * Props:
 *   lat, lng          – controlled coords (from parent)
 *   onLocationChange  – callback(lat, lng, address) called on GPS fix or map click
 *   className         – extra CSS class
 */
export default function LocationMap({ lat, lng, onLocationChange, className = '' }) {
  const [gpsStatus, setGpsStatus] = useState('idle'); // idle | loading | success | denied
  const [markerPos, setMarkerPos] = useState(null);

  // Derive display coords: prefer controlled props, then marker state, then default
  const displayLat = lat ?? (markerPos ? markerPos[0] : DEFAULT_CENTER[0]);
  const displayLng = lng ?? (markerPos ? markerPos[1] : DEFAULT_CENTER[1]);

  /** Request GPS and update everything */
  const fetchGPS = () => {
    if (!navigator.geolocation) {
      setGpsStatus('denied');
      return;
    }
    setGpsStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setGpsStatus('success');
        setMarkerPos([latitude, longitude]);
        const address = await reverseGeocode(latitude, longitude);
        onLocationChange?.(latitude, longitude, address);
      },
      () => {
        setGpsStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Auto-fetch GPS on mount
  useEffect(() => {
    fetchGPS();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Handle map click – update marker + reverse geocode */
  const handleMapClick = async (clickLat, clickLng) => {
    setMarkerPos([clickLat, clickLng]);
    const address = await reverseGeocode(clickLat, clickLng);
    onLocationChange?.(clickLat, clickLng, address);
  };

  const position = [displayLat, displayLng];

  return (
    <>
      {/* GPS status banner */}
      {gpsStatus === 'loading' && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 14px', marginBottom: '8px',
          backgroundColor: '#eff6ff', border: '1px solid #bfdbfe',
          borderRadius: '6px', color: '#1d4ed8', fontSize: '0.8rem'
        }}>
          <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
          Detecting your GPS location…
        </div>
      )}
      {gpsStatus === 'denied' && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 14px', marginBottom: '8px',
          backgroundColor: '#fef9c3', border: '1px solid #fde68a',
          borderRadius: '6px', color: '#92400e', fontSize: '0.8rem'
        }}>
          <MapPin size={14} />
          Location permission denied. Click on the map to pin your location.
        </div>
      )}
      {gpsStatus === 'success' && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 14px', marginBottom: '8px',
          backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0',
          borderRadius: '6px', color: '#15803d', fontSize: '0.8rem'
        }}>
          <MapPin size={14} />
          GPS location detected. Click anywhere on the map to adjust.
        </div>
      )}

      <div className={`map-container ${className}`}>
        <MapContainer
          center={position}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom={true}
          zoomControl={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} />
          <MapController position={markerPos} onMapClick={handleMapClick} />
          <RecenterButton onRecenter={fetchGPS} />
        </MapContainer>
      </div>

      <div className="geotag-bar">
        <span className="geo-icon"><MapPin size={14} /></span>
        {displayLat.toFixed(5)}° N, {displayLng.toFixed(5)}° E
      </div>

      {/* Spin keyframe for loader icon */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
