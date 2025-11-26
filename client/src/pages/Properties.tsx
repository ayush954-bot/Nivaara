import { useState } from "react";
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
import { Building2, MapPin, Ruler, IndianRupee } from "lucide-react";
import { Link } from "wouter";

export default function Properties() {
  const [locationFilter, setLocationFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Sample property data
  const properties = [
    {
      id: 1,
      title: "Luxury 3BHK Apartment",
      location: "Kharadi",
      type: "Flat",
      status: "Ready",
      price: "₹95 Lakhs",
      area: "1450 sq.ft",
      image: "/images/luxury-home.jpg",
      builder: "Premium Developers",
    },
    {
      id: 2,
      title: "Modern 2BHK Flat",
      location: "Viman Nagar",
      type: "Flat",
      status: "Under-Construction",
      price: "₹72 Lakhs",
      area: "1100 sq.ft",
      image: "/images/hero-building.jpg",
      builder: "Skyline Builders",
    },
    {
      id: 3,
      title: "Commercial Office Space",
      location: "Hinjewadi",
      type: "Office",
      status: "Ready",
      price: "₹1.2 Crores",
      area: "2500 sq.ft",
      image: "/images/office-interior.jpg",
      builder: "Corporate Realty",
    },
    {
      id: 4,
      title: "Spacious 4BHK Penthouse",
      location: "Koregaon Park",
      type: "Flat",
      status: "Ready",
      price: "₹2.5 Crores",
      area: "3200 sq.ft",
      image: "/images/luxury-home.jpg",
      builder: "Elite Constructions",
    },
    {
      id: 5,
      title: "Retail Shop Space",
      location: "Baner",
      type: "Shop",
      status: "Ready",
      price: "₹85 Lakhs",
      area: "800 sq.ft",
      image: "/images/office-interior.jpg",
      builder: "Retail Spaces Ltd",
    },
    {
      id: 6,
      title: "Residential Plot",
      location: "Wagholi",
      type: "Land",
      status: "Ready",
      price: "₹45 Lakhs",
      area: "1200 sq.ft",
      image: "/images/hero-building.jpg",
      builder: "Land Developers",
    },
  ];

  const filteredProperties = properties.filter((property) => {
    if (locationFilter !== "all" && property.location !== locationFilter) return false;
    if (typeFilter !== "all" && property.type !== typeFilter) return false;
    if (statusFilter !== "all" && property.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 text-foreground">Properties</h1>
            <p className="text-xl text-muted-foreground">
              Discover your perfect property from our curated selection across Pune
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-background border-b">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full md:w-auto">
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="Kharadi">Kharadi</SelectItem>
                  <SelectItem value="Viman Nagar">Viman Nagar</SelectItem>
                  <SelectItem value="Wagholi">Wagholi</SelectItem>
                  <SelectItem value="Kalyani Nagar">Kalyani Nagar</SelectItem>
                  <SelectItem value="Hadapsar">Hadapsar</SelectItem>
                  <SelectItem value="Magarpatta">Magarpatta</SelectItem>
                  <SelectItem value="Koregaon Park">Koregaon Park</SelectItem>
                  <SelectItem value="Hinjewadi">Hinjewadi</SelectItem>
                  <SelectItem value="Balewadi">Balewadi</SelectItem>
                  <SelectItem value="Baner">Baner</SelectItem>
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
                  <SelectItem value="Office">Office</SelectItem>
                  <SelectItem value="Shop">Shop</SelectItem>
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

            <Button
              variant="outline"
              onClick={() => {
                setLocationFilter("all");
                setTypeFilter("all");
                setStatusFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="mb-6">
            <p className="text-muted-foreground">
              Showing {filteredProperties.length} of {properties.length} properties
            </p>
          </div>

          {filteredProperties.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">No properties found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters to see more results
              </p>
              <Button
                onClick={() => {
                  setLocationFilter("all");
                  setTypeFilter("all");
                  setStatusFilter("all");
                }}
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map((property) => (
                <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div
                    className="h-48 bg-cover bg-center"
                    style={{ backgroundImage: `url(${property.image})` }}
                  />
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-xl">{property.title}</CardTitle>
                      <Badge variant={property.status === "Ready" ? "default" : "secondary"}>
                        {property.status}
                      </Badge>
                    </div>
                    <div className="flex items-center text-muted-foreground text-sm">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.location}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm">
                          <Ruler className="h-4 w-4 mr-2 text-primary" />
                          <span>{property.area}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Building2 className="h-4 w-4 mr-2 text-primary" />
                          <span>{property.type}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-2xl font-bold text-primary">
                        <IndianRupee className="h-6 w-6" />
                        <span>{property.price.replace("₹", "")}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">By {property.builder}</p>
                      <Button className="w-full" asChild>
                        <Link href="/contact">Enquire Now</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-6 text-foreground">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            We have access to many more properties that aren't listed online. Contact us with your requirements and we'll find the perfect match.
          </p>
          <Button size="lg" asChild>
            <Link href="/contact">Contact Our Team</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
