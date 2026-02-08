import { useState } from "react";
import { LocationSearch } from "@/components/LocationSearch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function PropertySearchSection() {
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [budgetFilter, setBudgetFilter] = useState("all");
  const [bhkFilter, setBhkFilter] = useState("all");
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number; radius: number } | null>(null);

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (coordinates) {
      params.set("lat", coordinates.lat.toString());
      params.set("lon", coordinates.lon.toString());
      params.set("radius", coordinates.radius.toString());
    } else if (locationFilter && locationFilter !== "all") {
      params.set("location", locationFilter);
    }
    
    if (typeFilter !== "all") params.set("type", typeFilter);
    if (budgetFilter !== "all") params.set("budget", budgetFilter);
    if (bhkFilter !== "all") params.set("bhk", bhkFilter);
    
    window.location.href = `/properties?${params.toString()}`;
  };

  return (
    <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
      <h2 className="text-2xl font-bold mb-6 text-card-foreground flex items-center gap-2">
        <Search className="h-6 w-6" />
        Find Your Perfect Property
      </h2>
      
      {/* Location Search with Autocomplete, Radius, and Near Me */}
      <LocationSearch
        onLocationChange={(loc) => {
          setLocationFilter(loc || "");
          setCoordinates(null); // Clear coordinates when typing location
        }}
        onCoordinatesChange={(lat, lon, radius) => {
          setCoordinates({ lat, lon, radius });
          setLocationFilter(""); // Clear text filter when using coordinates
        }}
        placeholder="Search properties by location..."
        className="mb-4"
        nearMeButtonVariant="default"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Property Type Filter */}
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Property Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Flat">Flat</SelectItem>
            <SelectItem value="Shop">Shop</SelectItem>
            <SelectItem value="Office">Office</SelectItem>
            <SelectItem value="Land">Land</SelectItem>
            <SelectItem value="Rental">Rental</SelectItem>
            <SelectItem value="Bank Auction">Bank Auction</SelectItem>
          </SelectContent>
        </Select>

        {/* Budget Filter */}
        <Select value={budgetFilter} onValueChange={setBudgetFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Budget" />
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

        {/* BHK Filter - Only show for Flat and Rental */}
        {(typeFilter === "all" || typeFilter === "Flat" || typeFilter === "Rental") && (
          <Select value={bhkFilter} onValueChange={setBhkFilter}>
            <SelectTrigger>
              <SelectValue placeholder="BHK" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All BHK</SelectItem>
              <SelectItem value="1">1 BHK</SelectItem>
              <SelectItem value="2">2 BHK</SelectItem>
              <SelectItem value="3">3 BHK</SelectItem>
              <SelectItem value="4">4 BHK</SelectItem>
              <SelectItem value="5">5+ BHK</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      <Button 
        onClick={handleSearch}
        size="lg"
        className="w-full"
      >
        <Search className="mr-2 h-5 w-5" />
        Search Properties
      </Button>
    </div>
  );
}
