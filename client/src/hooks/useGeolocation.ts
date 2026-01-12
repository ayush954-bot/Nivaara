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
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setResult({
        city: null,
        country: null,
        isLoading: false,
        error: "Geolocation is not supported by your browser",
      });
      return;
    }

    // Get user's position
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Use reverse geocoding API to get city/country
          // Using OpenStreetMap Nominatim API (free, no API key required)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
            {
              headers: {
                "User-Agent": "Nivaara Realty Website",
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to fetch location data");
          }

          const data = await response.json();
          const address = data.address;

          // Extract city and country
          const city =
            address.city ||
            address.town ||
            address.village ||
            address.county ||
            address.state_district ||
            address.state ||
            null;

          const country = address.country || null;

          setResult({
            city,
            country,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error("Error fetching location:", error);
          setResult({
            city: null,
            country: null,
            isLoading: false,
            error: "Failed to determine your location",
          });
        }
      },
      (error) => {
        // User denied permission or other error
        let errorMessage = "Failed to get your location";
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = "Location permission denied";
        }

        setResult({
          city: null,
          country: null,
          isLoading: false,
          error: errorMessage,
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 3600000, // Cache for 1 hour
      }
    );
  }, []);

  return result;
}
