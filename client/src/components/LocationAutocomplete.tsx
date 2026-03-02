import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Loader2, CheckCircle2 } from 'lucide-react';

interface LocationAutocompleteProps {
  value: string;
  onChange: (location: string, lat?: number, lon?: number) => void;
  placeholder?: string;
}

const API_KEY = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
const FORGE_BASE_URL =
  import.meta.env.VITE_FRONTEND_FORGE_API_URL ||
  "https://forge.butterfly-effect.dev";
const MAPS_PROXY_URL = `${FORGE_BASE_URL}/v1/maps/proxy`;

// Shared promise so multiple components don't double-load the script
let _mapsLoadPromise: Promise<void> | null = null;

function loadGoogleMapsScript(): Promise<void> {
  if (_mapsLoadPromise) return _mapsLoadPromise;
  _mapsLoadPromise = new Promise((resolve, reject) => {
    if (window.google?.maps?.places) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    // language=en → English place names; no country restriction → global coverage
    script.src = `${MAPS_PROXY_URL}/maps/api/js?key=${API_KEY}&v=weekly&libraries=places,geocoding&language=en`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => resolve();
    script.onerror = () => {
      _mapsLoadPromise = null;
      reject(new Error("Failed to load Google Maps script"));
    };
    document.head.appendChild(script);
  });
  return _mapsLoadPromise;
}

interface Suggestion {
  description: string;
  placeId: string;
}

export default function LocationAutocomplete({
  value,
  onChange,
  placeholder = "Type to search location...",
}: LocationAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingScript, setIsLoadingScript] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeSuccess, setGeocodeSuccess] = useState(false);

  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const justSelectedRef = useRef(false);

  // Sync external value changes (e.g. when form is pre-populated from DB)
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Initialise Google Maps services once
  useEffect(() => {
    setIsLoadingScript(true);
    loadGoogleMapsScript()
      .then(() => {
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        geocoderRef.current = new window.google.maps.Geocoder();
        setIsLoadingScript(false);
      })
      .catch((err) => {
        console.error("Maps script failed:", err);
        setIsLoadingScript(false);
      });
  }, []);

  // Fetch predictions whenever the user types
  useEffect(() => {
    if (!inputValue.trim() || !autocompleteServiceRef.current || justSelectedRef.current) {
      setSuggestions([]);
      return;
    }

    autocompleteServiceRef.current.getPlacePredictions(
      {
        input: inputValue,
        // No types restriction → surfaces talukas, sub-districts, localities, cities, countries
        // No componentRestrictions → global (India, Australia, UAE, etc.)
        language: 'en',
      },
      (predictions, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          predictions
        ) {
          setSuggestions(
            predictions.map((p) => ({
              description: p.description,
              placeId: p.place_id,
            }))
          );
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
        }
      }
    );
  }, [inputValue]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
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

  const handleSuggestionSelect = useCallback(
    (suggestion: Suggestion) => {
      justSelectedRef.current = true;
      setInputValue(suggestion.description);
      setSuggestions([]);
      setShowSuggestions(false);

      if (!geocoderRef.current) {
        onChange(suggestion.description);
        return;
      }

      setIsGeocoding(true);
      geocoderRef.current.geocode(
        { placeId: suggestion.placeId },
        (results, status) => {
          setIsGeocoding(false);
          if (status === "OK" && results && results[0]) {
            const loc = results[0].geometry.location;
            onChange(suggestion.description, loc.lat(), loc.lng());
            setGeocodeSuccess(true);
            setTimeout(() => {
              setGeocodeSuccess(false);
              justSelectedRef.current = false;
            }, 2000);
          } else {
            onChange(suggestion.description);
            justSelectedRef.current = false;
          }
        }
      );
    },
    [onChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    justSelectedRef.current = false;
    setInputValue(e.target.value);
    if (!e.target.value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          placeholder={placeholder}
          className="w-full pl-9 pr-9 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          disabled={isLoadingScript}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        {(isLoadingScript || isGeocoding) && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {geocodeSuccess && !isGeocoding && (
          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-input rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((s) => (
            <button
              key={s.placeId}
              type="button"
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2 border-b border-border/40 last:border-0"
              onMouseDown={(e) => {
                // Use mousedown so it fires before onBlur hides the dropdown
                e.preventDefault();
                handleSuggestionSelect(s);
              }}
            >
              <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">{s.description}</span>
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-1">
        Select a location from the dropdown to attach coordinates
      </p>
    </div>
  );
}
