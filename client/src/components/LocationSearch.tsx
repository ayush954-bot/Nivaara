import { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// Google Maps API configuration
const API_KEY = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
const FORGE_BASE_URL = import.meta.env.VITE_FRONTEND_FORGE_API_URL || "https://forge.butterfly-effect.dev";
const MAPS_PROXY_URL = `${FORGE_BASE_URL}/v1/maps/proxy`;

// Load Google Maps script
function loadMapScript() {
  return new Promise<void>((resolve) => {
    if (window.google?.maps) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = `${MAPS_PROXY_URL}/maps/api/js?key=${API_KEY}&v=weekly&libraries=places,geocoding`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      resolve();
      script.remove();
    };
    script.onerror = () => {
      console.error("Failed to load Google Maps script");
    };
    document.head.appendChild(script);
  });
}

interface PlaceSuggestion {
  description: string;
  placeId: string;
}

interface LocationSearchProps {
  onLocationChange: (location: string) => void;
  onCoordinatesChange: (lat: number, lon: number, radius: number) => void;
  onLocationNameChange?: (name: string) => void;
  placeholder?: string;
  className?: string;
  nearMeButtonVariant?: "default" | "outline";
  initialLocation?: string;
  initialCoordinates?: { lat: number; lon: number; radius: number };
}

export function LocationSearch({
  onLocationChange,
  onCoordinatesChange,
  onLocationNameChange,
  placeholder = "Search location...",
  className = "",
  nearMeButtonVariant = "outline",
  initialLocation = "",
  initialCoordinates,
}: LocationSearchProps) {
  const [searchTerm, setSearchTerm] = useState(initialLocation);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [radiusKm, setRadiusKm] = useState<number>(initialCoordinates?.radius || 10);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string>("");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeSuccess, setGeocodeSuccess] = useState(false);
  const [lastCoordinates, setLastCoordinates] = useState<{ lat: number; lon: number } | null>(
    initialCoordinates ? { lat: initialCoordinates.lat, lon: initialCoordinates.lon } : null
  );

  // Update searchTerm when initialLocation prop changes
  useEffect(() => {
    if (initialLocation) {
      setSearchTerm(initialLocation);
    }
  }, [initialLocation]);

  // Update lastCoordinates and radiusKm when initialCoordinates prop changes
  useEffect(() => {
    if (initialCoordinates) {
      setLastCoordinates({ lat: initialCoordinates.lat, lon: initialCoordinates.lon });
      setRadiusKm(initialCoordinates.radius);
    }
  }, [initialCoordinates]);
  const [isUsingCoordinates, setIsUsingCoordinates] = useState(false);
  const [justSelected, setJustSelected] = useState(false);
  const selectedLocationRef = useRef<string>(initialLocation);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [placeSuggestions, setPlaceSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  // Initialize Google Maps services
  useEffect(() => {
    loadMapScript().then(() => {
      if (window.google?.maps) {
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        geocoderRef.current = new window.google.maps.Geocoder();
      }
    });
  }, []);
  
  // Fetch place suggestions from Google Maps
  useEffect(() => {
    if (!searchTerm || !autocompleteServiceRef.current) {
      setPlaceSuggestions([]);
      return;
    }
    
    setIsLoadingPlaces(true);
    autocompleteServiceRef.current.getPlacePredictions(
      {
        input: searchTerm,
        // Use geocode type to include talukas, subdistricts, neighborhoods, and localities
        // (regions) misses sub-district level places like Purandar
        types: ['geocode'],
        componentRestrictions: { country: 'in' }, // Bias to India
        language: 'en', // Always return English names
      },
      (predictions, status) => {
        setIsLoadingPlaces(false);
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setPlaceSuggestions(
            predictions.map(p => ({
              description: p.description,
              placeId: p.place_id,
            }))
          );
        } else {
          setPlaceSuggestions([]);
        }
      }
    );
  }, [searchTerm]);
  
  // Effect to update search when radius changes (if we have coordinates)
  useEffect(() => {
    if (lastCoordinates) {
      onCoordinatesChange(lastCoordinates.lat, lastCoordinates.lon, radiusKm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radiusKm]);

  // Geocode a place by place ID
  const geocodePlaceById = async (placeId: string, description: string) => {
    if (!geocoderRef.current) return;
    
    setIsGeocoding(true);
    geocoderRef.current.geocode({ placeId }, (results, status) => {
      setIsGeocoding(false);
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        setLastCoordinates({ lat, lon: lng });
        onCoordinatesChange(lat, lng, radiusKm);
        setGeocodeSuccess(true);
        
        setTimeout(() => setGeocodeSuccess(false), 2000);
      } else {
        setLocationError('Failed to get coordinates for this location');
      }
    });
  };

  // Handle click/touch outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handleInputChange = (value: string) => {
    selectedLocationRef.current = ""; // Clear ref when typing
    setSearchTerm(value);
    setShowSuggestions(true);
    setIsUsingCoordinates(false); // User is typing manually, not using coordinates
    onLocationChange(value);
  };

  const handleSuggestionClick = (suggestion: PlaceSuggestion) => {
    selectedLocationRef.current = suggestion.description;
    setSearchTerm(suggestion.description);
    setShowSuggestions(false);
    setIsUsingCoordinates(true);
    setJustSelected(true);
    setPlaceSuggestions([]);
    onLocationChange(suggestion.description);
    
    // Notify parent about location name
    if (onLocationNameChange) {
      onLocationNameChange(suggestion.description);
    }
    
    // Geocode the selected place to get coordinates
    geocodePlaceById(suggestion.placeId, suggestion.description);
    
    // Blur the input to prevent refocus on mobile
    if (inputRef.current) {
      inputRef.current.blur();
    }
    
    setTimeout(() => {
      setJustSelected(false);
    }, 2000);
  };

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLastCoordinates({ lat: latitude, lon: longitude }); // Save coordinates for radius changes
        setIsUsingCoordinates(true); // Mark that we're using coordinate-based search
        onCoordinatesChange(latitude, longitude, radiusKm);
        setSearchTerm("Near me");
        selectedLocationRef.current = "Near me"; // Persist the text
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location permission denied");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information unavailable");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out");
            break;
          default:
            setLocationError("An unknown error occurred");
        }
      }
    );
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex flex-wrap gap-2">
        {/* Location Input with Autocomplete */}
        <div className="relative flex-1 min-w-[200px]">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={selectedLocationRef.current || searchTerm}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => {
                // Don't show suggestions if we just selected one
                if (!justSelected) {
                  setShowSuggestions(true);
                }
              }}
              onBlur={() => {
                // Delay hiding so onMouseDown/onTouchEnd on suggestion can fire first
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              className="pl-10 pr-10 text-gray-900 bg-white placeholder:text-gray-500"
              style={{ color: '#111827', WebkitTextFillColor: '#111827' }}
              disabled={isGeocoding}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            {isGeocoding && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" />
            )}
            {geocodeSuccess && !isGeocoding && (
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>

          {/* Autocomplete Suggestions */}
          {showSuggestions && placeSuggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-xl max-h-60 overflow-auto"
              style={{ top: '100%', left: 0, right: 0 }}
            >
              {placeSuggestions.map((suggestion) => (
                <button
                  key={suggestion.placeId}
                  onMouseDown={(e) => {
                    // Use onMouseDown instead of onClick to fire before onBlur
                    e.preventDefault();
                    handleSuggestionClick(suggestion);
                  }}
                  onTouchEnd={(e) => {
                    // Handle touch events for mobile
                    e.preventDefault();
                    handleSuggestionClick(suggestion);
                  }}
                  className="w-full px-4 py-3 text-left text-gray-900 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-600 shrink-0" />
                    <span className="text-black text-sm">{suggestion.description}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Radius Selector */}
        <Select
          value={radiusKm.toString()}
          onValueChange={(value) => setRadiusKm(Number(value))}
        >
          <SelectTrigger className="w-32 text-gray-900 bg-white border-gray-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">Within 5km</SelectItem>
            <SelectItem value="10">Within 10km</SelectItem>
            <SelectItem value="20">Within 20km</SelectItem>
            <SelectItem value="50">Within 50km</SelectItem>
          </SelectContent>
        </Select>

        {/* Near Me Button */}
        <Button
          variant={nearMeButtonVariant}
          onClick={handleNearMe}
          disabled={isLocating}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          {isLocating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
          Near Me
        </Button>
      </div>

      {/* Error Message */}
      {locationError && (
        <p className="text-sm text-destructive">{locationError}</p>
      )}
    </div>
  );
}
