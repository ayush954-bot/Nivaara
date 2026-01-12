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
        const response = await fetch("https://ipapi.co/json/");
        
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
        console.error("Error fetching IP location:", error);
        setResult({
          city: null,
          country: null,
          isLoading: false,
          error: "Failed to determine your location",
        });
      }
    };

    fetchIPLocation();
  }, []);

  return result;
}
