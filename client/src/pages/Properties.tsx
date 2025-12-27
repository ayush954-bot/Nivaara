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
import { Building2, MapPin, Ruler, IndianRupee, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Properties() {
  const [locationFilter, setLocationFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch properties from database
  const { data: properties = [], isLoading } = trpc.properties.search.useQuery({
    location: locationFilter !== "all" ? locationFilter : undefined,
    propertyType: typeFilter !== "all" ? typeFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
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
                  <SelectItem value="pune-east">Pune - East Zone</SelectItem>
                  <SelectItem value="pune-west">Pune - West Zone</SelectItem>
                  <SelectItem value="pune-north">Pune - North Zone</SelectItem>
                  <SelectItem value="pune-south">Pune - South Zone</SelectItem>
                  <SelectItem value="mumbai">Mumbai</SelectItem>
                  <SelectItem value="delhi">Delhi NCR</SelectItem>
                  <SelectItem value="bangalore">Bangalore</SelectItem>
                  <SelectItem value="dubai">Dubai, UAE</SelectItem>
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
