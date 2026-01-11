import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Ruler, IndianRupee, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Properties() {
  const [location] = useLocation();
  const [locationFilter, setLocationFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [budgetFilter, setBudgetFilter] = useState("all");
  const [bhkFilter, setBhkFilter] = useState("all");

  // Read zone or location parameter from URL and set location filter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // Check for zone parameter (from zone map clicks)
    const zone = params.get('zone');
    if (zone) {
      const zoneMap: Record<string, string> = {
        'east-pune': 'Pune - East Zone',
        'west-pune': 'Pune - West Zone',
        'north-pune': 'Pune - North Zone',
        'south-pune': 'Pune - South Zone',
      };
      const mappedLocation = zoneMap[zone];
      if (mappedLocation) {
        setLocationFilter(mappedLocation);
      }
    }
    
    // Check for location parameter (from homepage search)
    const locationParam = params.get('location');
    if (locationParam && locationParam !== 'all') {
      setLocationFilter(locationParam);
    }
  }, [location]);

  // Reset BHK filter when switching to non-residential property types
  useEffect(() => {
    if (typeFilter !== "all" && typeFilter !== "Flat" && typeFilter !== "Rental") {
      setBhkFilter("all");
    }
  }, [typeFilter]);

  // Parse budget filter to min/max price in lakhs (1L = 100000)
  const getBudgetRange = (budget: string): { minPrice?: number; maxPrice?: number } => {
    if (budget === "all") return {};
    
    const ranges: Record<string, { minPrice?: number; maxPrice?: number }> = {
      "0-50": { minPrice: 0, maxPrice: 50 * 100000 },
      "50-75": { minPrice: 50 * 100000, maxPrice: 75 * 100000 },
      "75-100": { minPrice: 75 * 100000, maxPrice: 100 * 100000 },
      "100-150": { minPrice: 100 * 100000, maxPrice: 150 * 100000 },
      "150-200": { minPrice: 150 * 100000, maxPrice: 200 * 100000 },
      "200-300": { minPrice: 200 * 100000, maxPrice: 300 * 100000 },
      "300-plus": { minPrice: 300 * 100000 },
    };
    
    return ranges[budget] || {};
  };

  const budgetRange = getBudgetRange(budgetFilter);
  const bedroomsValue = bhkFilter !== "all" ? parseInt(bhkFilter) : undefined;

  // Fetch properties from database
  const { data: properties = [], isLoading } = trpc.properties.search.useQuery({
    location: locationFilter !== "all" ? locationFilter : undefined,
    propertyType: typeFilter !== "all" ? typeFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    minPrice: budgetRange.minPrice,
    maxPrice: budgetRange.maxPrice,
    bedrooms: bedroomsValue,
  });

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 text-foreground">Our Properties</h1>
            <p className="text-xl text-muted-foreground">
              Explore our curated selection of properties across India and international markets
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-background border-b">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
            <div className="flex-1 w-full md:w-auto">
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  
                  {/* Pune Zones */}
                  <SelectItem value="Pune - East Zone">Pune - East Zone</SelectItem>
                  <SelectItem value="Pune - West Zone">Pune - West Zone</SelectItem>
                  <SelectItem value="Pune - North Zone">Pune - North Zone</SelectItem>
                  <SelectItem value="Pune - South Zone">Pune - South Zone</SelectItem>
                  <SelectItem value="Pune - Pimpri-Chinchwad">Pune - Pimpri-Chinchwad</SelectItem>
                  
                  {/* Major Indian Cities */}
                  <SelectItem value="Mumbai">Mumbai</SelectItem>
                  <SelectItem value="Delhi NCR">Delhi NCR</SelectItem>
                  <SelectItem value="Bangalore">Bangalore</SelectItem>
                  <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                  <SelectItem value="Chennai">Chennai</SelectItem>
                  <SelectItem value="Kolkata">Kolkata</SelectItem>
                  <SelectItem value="Ahmedabad">Ahmedabad</SelectItem>
                  <SelectItem value="Surat">Surat</SelectItem>
                  <SelectItem value="Jaipur">Jaipur</SelectItem>
                  <SelectItem value="Lucknow">Lucknow</SelectItem>
                  <SelectItem value="Nagpur">Nagpur</SelectItem>
                  <SelectItem value="Indore">Indore</SelectItem>
                  <SelectItem value="Thane">Thane</SelectItem>
                  <SelectItem value="Bhopal">Bhopal</SelectItem>
                  <SelectItem value="Visakhapatnam">Visakhapatnam</SelectItem>
                  <SelectItem value="Patna">Patna</SelectItem>
                  <SelectItem value="Vadodara">Vadodara</SelectItem>
                  <SelectItem value="Ghaziabad">Ghaziabad</SelectItem>
                  <SelectItem value="Ludhiana">Ludhiana</SelectItem>
                  
                  {/* International */}
                  <SelectItem value="Dubai, UAE">Dubai, UAE</SelectItem>
                  <SelectItem value="Abu Dhabi, UAE">Abu Dhabi, UAE</SelectItem>
                  <SelectItem value="Sharjah, UAE">Sharjah, UAE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 w-full md:w-auto">
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
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 w-full md:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Ready">Ready to Move</SelectItem>
                  <SelectItem value="Under-Construction">Under Construction</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 w-full md:w-auto">
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
            </div>

            {/* Only show BHK filter for Flat and Rental property types */}
            {(typeFilter === "all" || typeFilter === "Flat" || typeFilter === "Rental") && (
              <div className="flex-1 w-full md:w-auto">
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
            )}
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-16 bg-background">
        <div className="container">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-20">
              <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-2xl font-semibold mb-2">No Properties Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters to see more results
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 text-muted-foreground">
                Showing {properties.length} {properties.length === 1 ? "property" : "properties"}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div
                      className="h-48 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${property.imageUrl || "/images/hero-building.jpg"})`,
                      }}
                    />
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant={property.status === "Ready" ? "default" : "secondary"}>
                          {property.status}
                        </Badge>
                        <Badge variant="outline">{property.propertyType}</Badge>
                      </div>
                      <CardTitle className="text-xl">{property.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2" />
                          {property.area ? `${property.area}, ${property.location}` : property.location}
                        </div>
                        {property.area_sqft && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Ruler className="h-4 w-4 mr-2" />
                            {property.area_sqft} sq.ft
                          </div>
                        )}
                        {property.builder && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Building2 className="h-4 w-4 mr-2" />
                            {property.builder}
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center text-lg font-bold text-primary">
                            <IndianRupee className="h-5 w-5 mr-1" />
                            {property.priceLabel || `₹${(Number(property.price) / 100000).toFixed(0)}L`}
                          </div>
                          <Button size="sm" asChild>
                            <Link href="/contact">Inquire</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-6">Can't Find What You're Looking For?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Let us know your requirements and we'll find the perfect property for you.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
