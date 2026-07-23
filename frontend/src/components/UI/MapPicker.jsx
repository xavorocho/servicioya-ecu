import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon } from "./helpers";

function LocationMarker({ position, onSelect }) {
  const map = useMapEvents({
    click(e) {
      onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return position ? <Marker position={[position.lat, position.lng]} /> : null;
}

export default function MapPicker({ onSelect, initialPosition }) {
  const [position, setPosition] = useState(initialPosition || { lat: -1.8312, lng: -78.1834 });
  const [loading, setLoading] = useState(false);

  const handleSelect = async (pos) => {
    setPosition(pos);
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}&addressdetails=1`,
        { headers: { "Accept-Language": "es" } }
      );
      const data = await res.json();
      onSelect({
        lat: pos.lat,
        lng: pos.lng,
        address: data.display_name || "",
      });
    } catch {
      onSelect({ lat: pos.lat, lng: pos.lng, address: "" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200">
      <div className="bg-blue-50 px-4 py-2 flex items-center gap-2">
        <Icon name="map-pin" className="text-blue-600" />
        <span className="text-sm font-semibold text-blue-800">
          {loading ? "Obteniendo dirección..." : "Haz clic en el mapa para seleccionar ubicación"}
        </span>
      </div>
      <MapContainer
        center={[position.lat, position.lng]}
        zoom={13}
        style={{ height: "300px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} onSelect={handleSelect} />
      </MapContainer>
      {position && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
          Lat: {position.lat.toFixed(6)}, Lng: {position.lng.toFixed(6)}
        </div>
      )}
    </div>
  );
}
