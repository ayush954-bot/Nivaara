import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp, Building2 } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

interface Zone {
  id: string;
  name: string;
  color: string;
  properties: number;
  avgPrice: string;
  growth: string;
  areas: string[];
}

export default function InteractivePuneMap() {
  const { data: allProperties = [] } = trpc.properties.list.useQuery();
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  // Calculate property counts for each zone from database
  const getZonePropertyCount = (areas: string[]) => {
    return allProperties.filter(property => {
      const location = property.location.toLowerCase();
      const area = property.area?.toLowerCase() || "";
      return areas.some(zoneArea => 
        location.includes(zoneArea.toLowerCase()) || 
        area.includes(zoneArea.toLowerCase())
      );
    }).length;
  };

  const puneZones: Zone[] = [
    {
      id: "east",
      name: "East Pune",
      color: "bg-blue-500",
      properties: getZonePropertyCount(["Kharadi", "Viman Nagar", "Wagholi", "Hadapsar"]),
      avgPrice: "₹85L - ₹1.5Cr",
      growth: "+12%",
      areas: ["Kharadi", "Viman Nagar", "Wagholi", "Hadapsar"],
    },
    {
      id: "west",
      name: "West Pune",
      color: "bg-green-500",
      properties: getZonePropertyCount(["Hinjewadi", "Baner", "Wakad", "Pimple Saudagar"]),
      avgPrice: "₹95L - ₹2Cr",
      growth: "+15%",
      areas: ["Hinjewadi", "Baner", "Wakad", "Pimple Saudagar"],
    },
    {
      id: "north",
      name: "North Pune",
      color: "bg-purple-500",
      properties: getZonePropertyCount(["Aundh", "Pimpri-Chinchwad", "Ravet", "Moshi"]),
      avgPrice: "₹75L - ₹1.2Cr",
      growth: "+10%",
      areas: ["Aundh", "Pimpri-Chinchwad", "Ravet", "Moshi"],
    },
    {
      id: "south",
      name: "South Pune",
      color: "bg-amber-500",
      properties: getZonePropertyCount(["Undri", "Kondhwa", "Wanowrie", "Katraj"]),
      avgPrice: "₹80L - ₹1.3Cr",
      growth: "+11%",
      areas: ["Undri", "Kondhwa", "Wanowrie", "Katraj"],
    },
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container">
        <h2 className="text-4xl font-bold text-center mb-4 text-foreground">
          Explore Pune by Zones
        </h2>
        <p className="text-center text-muted-foreground mb-12">
          Click on any zone to discover properties and market insights
        </p>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Interactive Map */}
          <div className="relative">
            <div className="aspect-square max-w-md mx-auto relative">
              {/* Map Container */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full">
                  {/* East Pune */}
                  <button
                    onClick={() => setSelectedZone(puneZones[0])}
                    className={`absolute top-1/4 right-0 ${puneZones[0].color} text-white rounded-lg p-4 shadow-lg hover:scale-110 transition-all duration-300 hover:shadow-2xl`}
                    style={{ width: "45%", height: "45%" }}
                  >
                    <div className="text-sm font-semibold mb-1">East Pune</div>
                    <div className="text-xs">{puneZones[0].properties} Properties</div>
                  </button>

                  {/* West Pune */}
                  <button
                    onClick={() => setSelectedZone(puneZones[1])}
                    className={`absolute top-1/4 left-0 ${puneZones[1].color} text-white rounded-lg p-4 shadow-lg hover:scale-110 transition-all duration-300 hover:shadow-2xl`}
                    style={{ width: "45%", height: "45%" }}
                  >
                    <div className="text-sm font-semibold mb-1">West Pune</div>
                    <div className="text-xs">{puneZones[1].properties} Properties</div>
                  </button>

                  {/* North Pune */}
                  <button
                    onClick={() => setSelectedZone(puneZones[2])}
                    className={`absolute bottom-1/4 left-0 ${puneZones[2].color} text-white rounded-lg p-4 shadow-lg hover:scale-110 transition-all duration-300 hover:shadow-2xl`}
                    style={{ width: "45%", height: "45%" }}
                  >
                    <div className="text-sm font-semibold mb-1">North Pune</div>
                    <div className="text-xs">{puneZones[2].properties} Properties</div>
                  </button>

                  {/* South Pune */}
                  <button
                    onClick={() => setSelectedZone(puneZones[3])}
                    className={`absolute bottom-1/4 right-0 ${puneZones[3].color} text-white rounded-lg p-4 shadow-lg hover:scale-110 transition-all duration-300 hover:shadow-2xl`}
                    style={{ width: "45%", height: "45%" }}
                  >
                    <div className="text-sm font-semibold mb-1">South Pune</div>
                    <div className="text-xs">{puneZones[3].properties} Properties</div>
                  </button>

                  {/* Center Label */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="text-2xl font-bold text-primary">PUNE</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              {puneZones.map((zone) => (
                <div key={zone.id} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${zone.color}`} />
                  <span className="text-sm">{zone.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Zone Details */}
          <div>
            {selectedZone ? (
              <Card className="animate-scale-in">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-12 h-12 rounded-lg ${selectedZone.color} flex items-center justify-center`}>
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{selectedZone.name}</h3>
                      <p className="text-muted-foreground">Real Estate Market</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        <span className="font-medium">Available Properties</span>
                      </div>
                      <span className="text-2xl font-bold text-primary">
                        {selectedZone.properties}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <span className="font-medium">YoY Growth</span>
                      </div>
                      <span className="text-xl font-bold text-green-500">
                        {selectedZone.growth}
                      </span>
                    </div>

                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <div className="font-medium mb-2">Average Price Range</div>
                      <div className="text-2xl font-bold text-primary">
                        {selectedZone.avgPrice}
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold mb-3">Popular Areas</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedZone.areas.map((area) => (
                        <Badge key={area} variant="outline">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button asChild className="w-full">
                    <Link href={`/properties?location=${selectedZone.areas[0].toLowerCase()}`}>
                      View Properties in {selectedZone.name}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <MapPin className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Select a Zone</h3>
                  <p className="text-muted-foreground">
                    Click on any zone on the map to view detailed information and available properties
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="text-center mt-12">
          <Button size="lg" asChild variant="outline">
            <Link href="/locations">View All Locations & Details</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
