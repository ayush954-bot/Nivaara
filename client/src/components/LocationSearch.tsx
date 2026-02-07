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
import { trpc } from "@/lib/trpc";

interface LocationSearchProps {
  onLocationChange: (location: string) => void;
  onCoordinatesChange: (lat: number, lon: number, radius: number) => void;
  placeholder?: string;
  className?: string;
}

export function LocationSearch({
  onLocationChange,
  onCoordinatesChange,
  placeholder = "Search location...",
  className = "",
}: LocationSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string>("");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeSuccess, setGeocodeSuccess] = useState(false);
  const [lastCoordinates, setLastCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch location suggestions
  const { data: suggestions = [] } = trpc.properties.locationSuggestions.useQuery();
  
  // State for triggering geocode
  const [locationToGeocode, setLocationToGeocode] = useState<string | null>(null);
  
  // Geocode query (only runs when locationToGeocode is set)
  const { data: geocodeData, isLoading: isGeocodeLoading } = trpc.properties.geocode.useQuery(
    { location: locationToGeocode! },
    { enabled: !!locationToGeocode }
  );
  
  // Update geocoding state based on query status
  useEffect(() => {
    setIsGeocoding(isGeocodeLoading);
  }, [isGeocodeLoading]);
  
  // Effect to handle geocode results
  useEffect(() => {
    if (geocodeData && geocodeData.lat && geocodeData.lng && locationToGeocode) {
      setLastCoordinates({ lat: geocodeData.lat, lon: geocodeData.lng });
      onCoordinatesChange(geocodeData.lat, geocodeData.lng, radiusKm);
      setLocationToGeocode(null); // Reset after processing
      setGeocodeSuccess(true);
      
      // Clear success message after 2 seconds
      const timer = setTimeout(() => setGeocodeSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [geocodeData, locationToGeocode, radiusKm, onCoordinatesChange]);
  
  // Effect to update search when radius changes (if we have coordinates)
  useEffect(() => {
    if (lastCoordinates) {
      onCoordinatesChange(lastCoordinates.lat, lastCoordinates.lon, radiusKm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radiusKm]);

  // Filter suggestions based on search term
  const filteredSuggestions = suggestions.filter((suggestion) =>
    suggestion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    setShowSuggestions(true);
    onLocationChange(value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    onLocationChange(suggestion);
    setGeocodeSuccess(false);
    
    // Trigger geocoding for the selected location
    setLocationToGeocode(suggestion);
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
        onCoordinatesChange(latitude, longitude, radiusKm);
        setSearchTerm("Near me");
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
      <div className="flex gap-2">
        {/* Location Input with Autocomplete */}
        <div className="relative flex-1">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              className="pl-10 pr-10"
              disabled={isGeocoding}
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
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto"
            >
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{suggestion}</span>
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
          <SelectTrigger className="w-32">
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
          variant="outline"
          onClick={handleNearMe}
          disabled={isLocating}
          className="flex items-center gap-2"
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
