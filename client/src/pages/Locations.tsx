import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapView } from "@/components/Map";
import { MapPin, Globe } from "lucide-react";

export default function Locations() {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const puneZones = {
    East: {
      color: "#D4AF37",
      areas: ["Kharadi", "Viman Nagar", "Wagholi", "Kalyani Nagar", "Hadapsar", "Magarpatta"],
      center: { lat: 18.5515, lng: 73.9474 },
    },
    West: {
      color: "#C49A3A",
      areas: ["Hinjewadi", "Balewadi", "Baner", "Aundh", "Wakad", "Pimple Saudagar"],
      center: { lat: 18.5679, lng: 73.7797 },
    },
    North: {
      color: "#B8903D",
      areas: ["Pimpri-Chinchwad", "Bhosari", "Chakan", "Moshi", "Akurdi"],
      center: { lat: 18.6298, lng: 73.7997 },
    },
    South: {
      color: "#AA8540",
      areas: ["Katraj", "Kondhwa", "Undri", "Wanowrie", "Bibwewadi", "Dhankawadi"],
      center: { lat: 18.4574, lng: 73.8567 },
    },
  };

  const internationalMarkets = [
    {
      name: "Dubai, UAE",
      description: "Premium residential and commercial properties in Dubai's prime locations",
      icon: "🇦🇪",
    },
  ];

  const majorIndianCities = [
    { name: "Mumbai", state: "Maharashtra" },
    { name: "Delhi NCR", state: "Delhi" },
    { name: "Bangalore", state: "Karnataka" },
    { name: "Hyderabad", state: "Telangana" },
    { name: "Chennai", state: "Tamil Nadu" },
    { name: "Kolkata", state: "West Bengal" },
    { name: "Ahmedabad", state: "Gujarat" },
    { name: "Surat", state: "Gujarat" },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 text-foreground">Our Locations</h1>
            <p className="text-xl text-muted-foreground">
              Serving clients across India and international markets with local expertise and global reach
            </p>
          </div>
        </div>
      </section>

      {/* International Markets */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <Globe className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-4xl font-bold mb-4 text-foreground">International Markets</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Expanding our expertise beyond India to serve clients in premium international real estate markets
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {internationalMarkets.map((market, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-5xl mb-4">{market.icon}</div>
                  <CardTitle className="text-2xl">{market.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{market.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* India-Wide Operations */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Across India</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              We provide comprehensive real estate solutions in major cities across India
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {majorIndianCities.map((city, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <MapPin className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-lg">{city.name}</h3>
                  <p className="text-sm text-muted-foreground">{city.state}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pune Zones - Interactive Map */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Pune - Our Home Base</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Comprehensive coverage across all zones of Pune with deep local market expertise
            </p>
          </div>

          {/* Zone Selector */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-4xl mx-auto">
            {Object.entries(puneZones).map(([zone, data]) => (
              <Button
                key={zone}
                variant={selectedZone === zone ? "default" : "outline"}
                className="h-auto py-4"
                onClick={() => setSelectedZone(selectedZone === zone ? null : zone)}
              >
                <div className="text-center">
                  <div className="font-bold text-lg mb-1">{zone} Pune</div>
                  <div className="text-xs opacity-80">{data.areas.length} areas</div>
                </div>
              </Button>
            ))}
          </div>

          {/* Interactive Map */}
          <div className="rounded-lg overflow-hidden shadow-lg h-[500px] mb-8">
            <MapView
              onMapReady={(map: any) => {
                // Center on Pune
                map.setCenter({ lat: 18.5204, lng: 73.8567 });
                map.setZoom(11);

                // Add zone markers and boundaries
                Object.entries(puneZones).forEach(([zone, data]) => {
                  // Add marker for zone center
                  const marker = new (window as any).google.maps.Marker({
                    position: data.center,
                    map: map,
                    title: `${zone} Pune`,
                    label: {
                      text: zone[0],
                      color: "white",
                      fontSize: "16px",
                      fontWeight: "bold",
                    },
                    icon: {
                      path: (window as any).google.maps.SymbolPath.CIRCLE,
                      scale: 25,
                      fillColor: data.color,
                      fillOpacity: 0.8,
                      strokeColor: "#1A1A1A",
                      strokeWeight: 2,
                    },
                  });

                  // Add info window
                  const infoWindow = new (window as any).google.maps.InfoWindow({
                    content: `
                      <div style="padding: 10px; min-width: 200px;">
                        <h3 style="font-weight: bold; margin-bottom: 8px; color: #1A1A1A;">${zone} Pune</h3>
                        <p style="margin-bottom: 8px; color: #666;">Key Areas:</p>
                        <ul style="margin: 0; padding-left: 20px; color: #666;">
                          ${data.areas.map(area => `<li>${area}</li>`).join('')}
                        </ul>
                      </div>
                    `,
                  });

                  marker.addListener("click", () => {
                    infoWindow.open(map, marker);
                  });
                });
              }}
            />
          </div>

          {/* Zone Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(puneZones).map(([zone, data]) => (
              <Card
                key={zone}
                className={`hover:shadow-lg transition-all cursor-pointer ${
                  selectedZone === zone ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedZone(selectedZone === zone ? null : zone)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{zone} Pune</span>
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: data.color }}
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground mb-3">
                      Key Areas:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {data.areas.map((area) => (
                        <Badge key={area} variant="secondary">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-6">Looking for Properties in Your Area?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Whether you're in Pune, across India, or exploring international markets, we're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <a href="/properties">Browse Properties</a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              <a href="/contact">Contact Us</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
