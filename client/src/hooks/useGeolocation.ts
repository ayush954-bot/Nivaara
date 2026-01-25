import { useState, useEffect } from "react";

interface GeolocationResult {
  city: string | null;
  country: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useGeolocation(): GeolocationResult {
  const [result, setResult] = useState<GeolocationResult>({
    city: null,
    country: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    // Use IP-based geolocation (works with VPNs, no permission needed)
    const fetchIPLocation = async () => {
      try {
        // Using ipapi.co - free tier: 1000 requests/day, no API key required
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch("https://ipapi.co/json/", {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error("Failed to fetch location data");
        }

        const data = await response.json();

        setResult({
          city: data.city || data.region || null,
          country: data.country_name || null,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        // Silently handle the error - geolocation is not critical
        // Don't log to console to avoid cluttering
        setResult({
          city: null,
          country: null,
          isLoading: false,
          error: null, // Don't show error to user - it's not critical
        });
      }
    };

    fetchIPLocation();
  }, []);

  return result;
}
