import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { Icon, LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Loader2 } from "lucide-react";

// Fix for default marker icon in production
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = new Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LocationData {
  address: string;
  lat: number;
  lng: number;
}

interface MapLocationPickerProps {
  value?: LocationData;
  onChange: (location: LocationData) => void;
}

// Component to handle map clicks
function MapClickHandler({ onClick }: { onClick: (latlng: LatLng) => void }) {
  useMapEvents({
    click: (e) => {
      onClick(e.latlng);
    },
  });
  return null;
}

export default function MapLocationPicker({ value, onChange }: MapLocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [markerPosition, setMarkerPosition] = useState<LatLng | null>(
    value ? new LatLng(value.lat, value.lng) : null
  );
  const mapRef = useRef<any>(null);

  // Default center: Pune, India
  const defaultCenter: [number, number] = [18.5204, 73.8567];

  // Reverse geocode to get address from coordinates
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            "User-Agent": "Nivaara Realty Website",
          },
        }
      );

      if (!response.ok) throw new Error("Geocoding failed");

      const data = await response.json();
      const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

      return address;
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };

  // Handle map click
  const handleMapClick = async (latlng: LatLng) => {
    setMarkerPosition(latlng);
    const address = await reverseGeocode(latlng.lat, latlng.lng);
    onChange({
      address,
      lat: latlng.lat,
      lng: latlng.lng,
    });
  };

  // Search for location
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
        {
          headers: {
            "User-Agent": "Nivaara Realty Website",
          },
        }
      );

      if (!response.ok) throw new Error("Search failed");

      const data = await response.json();
      if (data && data.length > 0) {
        const result = data[0];
        const latlng = new LatLng(parseFloat(result.lat), parseFloat(result.lon));
        setMarkerPosition(latlng);

        // Pan map to location
        if (mapRef.current) {
          mapRef.current.setView(latlng, 15);
        }

        onChange({
          address: result.display_name,
          lat: latlng.lat,
          lng: latlng.lng,
        });
      } else {
        alert("Location not found. Please try a different search term.");
      }
    } catch (error) {
      console.error("Search error:", error);
      alert("Failed to search location. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for location (e.g., Kharadi, Pune)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button
          type="button"
          onClick={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
        >
          {isSearching ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4 mr-2" />
              Search
            </>
          )}
        </Button>
      </div>

      {/* Selected Address Display */}
      {value && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900">Selected Location:</p>
          <p className="text-sm text-blue-700 mt-1">{value.address}</p>
          <p className="text-xs text-blue-600 mt-1">
            Coordinates: {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
          </p>
        </div>
      )}

      {/* Map */}
      <div className="h-[400px] rounded-lg overflow-hidden border border-border">
        <MapContainer
          center={markerPosition ? [markerPosition.lat, markerPosition.lng] : defaultCenter}
          zoom={markerPosition ? 15 : 12}
          style={{ height: "100%", width: "100%" }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onClick={handleMapClick} />
          {markerPosition && (
            <Marker
              position={markerPosition}
              icon={defaultIcon}
              draggable={true}
              eventHandlers={{
                dragend: async (e) => {
                  const marker = e.target;
                  const position = marker.getLatLng();
                  setMarkerPosition(position);
                  const address = await reverseGeocode(position.lat, position.lng);
                  onChange({
                    address,
                    lat: position.lat,
                    lng: position.lng,
                  });
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      <p className="text-sm text-muted-foreground">
        💡 <strong>Tip:</strong> Search for a location or click anywhere on the map to pin the property location. You can also drag the marker to adjust.
      </p>
    </div>
  );
}
