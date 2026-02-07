import { useEffect, useRef, useState } from "react";
import { MapView } from "./Map";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { IndianRupee, MapPin, Ruler } from "lucide-react";
import { Link } from "wouter";

interface Property {
  id: number;
  title: string;
  location: string;
  area?: string;
  latitude: string | null;
  longitude: string | null;
  price: string;
  priceLabel?: string | null;
  area_sqft?: number | null;
  propertyType: string;
  status: string;
  imageUrl?: string | null;
  slug?: string | null;
  distance?: number;
}

interface PropertiesMapViewProps {
  properties: Property[];
  searchCenter?: { lat: number; lon: number } | null;
  radiusKm?: number;
}

export function PropertiesMapView({ properties, searchCenter, radiusKm }: PropertiesMapViewProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const circleRef = useRef<google.maps.Circle | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Initialize map and add markers
  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map;
    
    // Create info window
    infoWindowRef.current = new google.maps.InfoWindow();

    updateMapMarkers();
  };

  // Update markers when properties change
  useEffect(() => {
    if (mapRef.current) {
      updateMapMarkers();
    }
  }, [properties, searchCenter, radiusKm]);

  const updateMapMarkers = () => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Clear existing circle
    if (circleRef.current) {
      circleRef.current.setMap(null);
      circleRef.current = null;
    }

    // Add search center circle if provided
    if (searchCenter && radiusKm) {
      circleRef.current = new google.maps.Circle({
        strokeColor: "#D4AF37",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#D4AF37",
        fillOpacity: 0.15,
        map: mapRef.current,
        center: { lat: searchCenter.lat, lng: searchCenter.lon },
        radius: radiusKm * 1000, // Convert km to meters
      });

      // Add center marker
      const centerMarker = new google.maps.Marker({
        position: { lat: searchCenter.lat, lng: searchCenter.lon },
        map: mapRef.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#D4AF37",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 2,
        },
        title: "Search Center",
      });
      markersRef.current.push(centerMarker);
    }

    // Add property markers
    const bounds = new google.maps.LatLngBounds();
    let hasValidBounds = false;

    properties.forEach((property) => {
      if (!property.latitude || !property.longitude) return;

      const lat = Number(property.latitude);
      const lng = Number(property.longitude);
      
      if (isNaN(lat) || isNaN(lng)) return;

      const position = { lat, lng };
      bounds.extend(position);
      hasValidBounds = true;

      const marker = new google.maps.Marker({
        position,
        map: mapRef.current!,
        title: property.title,
        icon: {
          url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
            <svg width="32" height="40" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 0C7.2 0 0 7.2 0 16c0 8.8 16 24 16 24s16-15.2 16-24C32 7.2 24.8 0 16 0z" fill="#1A1A1A"/>
              <circle cx="16" cy="16" r="8" fill="#D4AF37"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 40),
          anchor: new google.maps.Point(16, 40),
        },
      });

      marker.addListener("click", () => {
        setSelectedProperty(property);
        
        const content = `
          <div style="max-width: 250px; font-family: system-ui, -apple-system, sans-serif;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1A1A1A;">${property.title}</h3>
            <p style="margin: 0 0 4px 0; font-size: 14px; color: #666;">
              <strong>Location:</strong> ${property.area ? `${property.area}, ` : ''}${property.location}
            </p>
            ${property.distance !== undefined ? `
              <p style="margin: 0 0 4px 0; font-size: 14px; color: #D4AF37; font-weight: 600;">
                <strong>Distance:</strong> ${property.distance.toFixed(1)} km away
              </p>
            ` : ''}
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">
              <strong>Price:</strong> ${property.priceLabel || `₹${(Number(property.price) / 100000).toFixed(0)}L`}
            </p>
            <a href="/properties/${property.slug || property.id}" style="display: inline-block; padding: 6px 12px; background: #D4AF37; color: white; text-decoration: none; border-radius: 4px; font-size: 14px; font-weight: 500;">
              View Details
            </a>
          </div>
        `;

        infoWindowRef.current?.setContent(content);
        infoWindowRef.current?.open(mapRef.current!, marker);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (hasValidBounds) {
      mapRef.current.fitBounds(bounds);
      
      // Ensure minimum zoom level
      const listener = google.maps.event.addListenerOnce(mapRef.current, 'bounds_changed', () => {
        const zoom = mapRef.current?.getZoom();
        if (zoom && zoom > 15) {
          mapRef.current?.setZoom(15);
        }
      });
    } else if (searchCenter) {
      // If no properties but we have search center, center on that
      mapRef.current.setCenter({ lat: searchCenter.lat, lng: searchCenter.lon });
      mapRef.current.setZoom(12);
    }
  };

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden border border-border shadow-lg">
      <MapView
        onMapReady={handleMapReady}
        initialCenter={{ lat: 18.5204, lng: 73.8567 }} // Pune center
        initialZoom={11}
      />
      
      {selectedProperty && (
        <Card className="absolute bottom-4 left-4 right-4 md:right-auto md:w-96 z-10 shadow-xl">
          <CardContent className="p-4">
            <div className="flex gap-2 mb-2">
              <Badge variant={selectedProperty.status === "Ready" ? "default" : "secondary"}>
                {selectedProperty.status}
              </Badge>
              <Badge variant="outline">{selectedProperty.propertyType}</Badge>
            </div>
            <h3 className="font-semibold text-lg mb-2">{selectedProperty.title}</h3>
            <div className="space-y-2 text-sm text-muted-foreground mb-3">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                {selectedProperty.area ? `${selectedProperty.area}, ${selectedProperty.location}` : selectedProperty.location}
              </div>
              {selectedProperty.distance !== undefined && (
                <div className="flex items-center font-medium text-primary">
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  {selectedProperty.distance.toFixed(1)} km away
                </div>
              )}
              {selectedProperty.area_sqft && (
                <div className="flex items-center">
                  <Ruler className="h-4 w-4 mr-2" />
                  {selectedProperty.area_sqft} sq.ft
                </div>
              )}
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center text-lg font-bold text-primary">
                <IndianRupee className="h-5 w-5 mr-1" />
                {selectedProperty.priceLabel || `₹${(Number(selectedProperty.price) / 100000).toFixed(0)}L`}
              </div>
              <Button size="sm" asChild>
                <Link href={`/properties/${selectedProperty.slug || selectedProperty.id}`}>View Details</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
