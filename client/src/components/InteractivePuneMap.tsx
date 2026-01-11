import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp, Building2 } from "lucide-react";
import { Link } from "wouter";

interface Zone {
  id: string;
  name: string;
  color: string;
  properties: number;
  avgPrice: string;
  growth: string;
  areas: string[];
}

const puneZones: Zone[] = [
  {
    id: "east",
    name: "East Pune",
    color: "bg-blue-500",
    properties: 150,
    avgPrice: "₹85L - ₹1.5Cr",
    growth: "+12%",
    areas: ["Kharadi", "Viman Nagar", "Wagholi", "Hadapsar"],
  },
  {
    id: "west",
    name: "West Pune",
    color: "bg-green-500",
    properties: 180,
    avgPrice: "₹95L - ₹2Cr",
    growth: "+15%",
    areas: ["Hinjewadi", "Baner", "Wakad", "Pimple Saudagar"],
  },
  {
    id: "north",
    name: "North Pune",
    color: "bg-purple-500",
    properties: 120,
    avgPrice: "₹75L - ₹1.2Cr",
    growth: "+10%",
    areas: ["Aundh", "Pimpri-Chinchwad", "Ravet", "Moshi"],
  },
  {
    id: "south",
    name: "South Pune",
    color: "bg-amber-500",
    properties: 140,
    avgPrice: "₹90L - ₹1.8Cr",
    growth: "+13%",
    areas: ["Undri", "Kondhwa", "Katraj", "Wanowrie"],
  },
];

export default function InteractivePuneMap() {
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  return (
    <section className="py-16 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Explore Pune by Zones
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Click on any zone to discover properties and market insights
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Interactive Map */}
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-2xl p-8 border-2 border-border">
              {/* Simplified Pune Map Grid */}
              <div className="grid grid-cols-2 gap-4 h-full">
                {puneZones.map((zone) => (
                  <button
                    key={zone.id}
                    onClick={() => setSelectedZone(zone)}
                    className={`${zone.color} hover:opacity-90 rounded-xl p-6 text-white font-bold text-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl relative overflow-hidden group ${
                      selectedZone?.id === zone.id ? "ring-4 ring-primary scale-105" : ""
                    }`}
                  >
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <div className="relative z-10">
                      <div className="text-2xl font-bold mb-2">{zone.name}</div>
                      <div className="text-sm opacity-90">{zone.properties} Properties</div>
                    </div>
                    <MapPin className="absolute bottom-3 right-3 h-8 w-8 opacity-50" />
                  </button>
                ))}
              </div>

              {/* Center Label */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 px-6 py-3 rounded-full shadow-xl border-2 border-primary">
                <span className="font-bold text-lg text-foreground">PUNE</span>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              {puneZones.map((zone) => (
                <div key={zone.id} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${zone.color}`} />
                  <span className="text-sm font-medium text-muted-foreground">
                    {zone.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Zone Details */}
          <div>
            {selectedZone ? (
              <Card className="shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">
                        {selectedZone.name}
                      </h3>
                      <Badge className={`${selectedZone.color} text-white`}>
                        {selectedZone.properties} Properties Available
                      </Badge>
                    </div>
                    <div className={`p-3 rounded-full ${selectedZone.color} bg-opacity-10`}>
                      <MapPin className="h-6 w-6 text-current" />
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        <span className="font-medium">Average Price</span>
                      </div>
                      <span className="font-bold text-lg">{selectedZone.avgPrice}</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <span className="font-medium">YoY Growth</span>
                      </div>
                      <span className="font-bold text-lg text-green-500">
                        {selectedZone.growth}
                      </span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-foreground mb-3">Popular Areas:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedZone.areas.map((area) => (
                        <Badge key={area} variant="outline">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button asChild className="w-full" size="lg">
                    <Link href={`/properties?location=${selectedZone.id}`}>
                      View Properties in {selectedZone.name}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-xl">
                <CardContent className="p-12 text-center">
                  <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Select a Zone
                  </h3>
                  <p className="text-muted-foreground">
                    Click on any zone on the map to view detailed information and available properties
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="text-center mt-10">
          <Button size="lg" variant="outline" asChild>
            <Link href="/locations">View All Locations & Details</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
