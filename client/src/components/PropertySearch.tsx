import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal, MapPin, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import LocationSelect from "@/components/LocationSelect";
import { useGeolocation } from "@/hooks/useGeolocation";

interface PropertySearchProps {
  variant?: "hero" | "compact";
}

export default function PropertySearch({ variant = "hero" }: PropertySearchProps) {
  const [, setLocation] = useLocation();
  const { city, country, isLoading: geoLoading } = useGeolocation();
  const [searchParams, setSearchParams] = useState({
    location: "",
    propertyType: "",
    budget: "",
    bedrooms: "",
  });

  // Auto-fill location when geolocation is detected
  useEffect(() => {
    if (city && !searchParams.location) {
      // Try to match detected city with our location options
      // For Indian cities, use city name directly
      // For international, use country name
      const detectedLocation = country === "India" ? city : country;
      if (detectedLocation) {
        setSearchParams(prev => ({ ...prev, location: detectedLocation }));
      }
    }
  }, [city, country, searchParams.location]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchParams.location) params.append("location", searchParams.location);
    if (searchParams.propertyType) params.append("type", searchParams.propertyType);
    if (searchParams.budget) params.append("budget", searchParams.budget);
    if (searchParams.bedrooms) params.append("bedrooms", searchParams.bedrooms);
    
    setLocation(`/properties?${params.toString()}`);
  };

  const isHero = variant === "hero";

  return (
    <div className={`${isHero ? "bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8" : "bg-card rounded-lg shadow-md p-4"}`}>
      <div className="flex items-center gap-2 mb-4">
        <Search className="h-5 w-5 text-primary" />
        <h3 className={`${isHero ? "text-xl" : "text-lg"} font-semibold text-foreground`}>
          Find Your Perfect Property
        </h3>
      </div>

      <div className={`grid ${isHero ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-2"} gap-3 sm:gap-4`}>
        {/* Location Filter */}
        <div>
          <label className="text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2 block">
            Location
          </label>
          <LocationSelect
            value={searchParams.location}
            onValueChange={(value) =>
              setSearchParams({ ...searchParams, location: value })
            }
            placeholder="Select Location"
            className="h-11 sm:h-10 text-base sm:text-sm"
          />
        </div>

        {/* Property Type Filter */}
        <div>
          <label className="text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2 block">
            Property Type
          </label>
          <Select
            value={searchParams.propertyType}
            onValueChange={(value) =>
              setSearchParams({ ...searchParams, propertyType: value })
            }
          >
            <SelectTrigger className="h-11 sm:h-10 text-base sm:text-sm">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Flat">Flat/Apartment</SelectItem>
              <SelectItem value="Shop">Shop</SelectItem>
              <SelectItem value="Office">Office</SelectItem>
              <SelectItem value="Land">Land/Plot</SelectItem>
              <SelectItem value="Rental">Rental</SelectItem>
              <SelectItem value="Bank Auction">Bank Auction</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Budget Filter */}
        <div>
          <label className="text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2 block">
            Budget
          </label>
          <Select
            value={searchParams.budget}
            onValueChange={(value) =>
              setSearchParams({ ...searchParams, budget: value })
            }
          >
            <SelectTrigger className="h-11 sm:h-10 text-base sm:text-sm">
              <SelectValue placeholder="Select Budget" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Budgets</SelectItem>
              <SelectItem value="0-50">Under ₹50 Lakhs</SelectItem>
              <SelectItem value="50-75">₹50L - ₹75L</SelectItem>
              <SelectItem value="75-100">₹75L - ₹1 Cr</SelectItem>
              <SelectItem value="100-150">₹1 Cr - ₹1.5 Cr</SelectItem>
              <SelectItem value="150-200">₹1.5 Cr - ₹2 Cr</SelectItem>
              <SelectItem value="200-300">₹2 Cr - ₹3 Cr</SelectItem>
              <SelectItem value="300-plus">Above ₹3 Cr</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bedrooms Filter */}
        <div>
          <label className="text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2 block">
            Bedrooms
          </label>
          <Select
            value={searchParams.bedrooms}
            onValueChange={(value) =>
              setSearchParams({ ...searchParams, bedrooms: value })
            }
          >
            <SelectTrigger className="h-11 sm:h-10 text-base sm:text-sm">
              <SelectValue placeholder="Select BHK" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="1">1 BHK</SelectItem>
              <SelectItem value="2">2 BHK</SelectItem>
              <SelectItem value="3">3 BHK</SelectItem>
              <SelectItem value="4">4 BHK</SelectItem>
              <SelectItem value="5">5+ BHK</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 sm:mt-6 flex gap-2 sm:gap-3">
        <Button
          onClick={handleSearch}
          size="lg"
          className="flex-1 text-sm sm:text-base h-12 sm:h-11"
        >
          <Search className="h-5 w-5 mr-2" />
          Search Properties
        </Button>
        {isHero && (
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              setSearchParams({
                location: "",
                propertyType: "",
                budget: "",
                bedrooms: "",
              });
            }}
          >
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
