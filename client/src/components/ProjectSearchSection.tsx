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
import { Building2 } from "lucide-react";

export function ProjectSearchSection() {
  const [locationFilter, setLocationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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
    
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (budgetFilter !== "all") params.set("budget", budgetFilter);
    if (bhkFilter !== "all") params.set("bhk", bhkFilter);
    
    window.location.href = `/projects?${params.toString()}`;
  };

  return (
    <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
      <h2 className="text-2xl font-bold mb-6 text-card-foreground flex items-center gap-2">
        <Building2 className="h-6 w-6" />
        Explore Builder Projects
      </h2>
      
      {/* Location Search with Autocomplete, Radius, and Near Me */}
      <LocationSearch
        onLocationChange={(loc) => {
          setLocationFilter(loc || "");
          setCoordinates(null); // Clear coordinates when typing location
        }}
        onCoordinatesChange={(lat, lon, radius) => {
          setCoordinates({ lat, lon, radius });
        }}
        placeholder="Search projects by location..."
        className="mb-4"
        nearMeButtonVariant="default"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Ready to Move">Ready to Move</SelectItem>
            <SelectItem value="Under Construction">Under Construction</SelectItem>
            <SelectItem value="Upcoming">Upcoming</SelectItem>
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
            <SelectItem value="50-100">₹50L - ₹1 Cr</SelectItem>
            <SelectItem value="100-150">₹1 Cr - ₹1.5 Cr</SelectItem>
            <SelectItem value="150-200">₹1.5 Cr - ₹2 Cr</SelectItem>
            <SelectItem value="200-plus">Above ₹2 Cr</SelectItem>
          </SelectContent>
        </Select>

        {/* BHK Filter */}
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
      </div>

      <Button 
        onClick={handleSearch}
        size="lg"
        className="w-full"
      >
        <Building2 className="mr-2 h-5 w-5" />
        Search Projects
      </Button>
    </div>
  );
}
